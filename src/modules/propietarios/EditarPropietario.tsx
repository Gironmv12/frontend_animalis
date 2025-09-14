import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import propietarioService from "@/services/propietarioService/propietarioService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Trash, ArrowLeft } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";

const estados = [
  { value: "A", label: "Activo" },
  { value: "I", label: "Inactivo" },
];

const EditarPropietario: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    correo: "",
    telefono: "",
    direccion: "",
    estado: "",
    notas: "",
    fechaUltimaVisita: "",
  });

  const [estadoPopoverOpen, setEstadoPopoverOpen] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos al montar
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("ID de propietario no proporcionado");
        return;
      }
      setLoading(true);
      try {
        const data = await propietarioService.getDetalle(Number(id));
        const propietario = data.propietario;
        setFormData({
          nombre: propietario.nombre ?? "",
          apellidos: propietario.apellidos ?? "",
          correo: propietario.correo ?? "",
          telefono: propietario.telefono ?? "",
          direccion: propietario.direccion ?? "",
          estado: propietario.estado ?? "",
          notas: propietario.notas ?? "",
          // Guardamos como YYYY-MM-DD para el Calendar (si viene en ISO)
          fechaUltimaVisita: propietario.fechaUltimaVisita
            ? new Date(propietario.fechaUltimaVisita).toISOString().split("T")[0]
            : "",
        });
      } catch (err) {
        console.error("Error al cargar propietario:", err);
        setError("No se pudo cargar la información del propietario.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEstadoSelect = (value: string) => {
    setFormData({ ...formData, estado: value });
    setEstadoPopoverOpen(false);
  };

  const handleSave = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        fechaUltimaVisita: formData.fechaUltimaVisita
          ? new Date(formData.fechaUltimaVisita).toISOString()
          : null,
      };
      // Enviamos sólo las propiedades que queremos actualizar (puede ser parcial)
      const updated = await propietarioService.update(Number(id), payload as any);
      console.log("Propietario actualizado:", updated);
      setAlertVisible(true);
      setTimeout(() => setAlertVisible(false), 3000);
      // Navegar de regreso a la lista después de guardar
      setTimeout(() => navigate("/propietarios"), 800);
    } catch (err) {
      console.error("Error al actualizar propietario:", err);
      setError("Error al guardar los cambios. Revisa la consola para más detalles.");
    } finally {
      setLoading(false);
      setSaveDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setError(null);
    try {
      await propietarioService.delete(Number(id));
      // Redirigir a listado
      navigate("/propietarios");
    } catch (err) {
      console.error("Error al eliminar propietario:", err);
      setError("No se pudo eliminar el propietario.");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Link to="/propietarios">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <CardTitle className="text-3xl font-bold text-gray-900">Editar Propietario</CardTitle>
            <p className="text-gray-600 mt-2">Modifica la información del propietario</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {alertVisible && (
          <Alert variant="default" className="border-l-4 border-green-500 bg-green-50 text-green-800 mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              <div>
                <AlertTitle className="font-bold">¡Éxito!</AlertTitle>
                <AlertDescription>Los cambios se guardaron correctamente.</AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Input
                name="apellidos"
                placeholder="Apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Input
              name="correo"
              type="email"
              placeholder="Correo Electrónico"
              value={formData.correo}
              onChange={handleChange}
              className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Input
              name="telefono"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={handleChange}
              className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Input
              name="direccion"
              placeholder="Dirección"
              value={formData.direccion}
              onChange={handleChange}
              className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Popover open={estadoPopoverOpen} onOpenChange={setEstadoPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" disabled={loading}>
                  {formData.estado
                    ? estados.find((estado) => estado.value === formData.estado)?.label
                    : "+ Seleccionar estado"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Buscar estado..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                    <CommandGroup>
                      {estados.map((estado) => (
                        <CommandItem
                          key={estado.value}
                          value={estado.value}
                          onSelect={() => handleEstadoSelect(estado.value)}
                        >
                          {estado.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Textarea
              name="notas"
              placeholder="Notas"
              value={formData.notas}
              onChange={handleChange}
              className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              rows={4}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Última Visita
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full text-left font-normal border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                    formData.fechaUltimaVisita ? "text-gray-900" : "text-gray-400"
                  }`}
                  disabled={loading}
                >
                  {formData.fechaUltimaVisita
                    ? new Date(formData.fechaUltimaVisita).toLocaleDateString()
                    : "Selecciona una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    formData.fechaUltimaVisita
                      ? new Date(formData.fechaUltimaVisita)
                      : undefined
                  }
                  onSelect={(date) => {
                    setFormData({
                      ...formData,
                      fechaUltimaVisita: date
                        ? date.toISOString().split("T")[0]
                        : "",
                    });
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-3">
            <AlertDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
                  Guardar cambios
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <h2>Confirmar cambios</h2>
                  <p>¿Deseas guardar los cambios realizados al propietario?</p>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Guardando..." : "Guardar"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="ml-auto" disabled={deleting}>
                  <Trash className="w-4 h-4 mr-2" />
                  Eliminar propietario
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <h2>Eliminar propietario</h2>
                  <p>Esta acción es irreversible. ¿Deseas continuar?</p>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleDelete} disabled={deleting}>
                    {deleting ? "Eliminando..." : "Eliminar"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Link to="/propietarios" className="ml-auto">
              <Button variant="ghost">Cancelar</Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditarPropietario;