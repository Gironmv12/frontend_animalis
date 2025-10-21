
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAllRegistrosHistorial } from "@/services/historialService/historialService";
import type { HistorialRecord } from "@/services/historialService/historialService";
import { getMascotaById } from "@/services/mascotasService/mascotaService";
import { Search, Calendar, Syringe, Stethoscope, Pill, Eye, Edit, AlertCircle, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link } from "react-router-dom";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { deleteHistorial } from "@/services/historialService/historialService";

const HistorialMedico = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historial, setHistorial] = useState<HistorialRecord[] | null>(null);

  // UI states para la lista y filtros (siguiendo el diseño suministrado)
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
  const [allRecords, setAllRecords] = useState<any[]>([]);

  // Cargar todos los registros al montar la página
  const loadAll = async () => {
    setError(null);
    setLoading(true);
    try {
      const registros = await getAllRegistrosHistorial();
      setHistorial(registros);

      const mapped = await Promise.all(
        registros.map(async (r) => {
          let petName = "-";
          let petPhoto = undefined;
          let ownerName = "-";
          try {
            const m = await getMascotaById(r.mascotaId);
            petName = m.nombre ?? "-";
            petPhoto = m.foto ?? undefined;
            ownerName = m.propietarioNombre ?? (m.propietarioId ? String(m.propietarioId) : "-");
          } catch (e) {
            // ignore
          }

          const mapType = (t: string) => {
            const lower = t?.toLowerCase?.() ?? "";
            if (lower.includes("vacun" ) || lower === "vacuna") return "vaccination";
            if (lower.includes("trat" ) || lower === "tratamiento") return "treatment";
            if (lower.includes("cons" ) || lower === "consulta") return "consultation";
            if (lower.includes("cirug" ) || lower === "cirugia") return "surgery";
            return "consultation";
          };

          const mapStatus = (s: string) => {
            const lower = s?.toLowerCase?.() ?? "";
            if (lower.includes("complet" ) || lower === "completo") return "completed";
            if (lower.includes("prog" ) || lower === "en progreso" || lower === "en_progreso") return "in-progress";
            if (lower.includes("prog") || lower === "programado") return "scheduled";
            if (lower.includes("cancel") || lower === "cancelado") return "cancelled";
            return "completed";
          };

          const mapUrgency = (u: string) => {
            const lower = u?.toLowerCase?.() ?? "";
            if (lower === "alta" || lower === "high") return "high";
            if (lower === "baja" || lower === "low") return "low";
            return "normal";
          };

          return {
            id: r.idHistorial,
            petId: r.mascotaId,
            petName,
            petPhoto,
            ownerName,
            type: mapType(r.tipoRegistro),
            title: r.titulo,
            description: r.descripcion ?? "",
            date: r.fechaAplicacion ? new Date(r.fechaAplicacion).toISOString().slice(0, 10) : null,
            nextDate: r.proximaFecha ? new Date(r.proximaFecha).toISOString().slice(0, 10) : null,
            veterinarian: r.veterinarioId ? `ID ${r.veterinarioId}` : "",
            status: mapStatus(r.estado ?? ""),
            urgency: mapUrgency(r.urgencia ?? ""),
          };
        }),
      );

  setAllRecords(mapped);
  setFilteredRecords(mapped);
    } catch (err: any) {
      setError(err?.message || "Error al obtener historial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Agrupar registros por mascota (se recalcula cuando cambian los filteredRecords)
  const groupedRecords = filteredRecords.reduce(
    (acc, record) => {
      const key = String(record.petId);
      if (!acc[key]) {
        acc[key] = {
          petName: record.petName,
          petPhoto: record.petPhoto,
          ownerName: record.ownerName,
          records: [],
        };
      }
      acc[key].records.push(record);
      return acc;
    },
    {} as Record<string, { petName: string; petPhoto?: string; ownerName: string; records: any[] }>,
  );

  const applyFilters = (search: string, type: string, status: string) => {
  // Usar la colección completa como fuente para los filtros (evita que los filtros se apliquen sobre sí mismos)
  let filtered = [...allRecords];

    if (search) {
      filtered = filtered.filter(
        (record) =>
          (record.petName || "").toLowerCase().includes(search.toLowerCase()) ||
          (record.title || "").toLowerCase().includes(search.toLowerCase()) ||
          (record.ownerName || "").toLowerCase().includes(search.toLowerCase()) ||
          (record.veterinarian || "").toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (type !== "all") {
      filtered = filtered.filter((record) => record.type === type);
    }

    if (status !== "all") {
      filtered = filtered.filter((record) => record.status === status);
    }

    setFilteredRecords(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters(value, typeFilter, statusFilter);
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    applyFilters(searchTerm, value, statusFilter);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    applyFilters(searchTerm, typeFilter, value);
  };

  const handleDelete = (idToDelete: number) => {
    // Abrir diálogo y almacenar id a eliminar
    setDeleteId(idToDelete);
    setDeleteDialogOpen(true);
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (deleteId == null) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteHistorial(deleteId);
      const nextAll = allRecords.filter((r) => r.id !== deleteId);
      setAllRecords(nextAll);
      const nextFiltered = filteredRecords.filter((r) => r.id !== deleteId);
      setFilteredRecords(nextFiltered);
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (err: any) {
      setDeleteError(err?.message || "Error al eliminar registro");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading && (
        <Card className="border-0 shadow-sm">
          <CardContent>Buscando registros...</CardContent>
        </Card>
      )}
      {!loading && error && (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-sm text-red-600">{error}</CardContent>
        </Card>
      )}
      {historial && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historial Médico</h1>
            <p className="text-gray-600 mt-2">Registros médicos de todas las mascotas</p>
          </div>
          <Link to="/historialMedico/crear">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Registro
            </Button>
          </Link>
        </div>
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
                      placeholder="Buscar por mascota, tratamiento, propietario o veterinario..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={handleTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="vaccination">Vacunas</SelectItem>
                    <SelectItem value="treatment">Tratamientos</SelectItem>
                    <SelectItem value="consultation">Consultas</SelectItem>
                    <SelectItem value="surgery">Cirugías</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="in-progress">En Progreso</SelectItem>
                    <SelectItem value="scheduled">Programado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista agrupada por mascota */}
          <div className="space-y-6">
            {Object.keys(groupedRecords).length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="text-center py-12 text-gray-500">
                  {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                    ? "No se encontraron registros con los filtros aplicados"
                    : "No hay registros médicos"}
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedRecords).map((entry) => {
                const [petId, petData] = entry as [string, { petName: string; petPhoto?: string; ownerName: string; records: any[] }];
                return (
                <Card key={petId} className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={petData.petPhoto || "/placeholder.svg"} alt={petData.petName} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                          {petData.petName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{petData.petName}</CardTitle>
                        <p className="text-gray-600">Propietario: {petData.ownerName}</p>
                      </div>
                      <div className="ml-auto">
                        <Badge variant="outline">{petData.records.length} registros</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {petData.records
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((record: any) => {
                          const TypeIcon = record.type === "vaccination" ? Syringe : record.type === "treatment" ? Pill : Stethoscope;
                          const isUpcoming = record.nextDate && new Date(record.nextDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                          const typeColors: any = {
                            vaccination: "bg-blue-100 text-blue-800",
                            treatment: "bg-yellow-100 text-yellow-800",
                            consultation: "bg-green-100 text-green-800",
                            surgery: "bg-red-100 text-red-800",
                          };

                          const typeLabels: any = {
                            vaccination: "Vacuna",
                            treatment: "Tratamiento",
                            consultation: "Consulta",
                            surgery: "Cirugía",
                          };

                          const statusColors: any = {
                            completed: "bg-green-100 text-green-800",
                            "in-progress": "bg-yellow-100 text-yellow-800",
                            scheduled: "bg-blue-100 text-blue-800",
                            cancelled: "bg-red-100 text-red-800",
                          };

                          const statusLabels: any = {
                            completed: "Completado",
                            "in-progress": "En Progreso",
                            scheduled: "Programado",
                            cancelled: "Cancelado",
                          };

                          const urgencyColors: any = {
                            low: "bg-gray-100 text-gray-800",
                            normal: "bg-blue-100 text-blue-800",
                            high: "bg-red-100 text-red-800",
                          };

                          return (
                            <div
                              key={record.id}
                              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                        {/* Diálogo de confirmación para eliminar un registro */}
                        <DeleteConfirmDialog
                          open={deleteDialogOpen}
                          onOpenChange={(open) => {
                            setDeleteDialogOpen(open);
                            if (!open) setDeleteId(null);
                          }}
                          onConfirm={confirmDelete}
                          title="Eliminar registro"
                          description={deleteId ? `¿Eliminar el registro #${deleteId}? Esta acción no se puede deshacer.` : "¿Eliminar registro?"}
                          isLoading={deleteLoading}
                        />

                        {deleteError && <div className="text-sm text-red-600">{deleteError}</div>}
                              <div className="p-2 bg-white rounded-lg">
                                <TypeIcon className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={typeColors[record.type]}>{typeLabels[record.type]}</Badge>
                                  <Badge className={statusColors[record.status]}>{statusLabels[record.status]}</Badge>
                                  {record.urgency === "high" && (
                                    <Badge className={urgencyColors.high}>
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Urgente
                                    </Badge>
                                  )}
                                  {isUpcoming && (
                                    <Badge className="bg-orange-100 text-orange-800">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Próximo
                                    </Badge>
                                  )}
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-1">{record.title}</h4>
                                <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Fecha: {record.date ? new Date(record.date).toLocaleDateString("es-ES") : "-"}</span>
                                  </div>
                                  {record.nextDate && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>Próxima: {new Date(record.nextDate).toLocaleDateString("es-ES")}</span>
                                    </div>
                                  )}
                                  <span>Dr. {record.veterinarian}</span>
                                </div>
                              </div>
                                <div className="flex items-center gap-2">
                                <Link to={`/historialMedico/detalles/${record.id}`}>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Link to={`/historialMedico/editar/${record.id}`}>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(record.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialMedico;