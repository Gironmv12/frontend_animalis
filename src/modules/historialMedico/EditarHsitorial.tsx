

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRegistrosHistorial, getAllRegistrosHistorial, updateHistorial } from "@/services/historialService/historialService";
import { getMascotas } from "@/services/mascotasService/mascotaService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, X, Calendar, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { TIPO_REGISTRO, ESTADO_VACUNA, URGENCIAS } from "@/lib/enums";

const EditarHsitorial = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mascotas, setMascotas] = useState<any[]>([]);

  const [form, setForm] = useState<any>({
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

  useEffect(() => {
    const load = async () => {
      try {
        const m = await getMascotas();
        setMascotas(m);
      } catch (e) {
        // ignore
      }

      if (!id) return;
      const parsed = Number(id);
      if (isNaN(parsed)) return;
      try {
        // Intentamos obtener registros por id
        let registros: any[] = [];
        try {
          registros = await getRegistrosHistorial(parsed);
        } catch (err) {
          registros = [];
        }

        // Buscar registro por idHistorial dentro de los registros retornados
        let found = registros.find((r) => r.idHistorial === parsed);

        // Si no lo encontramos, pero el endpoint devolvió exactamente 1 registro
        // y su mascotaId == parsed, asumimos que id es mascotaId y tomamos el primero
        if (!found && registros.length === 1 && registros[0].mascotaId === parsed) {
          found = registros[0];
        }

        // Fallback: buscar en todos los registros
        if (!found) {
          try {
            const all = await getAllRegistrosHistorial();
            found = all.find((r) => r.idHistorial === parsed);
          } catch (e) {
            // ignore
          }
        }

        if (found) {
          setForm({
            mascotaId: String(found.mascotaId ?? ""),
            tipoRegistro: found.tipoRegistro ?? "vacuna",
            titulo: found.titulo ?? "",
            descripcion: found.descripcion ?? "",
            fechaAplicacion: found.fechaAplicacion ?? "",
            proximaFecha: found.proximaFecha ?? "",
            estado: found.estado ?? "completo",
            urgencia: found.urgencia ?? "normal",
            peso: found.peso ?? "",
            temperatura: found.temperatura ?? "",
            medicamentos: found.medicamentos ?? "",
            notas: found.notas ?? "",
            veterinarioId: found.veterinarioId ? String(found.veterinarioId) : "",
          });
          setHasNextDate(Boolean(found.proximaFecha));
        }
      } catch (e) {
        // ignore
      }
    };
    load();
  }, [id]);

  const handleChange = (key: string, value: any) => {
    setForm((s: any) => ({ ...s, [key]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!id) throw new Error("Id inválido");
      const parsed = Number(id);
      if (isNaN(parsed)) throw new Error("Id inválido");

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

      await updateHistorial(parsed, payload);
      navigate(`/historialMedico/detalles/${parsed}`);
    } catch (err: any) {
      setError(err?.message || "Error al actualizar historial");
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
            <h1 className="text-3xl font-bold text-gray-900">Editar Registro Médico</h1>
            <p className="text-gray-600 mt-2">Modificar los datos del registro</p>
          </div>
        </div>
      </div>
      <Card className="border-0 shadow-sm">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mascota *</Label>
                <Select value={String(form.mascotaId)} onValueChange={(v) => handleChange("mascotaId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar mascota" />
                  </SelectTrigger>
                  <SelectContent>
                    {mascotas.map((m: any) => (
                      <SelectItem key={m.idMascota} value={String(m.idMascota)}>
                        {m.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Registro</Label>
                <Select value={form.tipoRegistro} onValueChange={(v) => handleChange("tipoRegistro", v)}>
                  <SelectTrigger>
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
              <Label>Título</Label>
              <Input value={form.titulo} onChange={(e: any) => handleChange("titulo", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={form.descripcion} onChange={(e: any) => handleChange("descripcion", e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Aplicación</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input type="date" value={form.fechaAplicacion} onChange={(e: any) => handleChange("fechaAplicacion", e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox checked={hasNextDate} onCheckedChange={(c) => setHasNextDate(Boolean(c))} />
                  <Label className="text-sm">Programar próxima fecha</Label>
                </div>
                {hasNextDate && (
                  <Input type="date" value={form.proximaFecha} onChange={(e: any) => handleChange("proximaFecha", e.target.value)} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Veterinario</Label>
                <Input value={form.veterinarioId} onChange={(e: any) => handleChange("veterinarioId", e.target.value)} placeholder="Id del veterinario (temporal)" />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={form.estado} onValueChange={(v) => handleChange("estado", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADO_VACUNA.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Urgencia</Label>
                <Select value={form.urgencia} onValueChange={(v) => handleChange("urgencia", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCIAS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditarHsitorial;