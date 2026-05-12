import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { formatCurrency } from "@/lib/pricingData";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavedProjectsTable() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['saved-projects'],
    queryFn: () => base44.entities.SavedProject.list('-created_date'),
    initialData: [],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Proyectos guardados</span>
          <Badge variant="secondary">{projects.length} total</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No hay proyectos guardados aún
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Superficie</TableHead>
                  <TableHead>Sistema</TableHead>
                  <TableHead>Acabados</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.project_name}</TableCell>
                    <TableCell>{project.area_m2} m²</TableCell>
                    <TableCell>
                      <Badge variant="outline">{project.construction_system}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {project.finish_mode === "simple" ? project.finish_tier : "Personalizado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {project.total_price ? formatCurrency(project.total_price) : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {project.created_date ? format(new Date(project.created_date), 'dd/MM/yyyy') : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}