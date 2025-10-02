import { useEffect, useState, useRef } from "react";
import { createMascota, uploadMascotaFoto } from "../../services/mascotasService/mascotaService";
import type {
  CreateMascotaPayload,
  EstadoMascota,
  GeneroMascota,
} from "../../services/mascotasService/mascotaService";
import propietarioService, { type Propietario } from "@/services/propietarioService/propietarioService";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Upload, Save, X, Camera } from "lucide-react"

const estadoLabels: Record<EstadoMascota, string> = {
  saludable: "Saludable",
  en_tratamiento: "En tratamiento",
  vacunacion: "Vacunación",
};

// helper opcional (agrega arriba del componente)
const formatDateToISO = (dateStr: string): string | null => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};

const CrearMascota: React.FC = () => {
  // const navigate = useNavigate(); // eliminado porque no se usa

  // Campos básicos según el payload requerido
  const [nombre, setNombre] = useState<string>("");
  const [especie, setEspecie] = useState<string>("");
  const [raza, setRaza] = useState<string>("");
  const [edad, setEdad] = useState<number | "">("");
  // ahora genero y estado usan los tipos, o '' para no seleccionado
  const [genero, setGenero] = useState<GeneroMascota | "">("");
  const [fechaNacimiento, setFechaNacimiento] = useState<string>("");
  const [estado, setEstado] = useState<EstadoMascota | "">("");
  const [color, setColor] = useState<string>("");
  const [microchip, setMicrochip] = useState<string>("");
  const [peso, setPeso] = useState<string>("");
  const [notas, setNotas] = useState<string>("");

  // ahora guardamos el File en vez de un string
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // propietario seleccionado (almaceno number | "" para estado vacío)
  const [propietarioId, setPropietarioId] = useState<number | "">("");

  // propietarios (para el select)
  const [owners, setOwners] = useState<Propietario[]>([]);
  const [ownersLoading, setOwnersLoading] = useState<boolean>(true);
  const [ownersError, setOwnersError] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setOwnersLoading(true);
    setOwnersError(null);

    propietarioService
      .getAll()
      .then((data) => {
        if (!mounted) return;
        setOwners(data);
      })
      .catch((err: any) => {
        if (!mounted) return;
        setOwnersError(err?.message || "Error al cargar propietarios");
      })
      .finally(() => {
        if (!mounted) return;
        setOwnersLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const resetForm = () => {
    setNombre("");
    setEspecie("");
    setRaza("");
    setEdad("");
    setGenero("");
    setFechaNacimiento("");
    setEstado("");
    setColor("");
    setMicrochip("");
    setPeso("");
    setNotas("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setPropietarioId("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setPhotoFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(f);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validación mínima: nombre y propietarioId
    if (!nombre.trim()) {
      setError("El nombre es requerido.");
      return;
    }
    if (
      propietarioId === "" ||
      (typeof propietarioId === "number" && isNaN(propietarioId))
    ) {
      setError("El id del propietario es requerido.");
      return;
    }

    const payload: CreateMascotaPayload = {
      nombre: nombre.trim(),
      especie: especie.trim(),
      raza: raza.trim() || "",
      edad: typeof edad === "number" ? edad : null,
      genero: genero === "" ? null : (genero as GeneroMascota),
      fechaNacimiento: fechaNacimiento ? formatDateToISO(fechaNacimiento) : null,
      estado: estado === "" ? null : (estado as EstadoMascota),
      color: color.trim() || null,
      microchip: microchip ? microchip : null,
      peso: peso ? peso : null,
      notas: notas ? notas : null,
      // no enviamos foto aquí (la subiremos después si hay archivo)
      foto: null,
      propietario: {
        connect: { idPropietario: Number(propietarioId) },
      },
    };

    try {
      setLoading(true);
      const created = await createMascota(payload);

      // Si el usuario seleccionó un archivo, subirlo ahora al endpoint mascotas/{id}/foto
      if (photoFile) {
        try {
          await uploadMascotaFoto(created.idMascota, photoFile);
          setSuccessMessage(
            `Mascota creada (ID: ${created.idMascota}) y foto subida correctamente.`
          );
        } catch (uploadErr: any) {
          setSuccessMessage(
            `Mascota creada (ID: ${created.idMascota}). Pero la subida de la foto falló: ${uploadErr?.message ?? uploadErr}`
          );
        }
      } else {
        setSuccessMessage(`Mascota creada (ID: ${created.idMascota})`);
      }

      resetForm();
    } catch (err: any) {
      setError(err?.message || "Error al crear mascota");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-emerald-600" />
          Información de la Mascota
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div role="alert" className="mb-2 text-red-600">Error: {error}</div>}
        {successMessage && <div role="status" className="mb-2 text-emerald-700">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Foto de la Mascota</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                {photoPreview ? (
                  <AvatarImage src={photoPreview || "/placeholder.svg"} alt="Preview" />
                ) : (
                  <AvatarFallback className="bg-gray-100">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Foto
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                    className="border-gray-200"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Quitar
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-500">JPG, PNG o GIF (máx. 5MB)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre de la mascota" className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" required />
            </div>
            <div className="space-y-2">
              <Label>Especie *</Label>
              <Input value={especie} onChange={(e) => setEspecie(e.target.value)} placeholder="Especie" className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Raza</Label>
              <Input value={raza} onChange={(e) => setRaza(e.target.value)} placeholder="Raza" className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" />
            </div>
            <div className="space-y-2">
              <Label>Edad (años)</Label>
              <Input type="number" value={edad === "" ? "" : String(edad)} onChange={(e) => { const v = e.target.value; setEdad(v === "" ? "" : Number(v)); }} placeholder="Edad" className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Género</Label>
              <Select value={genero === "" ? "" : genero} onValueChange={(v) => setGenero(v === "" ? "" : (v as GeneroMascota))}>
                <SelectTrigger className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                  <SelectValue placeholder="Seleccionar género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="macho">Macho</SelectItem>
                  <SelectItem value="hembra">Hembra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha de Nacimiento</Label>
              <Input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={estado === "" ? "" : estado} onValueChange={(v) => setEstado(v === "" ? "" : (v as EstadoMascota))}>
                <SelectTrigger className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saludable">{estadoLabels.saludable}</SelectItem>
                  <SelectItem value="en_tratamiento">{estadoLabels.en_tratamiento}</SelectItem>
                  <SelectItem value="vacunacion">{estadoLabels.vacunacion}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Color del pelaje" className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Microchip</Label>
              <Input value={microchip} onChange={(e) => setMicrochip(e.target.value)} placeholder="Número de microchip" className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" />
            </div>
            <div className="space-y-2">
              <Label>Peso</Label>
              <Input value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="Peso (ej: 5.5 kg)" className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Información adicional" className="min-h-[80px] border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Propietario *</Label>
              <Select value={propietarioId === "" ? "" : String(propietarioId)} onValueChange={(v) => setPropietarioId(v === "" ? "" : Number(v))}>
                <SelectTrigger className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                  <SelectValue placeholder="Seleccionar propietario" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.nombre} {o.apellidos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {ownersLoading && <div className="text-sm text-gray-500">Cargando propietarios...</div>}
              {ownersError && <div role="alert" className="text-sm text-red-600">Error: {ownersError}</div>}
              {!ownersLoading && owners.length === 0 && (
                <div className="text-sm text-gray-500">No hay propietarios disponibles</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Creando..." : "Crear Mascota"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CrearMascota;