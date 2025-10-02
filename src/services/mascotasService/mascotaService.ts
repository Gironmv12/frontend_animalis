import api from '../api';

export type GeneroMascota = 'macho' | 'hembra';

export type EstadoMascota = 'saludable' | 'en_tratamiento' | 'vacunacion';

export type Mascota = {
    idMascota: number;
    nombre: string;
    especie: string;
    raza: string | null;
    edad: number | null;
    genero: GeneroMascota | null;
    fechaNacimiento: string | null;
    propietarioId: number | null;
    propietarioNombre: string | null;
    estado: EstadoMascota | null;
    color: string | null;
    microchip: string | null;
    peso: string | null;
    notas: string | null;
    foto: string | null;
};

export type CreateMascotaPayload = {
  nombre: string;
  especie: string;
  raza?: string | null;
  edad?: number | null;
  genero?: GeneroMascota | null;
  fechaNacimiento?: string | null; // ISO date string or null
  estado?: EstadoMascota | null;
  color?: string | null;
  microchip?: string | null;
  peso?: string | null;
  notas?: string | null;
  foto?: string | null;
  propietario: {
    connect: {
      idPropietario: number;
    };
  };
};

/**
 * Obtiene todas las mascotas desde el endpoint /mascotas
 */
export const getMascotas = async (): Promise<Mascota[]> => {
    try {
        const { data } = await api.get<Mascota[]>('/mascotas');
        return data;
    } catch (error: any) {
        const message =
            error?.response?.data?.message || error?.message || 'Error al obtener mascotas';
        throw new Error(message);
    }
};

/**
 * Crea una nueva mascota (POST /mascotas)
 */
export const createMascota = async (payload: CreateMascotaPayload): Promise<Mascota> => {
    try {
        const { data } = await api.post<Mascota>('/mascotas', payload);
        return data;
    } catch (error: any) {
        const message =
            error?.response?.data?.message || error?.message || 'Error al crear mascota';
        throw new Error(message);
    }
};

/**
 * Sube una foto para la mascota (POST /mascotas/{id}/foto)
 * Se espera multipart/form-data con field "file"
 * Devuelve lo que el backend retorne (puede ser la mascota actualizada o un objeto con { foto: string })
 */
export const uploadMascotaFoto = async (id: number, file: File): Promise<any> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await api.post(`/mascotas/${id}/foto`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return data;
    } catch (error: any) {
        const message =
            error?.response?.data?.message || error?.message || 'Error al subir foto';
        throw new Error(message);
    }
};