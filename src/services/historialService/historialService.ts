import api from "../api";

// Tipos mínimos esperados del endpoint /historiales/{id}
// Tipos basados en la respuesta real del endpoint (array de registros)
export type HistorialRecord = {
	idHistorial: number;
	mascotaId: number;
	tipoRegistro: string;
	titulo: string;
	descripcion?: string | null;
	fechaAplicacion?: string | null;
	proximaFecha?: string | null;
	estado?: string | null;
	urgencia?: string | null;
	peso?: string | null;
	temperatura?: string | null;
	medicamentos?: string | null;
	notas?: string | null;
	veterinarioId?: number | null;
	[key: string]: any;
};

/**
 * Obtiene los registros de un historial por id: GET /historiales/{id}
 * El endpoint devuelve un array de registros (HistorialRecord[])
 */
export const getRegistrosHistorial = async (id: number): Promise<HistorialRecord[]> => {
	try {
		const { data } = await api.get<HistorialRecord[]>(`/historiales/${id}`);
		return data;
	} catch (error: any) {
		const message = error?.response?.data?.message || error?.message || "Error al obtener registros de historial";
		throw new Error(message);
	}
};

/**
 * Obtiene todos los registros de historiales: GET /historiales
 */     
export const getAllRegistrosHistorial = async (): Promise<HistorialRecord[]> => {
  try {
    const { data } = await api.get<HistorialRecord[]>(`/historiales`);
    return data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Error al obtener todos los registros de historial";
    throw new Error(message);
  }
};

export type CreateHistorialPayload = {
	mascotaId: number;
	tipoRegistro: string;
	titulo: string;
	descripcion?: string | null;
	fechaAplicacion?: string | null; // ISO date
	proximaFecha?: string | null; // ISO date
	estado?: string | null;
	urgencia?: string | null;
	peso?: number | null;
	temperatura?: number | null;
	medicamentos?: string | null;
	notas?: string | null;
	veterinarioId?: number | null;
};

export const createHistorial = async (payload: CreateHistorialPayload): Promise<any> => {
	try {
		const { data } = await api.post(`/historiales`, payload);
		return data;
	} catch (error: any) {
		const message = error?.response?.data?.message || error?.message || "Error al crear historial";
		throw new Error(message);
	}
};

export const updateHistorial = async (id: number, payload: CreateHistorialPayload): Promise<any> => {
	try {
		const { data } = await api.patch(`/historiales/${id}`, payload);
		return data;
	} catch (error: any) {
		const message = error?.response?.data?.message || error?.message || "Error al actualizar historial";
		throw new Error(message);
	}
};

export const deleteHistorial = async (id: number): Promise<any> => {
	try {
		const { data } = await api.delete(`/historiales/${id}`);
		return data;
	} catch (error: any) {
		const message = error?.response?.data?.message || error?.message || "Error al eliminar historial";
		throw new Error(message);
	}
};

export default {
	getRegistrosHistorial,
	getAllRegistrosHistorial,
	createHistorial,
	updateHistorial,
	deleteHistorial,
};
