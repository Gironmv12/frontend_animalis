import api from "@/services/api";

export interface Propietario {
    id: number;
    nombre: string;
    apellidos: string;
    correo: string;
    telefono: string;
    direccion: string;
    estado: string;
    notas: string;
    fechaUltimaVisita: string;
}

export interface Mascota {
    idMascota: number;
    nombre : string;
    especie: string;
    raza: string;
    edad: number;
    fechaUltimaVisita: string;
    foto: string;
}

type PropietarioCreate = Omit<Propietario, "id">;

class PropietarioService {
    // Obtener todos los propietarios
    async getAll(): Promise<Propietario[]> {
        const response = await api.get<Propietario[]>("/propietarios");
        return response.data;
    }

    // Crear un propietario
    async create(propietario: PropietarioCreate): Promise<Propietario> {
        const response = await api.post<Propietario>("/propietarios", propietario);
        return response.data;
    }

    //obtener detalle (propietario + mascotas)
    async getDetalle(id: number): Promise<{ propietario: Propietario; mascotas: Mascota[] }> {
        const response = await api.get<{ propietario: Propietario; mascotas: Mascota[] }>(`/propietarios/${id}/detalle`);
        return response.data;
    }

    //actualizar un propietario
    async update(id: number, propietario: Partial<PropietarioCreate> | PropietarioCreate): Promise<Propietario> {
        const response = await api.put<Propietario>(`/propietarios/${id}`, propietario);
        return response.data;
    }

    //eliminar un propietario
    async delete(id: number): Promise<void> {
        await api.delete(`/propietarios/${id}`);
    }
}

export default new PropietarioService();