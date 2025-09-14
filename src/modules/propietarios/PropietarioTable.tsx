import { useEffect, useState, useMemo } from "react";
import propietarioService, { type Propietario } from "@/services/propietarioService/propietarioService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, MapPin, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Link } from "react-router-dom"; // <-- Añadir import

function PropietarioTable() {
  const [owners, setOwners] = useState<Propietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const statusColors: Record<string, string> = {
    A: "bg-green-100 text-green-800",
    I: "bg-gray-100 text-gray-800",
  };

  const statusLabels: Record<string, string> = {
    A: "Activo",
    I: "Inactivo",
  };

  useEffect(() => {
    propietarioService
      .getAll()
      .then(setOwners)
      .catch(() => setError("Error al cargar propietarios"))
      .finally(() => setLoading(false));
  }, []);

  const filteredOwners = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return owners.filter((o) =>
      [o.nombre, o.apellidos, o.correo, o.telefono].some((v) => v.toLowerCase().includes(term))
    );
  }, [owners, searchTerm]);

  const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);
  const paginatedOwners = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOwners.slice(start, start + itemsPerPage);
  }, [filteredOwners, currentPage]);

  if (loading) return <p className="text-sm text-[--muted-foreground]">Cargando...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lista de Propietarios</CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 focus:border-[--primary] focus:ring-[--primary]"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {paginatedOwners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? "No se encontraron propietarios" : "No hay propietarios registrados"}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedOwners.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-[--foreground]">
                      {o.nombre} {o.apellidos}
                    </h3>
                    <Badge className={statusColors[o.estado] ?? "bg-gray-100 text-gray-800"}>
                      {statusLabels[o.estado] ?? "Desconocido"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {o.correo}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {o.telefono}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {o.direccion}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Última visita: {new Date(o.fechaUltimaVisita).toLocaleDateString("es-ES")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/propietarios/detalles/${o.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  );
}

export default PropietarioTable;