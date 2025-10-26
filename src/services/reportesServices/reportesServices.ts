
import api from "@/services/api";

export type Historial = {
	idHistorial: number;
	mascotaId: number;
	tipoRegistro: string;
	titulo: string;
	descripcion?: string;
	fechaAplicacion?: string;
	proximaFecha?: string | null;
	estado?: string;
	urgencia?: string;
	peso?: string;
	temperatura?: string;
	medicamentos?: string;
	notas?: string;
	veterinarioId?: number;
};

export const getHistoriales = async (): Promise<Historial[]> => {
	const res = await api.get<Historial[]>('/historiales');
	return res.data;
};

export const getTotalPacientes = async (): Promise<{ total: number }> => {
	const res = await api.get('/reportes/total-pacientes');
	return res.data;
};

export const getConsultasEsteMes = async (): Promise<{ total: number }> => {
	const res = await api.get('/reportes/consultas-este-mes');
	return res.data;
};

export const getVacunasAplicadas = async (start?: string, end?: string): Promise<{ total: number }> => {
	const params: any = {};
	if (start) params.start = start;
	if (end) params.end = end;
	const res = await api.get('/reportes/vacunas-aplicadas', { params });
	return res.data;
};

export const getActividadMensual = async (start?: string, end?: string): Promise<{ vacuna: number; tratamiento: number; cirugia: number; consulta: number }> => {
	const params: any = {};
	if (start) params.start = start;
	if (end) params.end = end;
	const res = await api.get('/reportes/actividad-mensual', { params });
	return res.data;
};

export type DistribucionEspecie = {
	especie: string;
	count: number;
	percentage: number;
};

export const getDistribucionEspecies = async (): Promise<DistribucionEspecie[]> => {
	const res = await api.get<DistribucionEspecie[]>('/reportes/distribucion-especies');
	return res.data;
};
