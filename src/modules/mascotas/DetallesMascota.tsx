
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMascotaById, type Mascota } from "@/services/mascotasService/mascotaService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User, Weight, Palette, Hash, FileText, Plus, Syringe } from "lucide-react";
import propietarioService, { type Propietario } from "@/services/propietarioService/propietarioService";

const DetallesMascota: React.FC = () => {
  const params = useParams();
  const idParam = params.id as string | undefined;
  const [mascota, setMascota] = useState<Mascota | null>(null);
  const [owner, setOwner] = useState<Propietario | null>(null);
  const [ownerLoading, setOwnerLoading] = useState<boolean>(false);
  const [ownerError, setOwnerError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const id = idParam ? Number(idParam) : NaN;
    if (!idParam || Number.isNaN(id)) {
      setError("ID de mascota inválido");
      setLoading(false);
      return;
    }

    setLoading(true);
    getMascotaById(id)
      .then((data) => {
        if (!mounted) return;
        setMascota(data);
      })
      .catch((err: any) => {
        if (!mounted) return;
        setError(err?.message || "Error al cargar mascota");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [idParam]);

  // cuando tengamos la mascota cargada, traer detalle del propietario si hay id
  useEffect(() => {
    let mounted = true;
    if (!mascota?.propietarioId) return;
    setOwnerLoading(true);
    setOwnerError(null);
    propietarioService
      .getDetalle(mascota.propietarioId)
      .then((data) => {
        if (!mounted) return;
        setOwner(data.propietario);
      })
      .catch((err: any) => {
        if (!mounted) return;
        setOwnerError(err?.message || "Error al cargar propietario");
      })
      .finally(() => {
        if (!mounted) return;
        setOwnerLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [mascota?.propietarioId]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!mascota) return <div>No se encontró la mascota</div>;

  // Construir URL de la foto usando endpoint mascotas/{id}/foto/view
  const apiUrl = (import.meta.env.VITE_API_URL as string) || "";
  const cleanApi = apiUrl.replace(/\/$/, "");
  const photoUrl = cleanApi ? `${cleanApi}/mascotas/${mascota.idMascota}/foto/view` : `/mascotas/${mascota.idMascota}/foto/view`;

  // status mapping (backend values -> labels/colors)
  const statusKey = (mascota.estado || "").toString().toLowerCase();
  const statusLabels: Record<string, string> = {
    saludable: "Saludable",
    en_tratamiento: "En Tratamiento",
    vacunacion: "Vacunación",
    healthy: "Saludable",
    treatment: "En Tratamiento",
    vaccination: "Vacunación",
  };
  const statusColors: Record<string, string> = {
    saludable: "bg-emerald-100 text-emerald-700",
    en_tratamiento: "bg-yellow-100 text-yellow-700",
    vacunacion: "bg-blue-100 text-blue-700",
    healthy: "bg-emerald-100 text-emerald-700",
    treatment: "bg-yellow-100 text-yellow-700",
    vaccination: "bg-blue-100 text-blue-700",
  };

  // medical history placeholder (backend may supply this in another endpoint)
  const medicalHistory: Array<any> = [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Información General</span>
              <Badge className={statusColors[statusKey] || "bg-gray-100 text-gray-700"}>
                {statusLabels[statusKey] || "Desconocido"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={photoUrl} alt={mascota.nombre} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl">
                  {mascota.nombre?.charAt(0) ?? "-"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{mascota.nombre}</h2>
                <p className="text-xl text-gray-600 mb-2">{mascota.raza} • {mascota.edad} {mascota.edad === 1 ? 'año' : 'años'}</p>
                <p className="text-gray-500">{mascota.fechaNacimiento ? `Nacido: ${new Date(mascota.fechaNacimiento).toLocaleDateString('es-ES')}` : ''}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Género</p>
                  <p className="font-medium">{mascota.genero ?? '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Weight className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Peso</p>
                  <p className="font-medium">{mascota.peso ?? '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Palette className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Color</p>
                  <p className="font-medium">{mascota.color ?? '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
                  <p className="font-medium">{mascota.fechaNacimiento ? new Date(mascota.fechaNacimiento).toLocaleDateString('es-ES') : '-'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Hash className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Microchip</p>
                <p className="font-medium font-mono">{mascota.microchip ?? '-'}</p>
              </div>
            </div>

            {mascota.notas && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-600 font-medium">Notas</p>
                </div>
                <p className="text-blue-800">{mascota.notas}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Historial Médico</CardTitle>
              <Link to={`/historialMedico?mascota=${mascota.idMascota}`}>
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Plus className="h-4 w-4 mr-1" />
                  Nuevo Registro
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medicalHistory.length === 0 ? (
                <div className="text-sm text-gray-500">No hay registros médicos disponibles</div>
              ) : (
                medicalHistory.map((record: any) => (
                  <div key={record.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-white rounded-lg">
                      <Syringe className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-100 text-blue-800">{record.type}</Badge>
                        <span className="text-sm text-gray-500">{record.date}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{record.description}</h4>
                      <p className="text-sm text-gray-600 mb-2">Veterinario: {record.veterinarian}</p>
                      {record.nextDate && (
                        <p className="text-sm text-emerald-600">Próxima fecha: {record.nextDate}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Propietario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ownerLoading ? (
                <div>Cargando propietario...</div>
              ) : ownerError ? (
                <div className="text-sm text-red-600">Error: {ownerError}</div>
              ) : (
                <>
                  <div>
                    <Link to={`/propietarios/detalles/${mascota.propietarioId}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-emerald-600 hover:underline">{owner ? `${owner.nombre} ${owner.apellidos}` : (mascota.propietarioNombre ?? '-')}</h3>
                    </Link>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Teléfono:</span>
                      <span>{owner?.telefono ?? '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Email:</span>
                      <span>{owner?.correo ?? '-'}</span>
                    </div>
                  </div>

                  <Link to={`/propietarios/detalles/${mascota.propietarioId}`}>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">Ver Perfil Completo</Button>
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DetallesMascota;