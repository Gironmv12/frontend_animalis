import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import Login from "@/modules/auth/Login";
import Propietarios from "@/modules/propietarios/Propietarios";
import Mascotas from "@/modules/mascotas/Mascotas";
import HistorialMedico from "@/modules/historialMedico/HistorialMedico";
import Reportes from "@/modules/reportes/Reportes";
import CrearPropietario from "@/modules/propietarios/CrearPropietario";
import EditarPropietario from "@/modules/propietarios/EditarPropietario";
import DetallesPropietario from "@/modules/propietarios/DetallesPropietario";

import CrearMascota from "@/modules/mascotas/CrearMascota";
import EditarMascota from "@/modules/mascotas/EditarMascota";
import DetallesMascota from "@/modules/mascotas/DetallesMascota";

import CrearHistorial  from "@/modules/historialMedico/CrearHistorial";
import EditarHsitorial from "@/modules/historialMedico/EditarHsitorial";
import DetallesHistorial from "@/modules/historialMedico/DetallesHistorial";






export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/*RUTA DE LOGIN SIN LAYOUT */}
        <Route path="/" element={<Login />} />
        {/*RUTAS CON LAYOUT (NAVBAR + SIDEBAR) */}
        <Route element={<DashboardLayout />}>
          {/*Home */}
          <Route path="/reportes" element={<Reportes />} />
          {/*Propietarios */}
          <Route path="/propietarios" element={<Propietarios />} />
          <Route path="/propietarios/crear" element={<CrearPropietario />} />
          <Route path="/propietarios/editar/:id" element={<EditarPropietario />} />
          <Route path="/propietarios/detalles/:id" element={<DetallesPropietario />} />
          {/*Mascotas */}
          <Route path="/mascotas" element={<Mascotas />} />
          <Route path="/mascotas/crear" element={<CrearMascota />} />
          <Route path="/mascotas/editar/:id" element={<EditarMascota />} />
          <Route path="/mascotas/detalles/:id" element={<DetallesMascota />} />
          {/*Historial Medico */}
          <Route path="/historialMedico" element={<HistorialMedico />} />
          <Route path="/historialMedico/crear" element={<CrearHistorial />} />
          <Route path="/historialMedico/editar/:id" element={<EditarHsitorial />} />
          <Route path="/historialMedico/detalles/:id" element={<DetallesHistorial />} />
          {/*Reportes */}
          
        </Route>
      </Routes>
    </BrowserRouter>
  );  
};
