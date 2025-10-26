

import React, { useEffect, useState, useMemo } from "react";
import {
  getActividadMensual,
  getConsultasEsteMes,
  getDistribucionEspecies,
  getHistoriales,
  getTotalPacientes,
  getVacunasAplicadas,
} from "@/services/reportesServices/reportesServices";
import type { Historial } from "@/services/reportesServices/reportesServices";

// Componente principal de Reportes
import { Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination"
import { TrendingUp, TrendingDown, Users, Syringe, Calendar, Filter } from "lucide-react"

// Componente principal de Reportes graficas
// Not using custom Button/Select/Chart wrapper here; using plain elements and Recharts directly
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts"
// icons Download/Filter not needed here

const Reportes: React.FC = () => {
  const [historiales, setHistoriales] = useState<Historial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalPacientes, setTotalPacientes] = useState<number | null>(null);
  const [consultasEsteMes, setConsultasEsteMes] = useState<number | null>(null);
  const [vacunasAplicadas, setVacunasAplicadas] = useState<number | null>(null);
  const [actividadMensual, setActividadMensual] = useState<any>(null);
  const [distribucionEspecies, setDistribucionEspecies] = useState<any[]>([]);

  // fecha para filtros (strings ISO yyyy-mm-dd)
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [h, tp, ce, va, am, de] = await Promise.all([
        getHistoriales(),
        getTotalPacientes(),
        getConsultasEsteMes(),
        getVacunasAplicadas(start || undefined, end || undefined),
        getActividadMensual(start || undefined, end || undefined),
        getDistribucionEspecies(),
      ]);
      setHistoriales(h || []);
      setTotalPacientes(tp?.total ?? null);
      setConsultasEsteMes(ce?.total ?? null);
      setVacunasAplicadas(va?.total ?? null);
      setActividadMensual(am ?? null);
      setDistribucionEspecies(de || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error al cargar reportes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch initial data
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefreshWithDates = async () => {
    setLoading(true);
    setError(null);
    try {
      const [va, am] = await Promise.all([
        getVacunasAplicadas(start || undefined, end || undefined),
        getActividadMensual(start || undefined, end || undefined),
      ]);
      setVacunasAplicadas(va?.total ?? null);
      setActividadMensual(am ?? null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error al cargar con fechas");
    } finally {
      setLoading(false);
    }
  };

  const reportStats = [
    {
      title: "Total pacientes",
      value: loading ? "Cargando..." : totalPacientes ?? "-",
      change: "-",
      changeType: "positive",
      description: "Pacientes registrados",
      icon: Users,
      bgColor: "bg-emerald-100",
      color: "text-emerald-600",
    },
    {
      title: "Consultas este mes",
      value: loading ? "Cargando..." : consultasEsteMes ?? "-",
      change: "-",
      changeType: "positive",
      description: "Consultas registradas en el mes",
      icon: Calendar,
      bgColor: "bg-sky-100",
      color: "text-sky-600",
    },
    {
      title: "Vacunas aplicadas",
      value: loading ? "Cargando..." : vacunasAplicadas ?? "-",
      change: "-",
      changeType: "positive",
      description: "Vacunas aplicadas en el periodo",
      icon: Syringe,
      bgColor: "bg-pink-100",
      color: "text-pink-600",
    },
  ];

  const [selectedPeriod, setSelectedPeriod] = useState<string>("12");

  const getBadgeVariant = (estado?: string) => {
    if (!estado) return "outline";
    const s = estado.toLowerCase();
    if (s.includes("cancel") || s.includes("rechaz")) return "destructive";
    if (s.includes("pend") || s.includes("espera")) return "secondary";
    return "default";
  };

  // Derivar datos para las gráficas desde la respuesta del API.
  const monthlyActivityData = useMemo(() => {
    if (!actividadMensual) return [];
    // Si la API devuelve un array por meses, mapeamos directo
    if (Array.isArray(actividadMensual)) {
      return actividadMensual.map((m: any) => ({
        month: m.month || m.mes || m.label || m.nombre || "-",
        consultas: m.consultas ?? m.consulta ?? 0,
        vacunas: m.vacunas ?? m.vacuna ?? 0,
        tratamientos: m.tratamientos ?? m.tratamiento ?? 0,
        cirugias: m.cirugias ?? m.cirugia ?? 0,
      }));
    }

    // Si la API devuelve un objeto agregado, creamos un único punto
    if (typeof actividadMensual === "object") {
      return [
        {
          month: start && end ? `${start} - ${end}` : "Periodo",
          consultas: actividadMensual.consulta ?? actividadMensual.consultas ?? 0,
          vacunas: actividadMensual.vacuna ?? actividadMensual.vacunas ?? 0,
          tratamientos: actividadMensual.tratamiento ?? actividadMensual.tratamientos ?? 0,
          cirugias: actividadMensual.cirugia ?? actividadMensual.cirugias ?? 0,
        },
      ];
    }

    return [];
  }, [actividadMensual, start, end]);

  const speciesDistributionData = useMemo(() => {
    const palette = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
    if (!distribucionEspecies || distribucionEspecies.length === 0) return [];
    return distribucionEspecies.map((d: any, i: number) => ({
      name: d.especie ?? d.name ?? "-",
      value: d.count ?? d.value ?? 0,
      color: palette[i % palette.length],
      percentage: d.percentage ?? null,
    }));
  }, [distribucionEspecies]);

  return (
    <div className="space-y-6">
      <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-600 mt-2">Estadísticas y métricas de rendimiento de la clínica</p>
        </div>

      {error && (
        <div style={{ color: "red", marginBottom: 12 }}>Error: {error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
        {reportStats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="flex items-center gap-1">
                {stat.changeType === "positive" ? (
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={`text-xs ${stat.changeType === "positive" ? "text-emerald-600" : "text-red-600"}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500">vs mes anterior</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros y controles */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtros de Período</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={selectedPeriod} onValueChange={(val) => setSelectedPeriod(val)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Últimos 3 meses</SelectItem>
                  <SelectItem value="6">Últimos 6 meses</SelectItem>
                  <SelectItem value="12">Último año</SelectItem>
                  <SelectItem value="24">Últimos 2 años</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => console.log('Abrir filtros avanzados')}>
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avanzados
              </Button>

              <div className="flex items-center gap-2">
                <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="px-2 py-1 border rounded" />
                <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="px-2 py-1 border rounded" />
                <Button variant="default" size="sm" onClick={handleRefreshWithDates} disabled={loading}>
                  Aplicar
                </Button>
                <Button variant="ghost" size="sm" onClick={fetchAll} disabled={loading}>
                  Refrescar
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Actividad mensual */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Actividad Mensual</CardTitle>
            <CardDescription>Consultas, vacunas, tratamientos y cirugías</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Cargando...</div>
            ) : monthlyActivityData.length === 0 ? (
              <div>No hay datos</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyActivityData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="consultas" fill="#10b981" radius={4} />
                  <Bar dataKey="vacunas" fill="#3b82f6" radius={4} />
                  <Bar dataKey="tratamientos" fill="#f59e0b" radius={4} />
                  <Bar dataKey="cirugias" fill="#ef4444" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Distribución por especies */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Distribución por Especies</CardTitle>
            <CardDescription>Porcentaje de pacientes por tipo de animal</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Cargando...</div>
            ) : speciesDistributionData.length === 0 ? (
              <div>No hay datos</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={speciesDistributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={4}
                    label
                  >
                    {speciesDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}

            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {speciesDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de historiales (shadcn UI) */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Historiales</CardTitle>
            <div className="text-sm text-gray-500">Total: {historiales.length}</div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Cargando...</div>
          ) : historiales.length === 0 ? (
            <div>No hay historiales</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Mascota</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Título</th>
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {historiales.map((h) => (
                    <tr key={h.idHistorial} className="border-b">
                      <td className="px-3 py-2 align-top">{h.idHistorial}</td>
                      <td className="px-3 py-2 align-top">{h.mascotaId}</td>
                      <td className="px-3 py-2 align-top">{h.tipoRegistro}</td>
                      <td className="px-3 py-2 align-top">{h.titulo}</td>
                      <td className="px-3 py-2 align-top">{h.fechaAplicacion ? new Date(h.fechaAplicacion).toLocaleDateString() : "-"}</td>
                      <td className="px-3 py-2 align-top">
                        <Badge variant={getBadgeVariant(h.estado)}>
                          {h.estado ?? "-"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => console.log('Ver', h.idHistorial)}>
                            Ver
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => console.log('Editar', h.idHistorial)}>
                            Editar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Paginación simple (placeholder) */}
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reportes;