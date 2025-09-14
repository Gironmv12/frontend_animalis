import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import propietarioService from "@/services/propietarioService/propietarioService";
import type { Propietario, Mascota } from "@/services/propietarioService/propietarioService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Calendar, Heart, Plus, ArrowLeft, Edit } from "lucide-react";

export default function DetallesPropietario() {
  const { id } = useParams<{ id?: string }>();
  const [data, setData] = useState<{ propietario: Propietario; mascotas: Mascota[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID de propietario no proporcionado.");
      return;
    }
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      setError("ID de propietario inválido.");
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const response = await propietarioService.getDetalle(numericId);
        if (isMounted) setData(response);
      } catch (err: any) {
        if (isMounted) {
          if (err?.response?.status === 404) {
            setError("Propietario no encontrado (404).");
          } else {
            setError("Error al obtener el detalle del propietario.");
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <div>Cargando detalle...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!data) return <div>No hay datos para mostrar.</div>;

  const { propietario, mascotas } = data;
  const fullName = `${propietario.nombre} ${propietario.apellidos}`;
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statusColors: Record<string, string> = {
    A: "bg-green-100 text-green-800",
    I: "bg-gray-100 text-gray-800",
  };
  const statusLabels: Record<string, string> = {
    A: "Activo",
    I: "Inactivo",
  };
  const estadoKey = propietario.estado ?? "I";

  return (
    <div className="space-y-6">
      {/* CABECERA: ocupa 100% del ancho */}
      <header className="w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/propietarios">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[--foreground]">Detalles del Propietario</h1>
              <p className="text-gray-600 mt-2">Información completa y mascotas asociadas</p>
            </div>
          </div>

          <Link to={`/propietarios/editar/${propietario.id}`}>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </header>

      {/* CONTENIDO: grid con card (izquierda) y mascotas (derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card con la información personal (ocupa 2 columnas en lg) */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Información Personal</span>
                <Badge className={statusColors[estadoKey] ?? "bg-gray-100 text-gray-800"}>
                  {statusLabels[estadoKey] ?? propietario.estado}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-[--foreground]">{fullName}</h2>
                  <p className="text-gray-600">
                    Última visita:{" "}
                    {propietario.fechaUltimaVisita
                      ? new Date(propietario.fechaUltimaVisita).toLocaleDateString("es-ES")
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{propietario.correo}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{propietario.telefono}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Dirección</p>
                  <p className="font-medium">{propietario.direccion}</p>
                </div>
              </div>

              {propietario.notas && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-1">Notas</p>
                  <p className="text-blue-800">{propietario.notas}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mascotas (columna derecha) */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-emerald-600" />
                  Mascotas ({mascotas.length})
                </CardTitle>
                <Link to={`/mascotas/new?owner=${propietario.id}`}>
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {mascotas.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">No hay mascotas registradas para este propietario.</div>
                ) : (
                  mascotas.map((pet) => (
                    <Link key={pet.idMascota} to={`/mascotas/${pet.idMascota}`}>
                      <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700">
                              {pet.nombre?.charAt(0) ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium text-[--foreground]">{pet.nombre}</h4>
                            <p className="text-sm text-gray-600">
                              {pet.raza ?? pet.especie ?? "—"} • {pet.edad ?? "—"} {pet.edad === 1 ? "año" : "años"}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                Última visita:{" "}
                                {pet.fechaUltimaVisita ? new Date(pet.fechaUltimaVisita).toLocaleDateString("es-ES") : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}