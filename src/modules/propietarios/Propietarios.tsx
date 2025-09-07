import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import PropietarioTable from "@/modules/propietarios/PropietarioTable"

const Propietarios = () => {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[--foreground]">Propietarios</h1>
            <p className="text-gray-600 mt-2">Gestiona la información de los propietarios de mascotas</p>
          </div>
          <Link to="#">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Propietario
            </Button>
          </Link>
        </div>

        <PropietarioTable />
      </div>
  )
}

export default Propietarios