import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMascotas } from "../../../services/mascotasService/mascotaService";
import type { Mascota } from "../../../services/mascotasService/mascotaService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Calendar, User, Edit, Eye, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { deleteMascota } from "../../../services/mascotasService/mascotaService";

type PetUI = {
  id: number;
  name: string;
  photo?: string | null;
  breed?: string | null;
  age?: number | null;
  gender?: string | null;
  weight?: string | null;
  color?: string | null;
  ownerId?: number | null;
  ownerName?: string | null;
  owner?: string | null;
  lastVisit?: string | null;
  microchip?: string | null;
  status?: string; // key used for labels/colors
  raw?: Mascota;
};

const statusLabels: Record<string, string> = {
  healthy: "Saludable",
  treatment: "En Tratamiento",
  vaccination: "Vacunación",
  sick: "Enfermo",
  unknown: "Desconocido",
  // also accept Spanish raw values mapping later
  saludable: "Saludable",
  tratamiento: "En Tratamiento",
  vacunacion: "Vacunación",
  enfermo: "Enfermo",
};

const statusColors: Record<string, string> = {
  healthy: "bg-emerald-100 text-emerald-700",
  treatment: "bg-yellow-100 text-yellow-700",
  vaccination: "bg-blue-100 text-blue-700",
  sick: "bg-red-100 text-red-700",
  unknown: "bg-gray-100 text-gray-700",
  // spanish keys
  saludable: "bg-emerald-100 text-emerald-700",
  tratamiento: "bg-yellow-100 text-yellow-700",
  vacunacion: "bg-blue-100 text-blue-700",
  enfermo: "bg-red-100 text-red-700",
};

export const MascotaTable = () => {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // UI filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await getMascotas();
        if (mounted) {
          setMascotas(data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Error al cargar mascotas");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Helper: map API Mascota -> PetUI used in the UI
  const mapToUI = (m: Mascota): PetUI => {
    const apiUrl = (import.meta.env.VITE_API_URL as string) || "";

    // Construcción robusta de la URL de la foto:
    // - si m.foto es una URL absoluta, usarla
    // - si no, preferir el endpoint por id: /mascotas/{id}/foto/view
    // - fallback a /files/{filename} si hay filename
    let photoUrl = "/placeholder.svg";
    const fileRef = m.foto ?? "";

    if (fileRef && /^https?:\/\//i.test(fileRef)) {
      // ya es una URL absoluta
      photoUrl = fileRef;
    } else if (typeof m.idMascota === "number" && !Number.isNaN(m.idMascota)) {
      // usar endpoint por id (según tu API: mascotas/{id}/foto/view)
      const cleanApi = apiUrl.replace(/\/$/, "");
      photoUrl = cleanApi
        ? `${cleanApi}/mascotas/${m.idMascota}/foto/view`
        : `/mascotas/${m.idMascota}/foto/view`;
    } else if (fileRef) {
      // fallback por filename si no hay id (o el backend expone por filename)
      const cleanApi = apiUrl.replace(/\/$/, "");
      photoUrl = cleanApi ? `${cleanApi}/files/${encodeURIComponent(fileRef)}` : `/files/${encodeURIComponent(fileRef)}`;
    }

    // const age = m.fechaNacimiento
    //     ? (() => {
    //             try {
    //                 const diff = Date.now() - new Date(m.fechaNacimiento).getTime();
    //                 return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    //             } catch {
    //                 return null;
    //             }
    //         })()
    //     : null;

    const rawEstado = (m.estado || "").toString().toLowerCase();
    const mapStatusKey = (s: string): string => {
        if (!s) return "unknown";
        if (s.includes("salud")) return "healthy";
        if (s.includes("trat") || s.includes("en tratamiento")) return "treatment";
        if (s.includes("vacun")) return "vaccination";
        if (s.includes("enfer") || s.includes("enfermo")) return "sick";
        if (["saludable", "tratamiento", "vacunacion", "enfermo"].includes(s))
            return s;
        return "unknown";
    };

    return {
        id: m.idMascota,
        name: m.nombre ?? `#${m.idMascota}`,
        photo: photoUrl,
        breed: m.raza ?? "-",
        age: m.edad ?? null,
        gender: m.genero ?? "-",
        weight: m.peso ?? "-", // <-- CAMBIO AQUÍ
        color: m.color ?? "-",
        ownerId: m.propietarioId ?? null,
        owner: m.propietarioId ? `ID ${m.propietarioId}` : "-",
        ownerName: m.propietarioNombre ?? null,
        lastVisit: m.notas ?? null,
        microchip: m.microchip ?? "-",
        status: mapStatusKey(rawEstado),
        raw: m,
    };
};

  // Derived list with filters applied
  const petsUI = useMemo(() => mascotas.map(mapToUI), [mascotas]);

  const filteredPets = useMemo(() => {
    return petsUI.filter((pet) => {
      // species filter: compare with raw.m.especie
      if (speciesFilter !== "all") {
        const especie = (pet.raw?.especie || "").toString().toLowerCase();
        if (especie !== speciesFilter.toLowerCase()) return false;
      }

      // status filter
      if (statusFilter !== "all") {
        // statusFilter may be keys like 'healthy' or 'saludable' from UI
        if (pet.status !== statusFilter && pet.status !== statusFilter.toLowerCase())
          return false;
      }

      // search term: nombre, raza, notas
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase();
        const hay =
          (pet.name || "").toLowerCase().includes(q) ||
          (pet.breed || "").toLowerCase().includes(q) ||
          (pet.owner || "").toLowerCase().includes(q) ||
          (pet.lastVisit || "").toLowerCase().includes(q);
        if (!hay) return false;
      }

      return true;
    });
  }, [petsUI, searchTerm, speciesFilter, statusFilter]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSpeciesFilter = (value: string) => {
    setSpeciesFilter(value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
  };

  const handleDelete = async (id: number) => {
    setActionError(null);
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingId == null) return;
    setActionLoading(true);
    try {
      // intentar eliminar vía API
      await deleteMascota(deletingId);
      // eliminar del estado local
      setMascotas((prev) => prev.filter((m) => m.idMascota !== deletingId));
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (err: any) {
      // fallback: eliminar localmente si la API falla (o mostrar error)
      console.error(err);
      setActionError(err?.message || "No se pudo eliminar la mascota");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando mascotas...</div>;
  }

  if (error) {
    return <div role="alert">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, raza o propietario..."
                  value={searchTerm}
                  onChange={(e) => handleSearch((e.target as HTMLInputElement).value)}
                  className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <Select value={speciesFilter} onValueChange={handleSpeciesFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Todas las especies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las especies</SelectItem>
                <SelectItem value="perro">Perros</SelectItem>
                <SelectItem value="gato">Gatos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="healthy">Saludable</SelectItem>
                <SelectItem value="treatment">En Tratamiento</SelectItem>
                <SelectItem value="vaccination">Vacunación</SelectItem>
                <SelectItem value="sick">Enfermo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de mascotas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPets.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {searchTerm || speciesFilter !== "all" || statusFilter !== "all"
              ? "No se encontraron mascotas con los filtros aplicados"
              : "No hay mascotas registradas"}
          </div>
        ) : (
          filteredPets.map((pet) => (
            <Card
              key={pet.id}
              className="border-0 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={pet.photo || "/placeholder.svg"} alt={pet.name}  className="object-cover"/>
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg ">
                      {(pet.name && pet.name.charAt(0)) || "-"} 
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">{pet.name}</h3>
                      <Badge className={statusColors[pet.status || "unknown"]}>
                        {statusLabels[pet.status || "unknown"] ||
                          statusLabels["unknown"]}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                        <p className="font-medium">{pet.breed} | {pet.age} años</p>

                      <p>
                        {pet.gender} | {pet.weight} kg
                      </p>

                      <p className="text-emerald-600">{pet.color}</p>

                      <div className="flex items-center gap-1 mt-2">
                        <User className="h-3 w-3" />
                          <Link
                            to={`/propietarios/detalles/${pet.ownerId}`}
                            className="hover:text-emerald-600 hover:underline"
                          >
                            {pet.ownerName}
                          </Link>
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Última visita:{" "}
                          {pet.lastVisit
                            ? new Date(pet.lastVisit).toLocaleDateString("es-ES")
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Microchip: {pet.microchip}</span>

                  <div className="flex items-center gap-2">
                    <Link to={`/mascotas/detalles/${pet.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    <Link to={`/mascotas/editar/${pet.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>

                    {actionLoading && deletingId === pet.id ? (
                      <Button variant="ghost" size="sm" disabled className="text-red-500">
                        <Spinner className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pet.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

        {/* Diálogo de confirmación para eliminar mascota */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) {
              setDeletingId(null);
              setActionError(null);
            }
          }}
          onConfirm={confirmDelete}
          title="Eliminar Mascota"
          description={
            deletingId
              ? `¿Estás seguro de que deseas eliminar la mascota #${deletingId}? Esta acción no se puede deshacer.`
              : "¿Estás seguro?"
          }
          isLoading={actionLoading}
        />

        {actionError && (
          <div className="text-sm text-red-600">{actionError}</div>
        )}
    </div>
  );
};

export default MascotaTable;


