import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

function DashboardLayout() {
  return (
    // Grid principal: 1 columna en sm, en lg 2 columnas: 1 columna fija (sidebar) + 1 columna flexible (contenido).
    // Filas: header auto + contenido flexible (1fr) en todas las resoluciones.
    <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] grid-rows-[auto_1fr] h-screen">
      {/* Sidebar: oculto en sm, en lg ocupa la primera columna y las 2 filas (header + contenido) */}
      <aside className="hidden lg:flex lg:flex-col lg:row-span-2">
        <Sidebar />
      </aside>

      {/* Navbar: en sm ocupa toda la fila superior; en lg ocupa la segunda columna (col-start-2 fila 1) */}
      <header className="col-span-1 lg:col-start-2 lg:row-start-1">
        <Navbar />
      </header>

      {/* Contenido principal: en lg ocupa la segunda columna y la fila de contenido (1fr) */}
      <main className="col-span-1 lg:col-start-2 p-6 bg-gray-100 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
