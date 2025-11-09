
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
	const cacheKey = `reportes_vacunas_aplicadas_${start || 'none'}_${end || 'none'}`;
	try {
		const res = await api.get('/reportes/vacunas-aplicadas', { params });
		// cache result and mark as fresh
		try { localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: res.data })); localStorage.removeItem(cacheKey + '_used'); } catch {}
		return res.data;
	} catch (err) {
		// fallback to cache if available
		try {
			const cached = localStorage.getItem(cacheKey);
			if (cached) {
				try { localStorage.setItem(cacheKey + '_used', '1'); } catch {}
				return JSON.parse(cached).data;
			}
		} catch {}
		throw err;
	}
};

export const getActividadMensual = async (start?: string, end?: string): Promise<{ vacuna: number; tratamiento: number; cirugia: number; consulta: number }> => {
	const params: any = {};
	if (start) params.start = start;
	if (end) params.end = end;
	const cacheKey = `reportes_actividad_mensual_${start || 'none'}_${end || 'none'}`;
	try {
		const res = await api.get('/reportes/actividad-mensual', { params });
		try { localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: res.data })); localStorage.removeItem(cacheKey + '_used'); } catch {}
		return res.data;
	} catch (err) {
		try {
			const cached = localStorage.getItem(cacheKey);
			if (cached) {
				try { localStorage.setItem(cacheKey + '_used', '1'); } catch {}
				return JSON.parse(cached).data;
			}
		} catch {}
		throw err;
	}
};

export type DistribucionEspecie = {
	especie: string;
	count: number;
	percentage: number;
};

export const getDistribucionEspecies = async (): Promise<DistribucionEspecie[]> => {
	const cacheKey = `reportes_distribucion_especies`;
	try {
		const res = await api.get<DistribucionEspecie[]>('/reportes/distribucion-especies');
		try { localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: res.data })); localStorage.removeItem(cacheKey + '_used'); } catch {}
		return res.data;
	} catch (err) {
		try {
			const cached = localStorage.getItem(cacheKey);
			if (cached) {
				try { localStorage.setItem(cacheKey + '_used', '1'); } catch {}
				return JSON.parse(cached).data;
			}
		} catch {}
		throw err;
	}
};
