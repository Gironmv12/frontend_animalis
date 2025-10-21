

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMascotas } from "@/services/mascotasService/mascotaService";
import { createHistorial } from "@/services/historialService/historialService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, X, Calendar, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import usuarioService from "@/services/usuarioService/usuarioService";
import { TIPO_REGISTRO, ESTADO_VACUNA, URGENCIAS } from "@/lib/enums";

const CrearHistorial = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mascotas, setMascotas] = useState<any[]>([]);

  const [form, setForm] = useState({
    mascotaId: "",
    tipoRegistro: "vacuna",
    titulo: "",
    descripcion: "",
    fechaAplicacion: "",
    proximaFecha: "",
    estado: "completo",
    urgencia: "normal",
    peso: "",
    temperatura: "",
    medicamentos: "",
    notas: "",
    veterinarioId: "",
  });

  const [hasNextDate, setHasNextDate] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const m = await getMascotas();
        setMascotas(m);
        // cargar veterinarios
        try {
          const vets = await usuarioService.getVeterinarios();
          setVeterinarios(vets);
        } catch (e) {
          // ignore
        }
      } catch (e) {
        // ignore
      }
    };
    load();
  }, []);

  const [veterinarios, setVeterinarios] = useState<any[]>([]);

  const handleChange = (key: string, value: any) => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // minimal validation
      if (!form.mascotaId) throw new Error("Seleccione una mascota");
      if (!form.titulo) throw new Error("Ingrese un título");

      // Interpreta el valor especial 'no_vet' o cadena vacía como null
      const veterinarioValue = form.veterinarioId === "no_vet" || form.veterinarioId === "" ? null : form.veterinarioId;

      const payload: any = {
        mascotaId: Number(form.mascotaId),
        tipoRegistro: form.tipoRegistro,
        titulo: form.titulo,
        descripcion: form.descripcion || null,
        fechaAplicacion: form.fechaAplicacion || null,
        proximaFecha: form.proximaFecha || null,
        estado: form.estado,
        urgencia: form.urgencia,
        peso: form.peso ? Number(form.peso) : null,
        temperatura: form.temperatura ? Number(form.temperatura) : null,
        medicamentos: form.medicamentos || null,
        notas: form.notas || null,
        veterinarioId: veterinarioValue ? Number(veterinarioValue) : null,
      };

      await createHistorial(payload);
      // show inline success and navigate shortly after
      setSuccess("Registro creado correctamente");
      setTimeout(() => navigate("/historialMedico"), 800);
    } catch (err: any) {
      setError(err?.message || "Error al crear historial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
        <div className="space-y-6 mb-1">
        <div className="flex items-center gap-4">
          <Link to="/historialMedico">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nuevo Registro Médico</h1>
            <p className="text-gray-600 mt-2">Añadir un nuevo registro al historial médico</p>
          </div>
        </div>
      </div>
      <Card className="border-0 shadow-sm">
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mascota">Mascota *</Label>
                <Select value={String(form.mascotaId)} onValueChange={(val) => handleChange("mascotaId", val)}>
                  <SelectTrigger className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                    <SelectValue placeholder="Seleccionar mascota" />
                  </SelectTrigger>
                  <SelectContent>
                    {mascotas.map((m) => (
                      <SelectItem key={m.idMascota} value={String(m.idMascota)}>
                        {m.nombre} {m.propietarioNombre ? `- ${m.propietarioNombre}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoRegistro">Tipo de Registro *</Label>
                <Select value={form.tipoRegistro} onValueChange={(val) => handleChange("tipoRegistro", val)}>
                  <SelectTrigger className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_REGISTRO.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titulo">Título del Registro *</Label>
              <Input id="titulo" name="titulo" value={form.titulo} onChange={(e: any) => handleChange("titulo", e.target.value)} placeholder="Ej: Vacuna antirrábica" className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea id="descripcion" name="descripcion" value={form.descripcion} onChange={(e: any) => handleChange("descripcion", e.target.value)} className="min-h-[100px] border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none" required />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaAplicacion">Fecha de Aplicación *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="fechaAplicacion" name="fechaAplicacion" type="date" value={form.fechaAplicacion} onChange={(e: any) => handleChange("fechaAplicacion", e.target.value)} className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" required />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox id="hasNextDate" checked={hasNextDate} onCheckedChange={(c) => setHasNextDate(Boolean(c))} />
                  <Label htmlFor="hasNextDate" className="text-sm">Programar próxima fecha</Label>
                </div>
                {hasNextDate && (
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="proximaFecha" name="proximaFecha" type="date" value={form.proximaFecha} onChange={(e: any) => handleChange("proximaFecha", e.target.value)} className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Vet / status / urgency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="veterinario">Veterinario</Label>
                <Select value={String(form.veterinarioId)} onValueChange={(val) => handleChange("veterinarioId", val)}>
                  <SelectTrigger className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                    <SelectValue placeholder="Seleccionar veterinario" />
                  </SelectTrigger>
                    <SelectContent>
                      {veterinarios.length === 0 ? (
                        // No usar value vacío porque Radix Select lanza error si hay un Select.Item con value=""
                        <SelectItem value="no_vet" disabled>
                          No hay veterinarios
                        </SelectItem>
                      ) : (
                        veterinarios.map((v) => (
                          <SelectItem key={v.idUsuario ?? v.id} value={String(v.idUsuario ?? v.id)}>
                            {v.nombre} {v.apellidos ?? ""} {v.correo ? `- ${v.correo}` : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={form.estado} onValueChange={(val) => handleChange("estado", val)}>
                  <SelectTrigger className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADO_VACUNA.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgencia">Urgencia</Label>
                <Select value={form.urgencia} onValueChange={(val) => handleChange("urgencia", val)}>
                  <SelectTrigger className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                    <SelectValue placeholder="Seleccionar urgencia" />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCIAS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input id="peso" name="peso" type="number" step="0.1" value={form.peso} onChange={(e: any) => handleChange("peso", e.target.value)} placeholder="Peso actual" className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperatura">Temperatura (°C)</Label>
                <Input id="temperatura" name="temperatura" type="number" step="0.1" value={form.temperatura} onChange={(e: any) => handleChange("temperatura", e.target.value)} placeholder="Temperatura corporal" className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicamentos">Medicamentos Administrados</Label>
              <Textarea id="medicamentos" name="medicamentos" value={form.medicamentos} onChange={(e: any) => handleChange("medicamentos", e.target.value)} className="min-h-[80px] border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea id="notas" name="notas" value={form.notas} onChange={(e: any) => handleChange("notas", e.target.value)} className="min-h-[80px] border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none" />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}

            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Guardando..." : "Guardar Registro"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrearHistorial;