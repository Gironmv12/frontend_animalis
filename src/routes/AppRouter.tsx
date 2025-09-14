import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import Login from "@/modules/auth/Login";
import Home from "@/modules/home/Home";
import Propietarios from "@/modules/propietarios/Propietarios";
import Mascotas from "@/modules/mascotas/Mascotas";
import HistorialMedico from "@/modules/historialMedico/HistorialMedico";
import Reportes from "@/modules/reportes/Reportes";
import CrearPropietario from "@/modules/propietarios/CrearPropietario";
import EditarPropietario from "@/modules/propietarios/EditarPropietario";
import DetallesPropietario from "@/modules/propietarios/DetallesPropietario";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/*RUTA DE LOGIN SIN LAYOUT */}
        <Route path="/" element={<Login />} />
        {/*RUTAS CON LAYOUT (NAVBAR + SIDEBAR) */}
        <Route element={<DashboardLayout />}>
          {/*Home */}
          <Route path="/home" element={<Home />} />
          {/*Propietarios */}
          <Route path="/propietarios" element={<Propietarios />} />
          <Route path="/propietarios/crear" element={<CrearPropietario />} />
          <Route path="/propietarios/editar/:id" element={<EditarPropietario />} />
          <Route path="/propietarios/detalles/:id" element={<DetallesPropietario />} />
          {/*Mascotas */}
          <Route path="/mascotas" element={<Mascotas />} />
          {/*Historial Medico */}
          <Route path="/historialMedico" element={<HistorialMedico />} />
          {/*Reportes */}
          <Route path="/reportes" element={<Reportes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );  
};
