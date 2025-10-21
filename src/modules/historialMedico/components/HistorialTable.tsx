
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Mascota } from "@/services/mascotasService/mascotaService";

type Props = {
  mascota: Mascota;
};

const HistorialTable = ({ mascota }: Props) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle>Detalles de la Mascota</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <table className="w-full table-auto text-sm">
          <tbody>
            <tr>
              <td className="font-semibold py-2">ID</td>
              <td className="py-2">{mascota.idMascota}</td>
            </tr>
            <tr>
              <td className="font-semibold py-2">Nombre</td>
              <td className="py-2">{mascota.nombre}</td>
            </tr>
            <tr>
              <td className="font-semibold py-2">Especie</td>
              <td className="py-2">{mascota.especie ?? "-"}</td>
            </tr>
            <tr>
              <td className="font-semibold py-2">Raza</td>
              <td className="py-2">{mascota.raza ?? "-"}</td>
            </tr>
            <tr>
              <td className="font-semibold py-2">Edad</td>
              <td className="py-2">{mascota.edad ?? "-"}</td>
            </tr>
            <tr>
              <td className="font-semibold py-2">Género</td>
              <td className="py-2">{mascota.genero ?? "-"}</td>
            </tr>
            <tr>
              <td className="font-semibold py-2">Fecha Nacimiento</td>
              <td className="py-2">{mascota.fechaNacimiento ?? "-"}</td>
            </tr>
            <tr>
              <td className="font-semibold py-2">Propietario</td>
              <td className="py-2">{mascota.propietarioNombre ?? mascota.propietarioId ?? "-"}</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default HistorialTable;