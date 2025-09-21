import api from '../api';

export type Mascota = {
    idMascota: number;
    nombre: string;
    especie: string;
    raza: string | null;
    edad: number | null;
    genero: string | null;
    fechaNacimiento: string | null;
    propietarioId: number | null;
    propietarioNombre: string | null;
    estado: string | null;
    color: string | null;
    microchip: string | null;
    peso: string | null;
    notas: string | null;
    foto: string | null;
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