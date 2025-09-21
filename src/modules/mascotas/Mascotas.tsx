import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom';
import MascotaTable from './components/MascotaTable';

const Mascotas: React.FC = () => {
  
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mascotas</h1>
            <p className="text-gray-600 mt-2">Gestiona la información de todas las mascotas registradas</p>
          </div>
          <Link to="/mascotas/crear">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Mascota
            </Button>
          </Link>
        </div>
        <MascotaTable />
      </div>
  );
};

export default Mascotas;