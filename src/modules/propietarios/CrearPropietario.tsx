import React, { useState } from "react";
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
import { CheckCircle } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";

const estados = [
  { value: "A", label: "Activo" },
  { value: "I", label: "Inactivo" },
];

const CrearPropietario = () => {
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
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEstadoSelect = (value: string) => {
    setFormData({ ...formData, estado: value });
    setEstadoPopoverOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = {
        ...formData,
        fechaUltimaVisita: new Date(formData.fechaUltimaVisita).toISOString(),
      };

      const newPropietario = await propietarioService.create(formDataToSend);
      console.log("Propietario creado:", newPropietario);

      setFormData({
        nombre: "",
        apellidos: "",
        correo: "",
        telefono: "",
        direccion: "",
        estado: "",
        notas: "",
        fechaUltimaVisita: "",
      });

      setAlertVisible(true);
      setDialogOpen(false);
      setTimeout(() => setAlertVisible(false), 3000);
    } catch (error) {
      console.error("Error al crear el propietario:", error);
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
            <CardTitle className="text-3xl font-bold text-gray-900">Nuevo Propietario</CardTitle>
            <p className="text-gray-600 mt-2">Registra un nuevo propietario en el sistema</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {alertVisible && (
          <Alert variant="default" className="border-l-4 border-green-500 bg-green-50 text-green-800">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              <div>
                <AlertTitle className="font-bold">¡Éxito!</AlertTitle>
                <AlertDescription>El propietario ha sido creado correctamente.</AlertDescription>
              </div>
            </div>
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
            />
          </div>
          <div className="space-y-2">
            <Popover open={estadoPopoverOpen} onOpenChange={setEstadoPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
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
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white w-full">Crear Propietario</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <h2>Confirmar acción</h2>
                <p>¿Estás seguro de que deseas crear este propietario?</p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>Confirmar</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </form>
      </CardContent>
    </Card>
  );
};

export default CrearPropietario;