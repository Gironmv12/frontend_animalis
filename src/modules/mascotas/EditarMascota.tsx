import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMascotaById, updateMascota, uploadMascotaFoto } from "@/services/mascotasService/mascotaService";
import type { Mascota, CreateMascotaPayload } from "@/services/mascotasService/mascotaService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, Upload, Trash2 } from "lucide-react";
import { DeleteConfirmDialog } from "../../components/ui/delete-confirm-dialog";


const EditarMascota: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const idParam = params.id as string | undefined;

  const [mascota, setMascota] = useState<Mascota | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // form fields
  const [nombre, setNombre] = useState<string>("");
  const [especie, setEspecie] = useState<string>("");
  const [raza, setRaza] = useState<string>("");
  const [edad, setEdad] = useState<number | "">("");
  const [genero, setGenero] = useState<string>("");
  const [fechaNacimiento, setFechaNacimiento] = useState<string>("");
  const [estado, setEstado] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [microchip, setMicrochip] = useState<string>("");
  const [peso, setPeso] = useState<string>("");
  const [notas, setNotas] = useState<string>("");
  const [propietarioId, setPropietarioId] = useState<number | "">("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const id = idParam ? Number(idParam) : NaN;
    if (!idParam || Number.isNaN(id)) {
      setError("ID inválido");
      setLoading(false);
      return;
    }

    setLoading(true);
    getMascotaById(id)
      .then((data) => {
        if (!mounted) return;
        setMascota(data);
        // populate form
        setNombre(data.nombre || "");
        setEspecie(data.especie || "");
        setRaza(data.raza || "");
        setEdad(data.edad ?? "");
        setGenero(data.genero ?? "");
        setFechaNacimiento(data.fechaNacimiento ?? "");
        setEstado(data.estado ?? "");
        setColor(data.color ?? "");
        setMicrochip(data.microchip ?? "");
        setPeso(data.peso ?? "");
        setNotas(data.notas ?? "");
        setPropietarioId((data.propietarioId as any) ?? "");

        // set photo preview from mascota (prefer foto view endpoint if available)
        try {
          const api = import.meta.env.VITE_API_URL ?? "";
          if (data.idMascota) {
            setPhotoPreview(`${api}/mascotas/${data.idMascota}/foto/view`);
          } else if ((data as any).foto) {
            setPhotoPreview((data as any).foto as string);
          }
        } catch (e) {
          // ignore
        }
      })
      .catch((err: any) => {
        if (!mounted) return;
        setError(err?.message || "Error al cargar mascota");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => { mounted = false; };
  }, [idParam]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setPhotoFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mascota) return;
    const id = mascota.idMascota;

    const payload: Partial<CreateMascotaPayload> = {
      nombre: nombre.trim(),
      especie: especie.trim(),
      raza: raza.trim() || undefined,
      edad: typeof edad === 'number' ? edad : undefined,
      genero: genero === '' ? undefined : (genero as any),
      fechaNacimiento: fechaNacimiento || undefined,
      estado: estado === '' ? undefined : (estado as any),
      color: color || undefined,
      microchip: microchip || undefined,
      peso: peso || undefined,
      notas: notas || undefined,
      propietario: { connect: { idPropietario: Number(propietarioId) } },
    };

    try {
      setLoading(true);
      await updateMascota(id, payload);

      if (photoFile) {
        await uploadMascotaFoto(id, photoFile);
      }

      navigate(`/mascotas/detalles/${id}`);
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar mascota');
    } finally {
      setLoading(false);
    }
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (loading) return <div className="p-6">Cargando...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!mascota) return <div className="p-6">No se encontró la mascota</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Editar Mascota</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              {photoPreview ? (
                <AvatarImage src={photoPreview} alt={nombre || mascota.nombre} />
              ) : (
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl">
                  { (nombre || mascota.nombre || "").charAt(0) }
                </AvatarFallback>
              )}
            </Avatar>

            <div>
              <Label htmlFor="photo" className="cursor-pointer">
                <Button type="button" variant="outline" className="bg-transparent">
                  <Upload className="h-4 w-4 mr-2" />
                  Cambiar Foto
                </Button>
              </Label>
              <Input id="photo" ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <p className="text-sm text-gray-500 mt-1">JPG, PNG o GIF (máx. 5MB)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="especie">Especie *</Label>
              <Select value={especie} onValueChange={(v) => setEspecie(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Perro">Perro</SelectItem>
                  <SelectItem value="Gato">Gato</SelectItem>
                  <SelectItem value="Ave">Ave</SelectItem>
                  <SelectItem value="Conejo">Conejo</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="raza">Raza</Label>
              <Input id="raza" value={raza} onChange={(e) => setRaza(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genero">Género</Label>
              <Select value={genero} onValueChange={(v) => setGenero(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="macho">Macho</SelectItem>
                  <SelectItem value="hembra">Hembra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edad">Edad (años)</Label>
              <Input id="edad" type="number" min={0} value={edad === '' ? '' : String(edad)} onChange={(e) => { const v = e.target.value; setEdad(v === '' ? '' : Number(v)); }} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input id="peso" type="text" value={peso} onChange={(e) => setPeso(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={estado} onValueChange={(v) => setEstado(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saludable">Saludable</SelectItem>
                  <SelectItem value="en_tratamiento">En tratamiento</SelectItem>
                  <SelectItem value="vacunacion">Vacunación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
              <Input id="fechaNacimiento" type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="microchip">Microchip</Label>
              <Input id="microchip" value={microchip} onChange={(e) => setMicrochip(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="propietarioId">Propietario (ID)</Label>
              <Input id="propietarioId" value={propietarioId === '' ? '' : String(propietarioId)} onChange={(e) => setPropietarioId(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button type="button" variant="destructive" onClick={() => setShowDeleteDialog(true)} className="bg-red-500 hover:bg-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar Mascota
        </Button>

        <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          // Solo cerrar el diálogo por ahora; la lógica de borrado puede implementarse después
          setShowDeleteDialog(false);
        }}
        title="Eliminar Mascota"
        description="¿Estás seguro de que deseas eliminar esta mascota? Esta acción no se puede deshacer."
        isLoading={false}
      />
    </form>
  );
};

export default EditarMascota;
