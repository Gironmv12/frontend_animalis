import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, PawPrint, Stethoscope, BarChart2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import authService from "@/services/authService";
import Logo from "../../public/img/logo_animalis.svg";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Inicio", href: "/home", icon: Home },
  { name: "Propietarios", href: "/propietarios", icon: Users },
  { name: "Mascotas", href: "/mascotas", icon: PawPrint },
  { name: "Historial Médico", href: "/historialMedico", icon: Stethoscope },
  { name: "Reportes", href: "/reportes", icon: BarChart2 }
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => authService.logout(navigate);

  return (
    // oculto en sm, en lg es un flex-col con ancho fijo y altura completa
    <div className="hidden lg:flex lg:flex-col lg:w-64 flex-shrink-0 lg:h-full">
      {/* contenedor principal del sidebar: ocupa toda la altura disponible */}
      <div className="flex flex-col h-full min-h-0 bg-[--sidebar] text-[--sidebar-foreground] border-r border-[--sidebar-border]">
        {/* Header */}
        <div className="flex h-16 items-center px-4 border-b border-[--sidebar-border]">
          <div className="flex items-center">
            <img src={Logo} alt="Logo" />
          </div>
        </div>

        {/* Navigation: flex-1 para ocupar el espacio intermedio y permitir scroll */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.name}
                asChild
                variant="ghost"
                className={`w-full justify-start px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? "bg-emerald-100 text-emerald-700" : "hover:bg-emerald-50 hover:text-emerald-700"}`}
              >
                <Link to={item.href} className="flex items-center w-full">
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* Logout: mt-auto asegura que quede en el fondo si algo más cambia */}
        <div className="mt-auto border-t border-[--sidebar-border] p-4">
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-red-100 hover:text-red-800"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}