import api from "@/services/api";

export type Veterinario = {
  id?: number;
  idVeterinario?: number;
  nombre?: string;
  apellidos?: string | null;
  nombreCompleto?: string | null;
  [key: string]: any;
};

class VeterinarioService {
  async getVeterinarioById(id: number): Promise<Veterinario> {
    try {
      const { data } = await api.get<Veterinario>(`/veterinarios/${id}`);
      return data;
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Error al obtener veterinario";
      throw new Error(message);
    }
  }
}

export default new VeterinarioService();
