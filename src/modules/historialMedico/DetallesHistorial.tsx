

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRegistrosHistorial, getAllRegistrosHistorial } from "@/services/historialService/historialService";
import type { HistorialRecord } from "@/services/historialService/historialService";
import { getMascotaById } from "@/services/mascotasService/mascotaService";
import type { Mascota } from "@/services/mascotasService/mascotaService";
import propietarioService from "@/services/propietarioService/propietarioService";
import type { Propietario } from "@/services/propietarioService/propietarioService";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User, Thermometer, Weight, Pill, FileText, Syringe, AlertCircle } from "lucide-react";
import veterinarioService from "@/services/veterinarioService/veterinarioService";
import type { Veterinario } from "@/services/veterinarioService/veterinarioService";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { deleteHistorial } from "@/services/historialService/historialService";
import { useNavigate } from "react-router-dom";

const typeColors: Record<string, string> = {
  vaccination: "bg-blue-100 text-blue-800",
  treatment: "bg-yellow-100 text-yellow-800",
  consultation: "bg-green-100 text-green-800",
  surgery: "bg-red-100 text-red-800",
};

const typeLabels: Record<string, string> = {
  vaccination: "Vacuna",
  treatment: "Tratamiento",
  consultation: "Consulta",
  surgery: "Cirugía",
};

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  scheduled: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  completed: "Completado",
  "in-progress": "En Progreso",
  scheduled: "Programado",
  cancelled: "Cancelado",
};

const urgencyColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-red-100 text-red-800",
};

const urgencyLabels: Record<string, string> = {
  low: "Baja",
  normal: "Normal",
  high: "Alta",
};

const DetallesHistorial = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<HistorialRecord | null>(null);
  const [mascota, setMascota] = useState<Mascota | null>(null);
  const [propietarioDetalle, setPropietarioDetalle] = useState<Propietario | null>(null);
  const [veterinarioDetalle, setVeterinarioDetalle] = useState<Veterinario | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const parsed = Number(id);
        if (isNaN(parsed)) {
          setError("Id inválido");
          return;
        }

        // Intentamos obtener registros por id (este endpoint puede devolver
        // todos los registros de una mascota o registros relacionados a un historial).
        let registros: HistorialRecord[] = [];
        try {
          registros = await getRegistrosHistorial(parsed);
        } catch (err) {
          // si /historiales/{id} no existe o falla, seguiremos con el fallback
          registros = [];
        }

        // Encontrar el registro por idHistorial dentro de los registros retornados
        let found: HistorialRecord | undefined = registros.find((r) => r.idHistorial === parsed);

        // Si no lo encontramos, puede suceder que el endpoint /historiales/{id}
        // devuelva todos los registros de la mascota (cuando 'id' es mascotaId).
        // En ese caso, si hay registros y su mascotaId === parsed, asumimos que
        // el usuario pasó el id de mascota y tomamos el primero (o mostramos lista).
        if (!found && registros.length === 1 && registros[0].mascotaId === parsed) {
          found = registros[0];
        }

        // Fallback adicional: buscar en todos los registros (GET /historiales)
        // para localizar un registro por su idHistorial cuando el endpoint por id
        // no lo devuelve.
        if (!found) {
          try {
            const all = await getAllRegistrosHistorial();
            found = all.find((r) => r.idHistorial === parsed);
          } catch (e) {
            // ignore
          }
        }

        if (!found) {
          setError("No se encontró el historial solicitado");
          return;
        }
        setRecord(found);
        try {
          const m = await getMascotaById(found.mascotaId);
          setMascota(m);
          // si la mascota tiene propietarioId, obtener detalle del propietario
          const propietarioId = (m as any)?.propietarioId ?? (found as any)?.propietarioId ?? null;
          if (propietarioId) {
            try {
              const detalle = await propietarioService.getDetalle(Number(propietarioId));
              setPropietarioDetalle(detalle.propietario);
            } catch (err) {
              // ignore propietario fetch error
            }
          }

          // si el registro trae veterinarioId, intentar resolver nombre
          const vetId = (found as any)?.veterinarioId ?? (found as any)?.veterinario ?? null;
          if (vetId) {
            try {
              const vet = await veterinarioService.getVeterinarioById(Number(vetId));
              setVeterinarioDetalle(vet);
            } catch (err) {
              // ignore
            }
          }
        } catch (e) {
          // ignore
        }
      } catch (err: any) {
        setError(err?.message || "Error al obtener detalles");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const confirmDelete = async () => {
    setDeleteError(null);
    setDeleteLoading(true);
    try {
      const idToDelete = record?.idHistorial ?? Number(id);
      if (!idToDelete) throw new Error("Id inválido");
      await deleteHistorial(Number(idToDelete));
      // después de eliminar, regresar al listado
      navigate("/historialMedico");
    } catch (err: any) {
      setDeleteError(err?.message || "Error al eliminar registro");
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Syringe className="h-5 w-5 text-emerald-600" />
                {record?.titulo ?? "Detalle del registro"}
              </CardTitle>
              <div className="flex items-center gap-2">
                {record?.tipo && (
                  <Badge className={typeColors[record.tipo] ?? "bg-gray-100 text-gray-800"}>
                    {typeLabels[record.tipo] ?? record.tipo}
                  </Badge>
                )}
                {record?.estado && (
                  <Badge className={statusColors[record.estado] ?? "bg-gray-100 text-gray-800"}>
                    {statusLabels[record.estado] ?? record.estado}
                  </Badge>
                )}
                {record?.urgencia === "high" && (
                  <Badge className={urgencyColors.high}>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {urgencyLabels.high}
                  </Badge>
                )}
                <button
                  className="ml-2 text-red-600 hover:text-red-800"
                  onClick={() => {
                    setDeleteDialogOpen(true);
                    setDeleteError(null);
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading && <div className="p-4">Cargando...</div>}
            {error && <div className="p-4 text-sm text-red-600">{error}</div>}

            {record && (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-700">{record.descripcion ?? "-"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Aplicación</p>
                      <p className="font-medium">{record.fechaAplicacion ? new Date(record.fechaAplicacion).toLocaleDateString("es-ES") : "-"}</p>
                    </div>
                  </div>
                  {record.proximaFecha && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-sm text-emerald-600">Próxima Fecha</p>
                        <p className="font-medium text-emerald-800">{new Date(record.proximaFecha).toLocaleDateString("es-ES")}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {record.peso && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Weight className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Peso</p>
                        <p className="font-medium">{record.peso} kg</p>
                      </div>
                    </div>
                  )}
                  {record.temperatura && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Thermometer className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Temperatura</p>
                        <p className="font-medium">{record.temperatura} °C</p>
                      </div>
                    </div>
                  )}
                </div>

                {record.medicamentos && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="h-4 w-4 text-blue-600" />
                      <h3 className="font-medium text-blue-900">Medicamentos</h3>
                    </div>
                    <p className="text-blue-800">{record.medicamentos}</p>
                  </div>
                )}

                {record.notas && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-yellow-600" />
                      <h3 className="font-medium text-yellow-900">Notas y Recomendaciones</h3>
                    </div>
                    <p className="text-yellow-800">{record.notas}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Veterinario: {veterinarioDetalle?.nombre ?? veterinarioDetalle?.nombreCompleto ?? record.veterinario ?? record.veterinarioId ?? "-"}</span>
                    <span>Registro creado: {record.createdAt ? new Date(record.createdAt).toLocaleString("es-ES") : "-"}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Mascota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={mascota?.foto || record?.foto || record?.mascotaFoto || "/placeholder.svg"} alt={mascota?.nombre ?? record?.mascotaNombre ?? "Mascota"} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl">
                      {(mascota?.nombre ?? record?.mascotaNombre ?? "-").charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <Link to={`/mascotas/detalles/${mascota?.idMascota ?? record?.mascotaId ?? ""}`}> 
                    <h3 className="font-semibold text-gray-900 hover:text-emerald-600 hover:underline">
                      {mascota?.nombre ?? record?.mascotaNombre ?? "-"}
                    </h3>
                  </Link>
                  <p className="text-gray-600">
                      {(mascota?.raza ?? record?.mascotaRaza ?? "-")} • {(mascota?.edad ?? record?.mascotaEdad ?? "-")} {(mascota?.edad ?? record?.mascotaEdad) === 1 ? "año" : "años"}
                  </p>
                </div>
              </div>
              <Link to={`/mascotas/detalles/${mascota?.idMascota ?? record?.mascotaId ?? ""}`}>
                <button className="w-full p-2 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                  Ver Historial Completo
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Propietario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Link to={`/propietarios/detalles/${mascota?.propietarioId ?? record?.propietarioId ?? ""}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-emerald-600 hover:underline">
                    {mascota?.propietarioNombre ?? record?.propietarioNombre ?? "-"}
                  </h3>
                </Link>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Teléfono:</span>
                  <span>{propietarioDetalle?.telefono ?? record?.propietarioTelefono ?? "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Email:</span>
                  <span>{propietarioDetalle?.correo ?? record?.propietarioEmail ?? "-"}</span>
                </div>
              </div>
              <Link to={`/propietarios/detalles/${mascota?.propietarioId ?? record?.propietarioId ?? ""}`}>
                <button className="w-full p-2 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                  Ver Perfil Completo
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => setDeleteDialogOpen(open)}
        onConfirm={confirmDelete}
        title="Eliminar registro"
        description={record ? `¿Eliminar el registro '${record.titulo ?? record.idHistorial}'? Esta acción no se puede deshacer.` : "¿Eliminar registro?"}
        isLoading={deleteLoading}
      />

      {deleteError && <div className="text-sm text-red-600">{deleteError}</div>}
    </div>
  );
};

export default DetallesHistorial;