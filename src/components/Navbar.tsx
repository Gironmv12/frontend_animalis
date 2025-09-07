import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoggedUser {
  idUsuario: number;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: string;
}

export default function Navbar() {
  const [user, setUser] = useState<LoggedUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored) as LoggedUser);
      } catch {
        // ignore parse error
        setUser(null);
      }
    }
  }, []);

  const initials = user ? user.nombre.charAt(0).toUpperCase() : "U";

  return (
    <div className="lg:pl-64">
      <div className="flex h-16 items-center justify-between bg-white border-b border-gray-200 px-4 lg:px-6">
        {/* Toggle sidebar button (placeholder) */}
        <Button variant="ghost" size="sm" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Right actions */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* User info */}
          <div className="flex items-center space-x-2">
            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-medium uppercase">
              {initials}
            </div>
            {/* Full name */}
            {user && (
              <span className="text-sm font-medium text-gray-700">
                {user.nombre} {user.apellidos}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
