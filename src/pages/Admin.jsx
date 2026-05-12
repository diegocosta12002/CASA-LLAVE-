import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Home as HomeIcon, Users, Settings, ArrowLeft, DollarSign, FileText, Hammer } from "lucide-react";
import LeadsCRM from "@/components/admin/leads/LeadsCRM";
import BudgetLeadsCRM from "@/components/admin/leads/BudgetLeadsCRM";
import SavedProjectsTable from "@/components/admin/SavedProjectsTable";
import PricingEditor from "@/components/admin/PricingEditor";
import TermsEditor from "@/components/admin/TermsEditor";
import SystemPricingEditor from "@/components/admin/SystemPricingEditor";

export default function Admin() {
  const [tab, setTab] = useState("budgets");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="https://media.base44.com/images/public/69c56c4515a812726693b5c3/cca51d797_LOGOTOBYCO.jpg"
                alt="TOBYCO"
                className="h-9 object-contain"
                onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }}
              />
              <span style={{ display: "none" }} className="font-display font-bold">TOBYCO</span>
            </Link>
            <Badge variant="secondary">Panel Admin</Badge>
          </div>
          <Link to="/configurator">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Volver al configurador
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-6">Panel de Administración</h1>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="budgets" className="gap-2">
              <FileText className="w-4 h-4" /> Presupuestos
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-2">
              <Users className="w-4 h-4" /> Consultas manuales
            </TabsTrigger>
            <TabsTrigger value="systems" className="gap-2">
              <Hammer className="w-4 h-4" /> Comparador de precios
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2">
              <DollarSign className="w-4 h-4" /> Presupuestador
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <Settings className="w-4 h-4" /> Proyectos guardados
            </TabsTrigger>
            <TabsTrigger value="terms" className="gap-2">
              <FileText className="w-4 h-4" /> Términos y Condiciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="budgets">
            <BudgetLeadsCRM />
          </TabsContent>
          <TabsContent value="systems">
            <SystemPricingEditor />
          </TabsContent>
          <TabsContent value="leads">
            <LeadsCRM />
          </TabsContent>
          <TabsContent value="projects">
            <SavedProjectsTable />
          </TabsContent>
          <TabsContent value="pricing">
            <PricingEditor />
          </TabsContent>
          <TabsContent value="terms">
            <TermsEditor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}