import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
function DashboardLayout() {
  return (
    <div className="flex h-screen">
      {/*SIDEBAR */}
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/*NAVBAR */}
        <Navbar />
        {/*CONTENIDO PRINCIPAL */}
        <div className="flex-1 p-6 bg-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
