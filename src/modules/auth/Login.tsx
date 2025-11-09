import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import authService, { type LoginCredentials } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Logo from "../../../public/img/logo_animalis.svg";

export const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    correo: "",
    contrasena: "",
  });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const performLogin = async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      await authService.login(credentials, { signal });
      // redireccionar al home si todo salio bien
      navigate("/reportes");
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.message === "canceled") {
        setError("Operación cancelada");
      } else if (err?.code === "ECONNABORTED" || err?.message?.toLowerCase()?.includes("timeout")) {
        setError("Servidor no responde. Intenta de nuevo.");
      } else {
        setError((err as Error).message || "Error al iniciar sesion");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // cancel previous if any
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    await performLogin(controller.signal);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/*Titulo del sistema y descripcion */}
      <div className="flex flex-col items-center space-y-2 mb-8">
        {/*LOGO */}
        <img src={Logo} alt="Logo" />
        <p className="text-gray-600">Sistema de gestion de animales</p>
      </div>
      {/*Formulario de login */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Iniciar Sesión</h1>
        
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
            Error al iniciar sesión, revise sus credenciales.
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Correo electrónico</label>
            <div className="relative">
              <Input
                type="email"
                name="correo"
                value={credentials.correo}
                onChange={handleChange}
                required
                className="pl-10"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Contraseña</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="contrasena"
                value={credentials.contrasena}
                onChange={handleChange}
                required
                className="pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={loading}
            >
              {loading ? "Procesando..." : "Iniciar sesión"}
            </Button>
            {loading && (
              <Button variant="outline" type="button" onClick={() => { abortRef.current?.abort(); setLoading(false); setError('Operación cancelada'); }}>
                Cancelar
              </Button>
            )}
          </div>

          {error && !loading && (
            <div className="flex justify-center">
              <Button variant="ghost" onClick={() => { abortRef.current?.abort(); const controller = new AbortController(); abortRef.current = controller; performLogin(controller.signal); }}>
                Reintentar
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
