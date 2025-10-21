import api from "@/services/api";

export type Usuario = {
  idUsuario?: number;
  nombre?: string;
  apellidos?: string;
  correo?: string;
  rol?: string;
  [key: string]: any;
};

class UsuarioService {
  async getVeterinarios(): Promise<Usuario[]> {
    try {
      // Intentar obtener usuarios filtrando por rol. El backend puede usar 'rol' o 'role'.
      const { data } = await api.get<Usuario[]>("/users", { params: { rol: "veterinario" } });
      return data;
    } catch (err: any) {
      // Reintentar con 'role' por compatibilidad
      try {
        const { data } = await api.get<Usuario[]>("/users", { params: { role: "veterinario" } });
        return data;
      } catch (e: any) {
        const message = err?.response?.data?.message || err?.message || "Error al obtener veterinarios";
        throw new Error(message);
      }
    }
  }
}

export default new UsuarioService();
