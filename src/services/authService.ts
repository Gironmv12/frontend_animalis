import api from "./api";
import type { NavigateFunction } from "react-router-dom";
//interface para tipar los datos
export interface LoginCredentials {
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
  idUsuario: number;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: string;
  estado: string;
  fechaCreacion: string;
  token: string;
}
//Servicio de autenticacion
const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    // Login can be slow on free backend; use a shorter timeout and opt-out of automatic retries
    const { data } = await api.post<LoginResponse>("users/login", credentials, {
      timeout: 10000,
      headers: { "x-no-retry": "1" },
    });
    // Store token
    localStorage.setItem("token", data.token);
    // store user without token
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { token: _unused, ...userData } = data;
    localStorage.setItem("user", JSON.stringify(userData));
    return data;
  },
  //cerramos la sesion de usuario eliminando el token del localstorage
  logout: (navigate?: NavigateFunction) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Mantener consistencia con el nombre usado en Login.tsx
    if (navigate) navigate("/", { replace: true });
  },
  //verificar si el usuario esta autenticado
  isAuthenticated: (): boolean => {
    return localStorage.getItem("token") !== null;
  },
};

export default authService;