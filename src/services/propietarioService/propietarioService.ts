import api from "@/services/api";

export interface Propietario {
    id: string;
    nombre: string;
    apellidos: string;
    correo: string;
    telefono: string;
    direccion: string;
    estado: string;
    notas: string;
    fechaUltimaVisita: string;
}

const propietarioService = {
    async getAll(): Promise<Propietario[]> {
        const { data } = await api.get<Propietario[]>("/propietarios");
        return data;
    }
}

export default propietarioService