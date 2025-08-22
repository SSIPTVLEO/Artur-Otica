import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReceitaForm } from "./ReceitaForm";

interface Receita {
  id: number;
  id_os: number;
  cliente_nome?: string;
  numero_os?: string;
  esferico_longe_od?: number;
  cilindrico_longe_od?: number;
  esferico_longe_oe?: number;
  cilindrico_longe_oe?: number;
  created_at?: string;
}

export function ReceitaList() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReceita, setEditingReceita] = useState<Receita | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReceitas();
  }, []);

  const fetchReceitas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("receita")
        .select(`
          id,
          id_os,
          created_at,
          ESFERICO_LONGE_OD,
          CILINDRICO_LONGE_OD,
          ESFERICO_LONGE_OE,
          CILINDRICO_LONGE_OE,
          ordem_servico:ordem_servico (
            numero_os,
            cliente:cliente (
              nome
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const receitasFormatadas = data?.map((r: any) => ({
        id: r.id,
        id_os: r.id_os,
        created_at: r.created_at,
        esferico_longe_od: r.ESFERICO_LONGE_OD ?? null,
        cilindrico_longe_od: r.CILINDRICO_LONGE_OD ?? null,
        esferico_longe_oe: r.ESFERICO_LONGE_OE ?? null,
        cilindrico_longe_oe: r.CILINDRICO_LONGE_OE ?? null,
        numero_os: r.ordem_servico?.numero_os || "-",
        cliente_nome: r.ordem_servico?.cliente?.nome || "-",
      }));

      setReceitas(receitasFormatadas || []);
    } catch (error) {
      console.error("Erro ao buscar receitas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as receitas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta receita?")) return;

    try {
      const { error } = await supabase.from("receita").delete().eq("id", id);

      if (error) throw error;
      toast({ title: "Sucesso", description: "Receita excluída!" });
      fetchReceitas();
    } catch (error: any) {
      console.error("Erro ao excluir receita:", error.message || error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir a receita.",
        variant: "destructive",
      });
    }
  };

  const filteredReceitas = receitas.filter(
    (r) =>
      r.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.numero_os?.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Receitas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow">
              <Plus className="mr-2 h-4 w-4" />
              Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {editingReceita ? "Editar Receita" : "Nova Receita"}
              </DialogTitle>
            </DialogHeader>
            <ReceitaForm
              ordemServicoId={editingReceita?.id_os}
              onSuccess={() => {
                setIsDialogOpen(false);
                setEditingReceita(null);
                fetchReceitas();
              }}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Buscar por cliente ou OS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-muted-foreground">Carregando receitas...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº OS</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>OD Esférico</TableHead>
                    <TableHead>OD Cilíndrico</TableHead>
                    <TableHead>OE Esférico</TableHead>
                    <TableHead>OE Cilíndrico</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceitas.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.numero_os}</TableCell>
                      <TableCell>{r.cliente_nome}</TableCell>
                      <TableCell>
                        {r.created_at ? new Date(r.created_at).toLocaleDateString("pt-BR") : "-"}
                      </TableCell>
                      <TableCell>{r.esferico_longe_od ?? "-"}</TableCell>
                      <TableCell>{r.cilindrico_longe_od ?? "-"}</TableCell>
                      <TableCell>{r.esferico_longe_oe ?? "-"}</TableCell>
                      <TableCell>{r.cilindrico_longe_oe ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingReceita(r)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(r.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredReceitas.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma receita encontrada.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}