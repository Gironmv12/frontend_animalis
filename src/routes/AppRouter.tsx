import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import Login from "@/modules/auth/Login";
import Home from "@/modules/home/Home";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/*RUTA DE LOGIN SIN LAYOUT */}
        <Route path="/login" element={<Login />} />
        {/*RUTAS CON LAYOUT (NAVBAR + SIDEBAR) */}
        <Route element={<DashboardLayout />}>
          {/*Home */}
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
