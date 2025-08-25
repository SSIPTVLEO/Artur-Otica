import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, X } from "lucide-react";
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

export default function ReceitaList() {
  const [receitas, setReceitas] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editingReceita, setEditingReceita] = useState<any | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    id: 0,
    id_os: 0,
    esferico_longe_od: "",
    cilindrico_longe_od: "",
    eixo_longe_od: "",
    dnp_longe_od: "",
    altura_od: "",
    adicao_od: "",
    esferico_longe_oe: "",
    cilindrico_longe_oe: "",
    eixo_longe_oe: "",
    dnp_longe_oe: "",
    altura_oe: "",
    adicao_oe: "",
  });

  const fetchReceitas = async () => {
    try {
      let query = supabase
        .from("receita")
        .select(`
          *,
          ordem_servico:ordem_servico!receita_id_os_fkey (
            numero_os,
            data_pedido,
            cliente:cliente!ordem_servico_id_cliente_fkey (
              nome
            )
          )
        `)
        .order("id", { ascending: false });
      
      if (search) {
        query = query.or(`id_os.eq.${search},ordem_servico.numero_os.ilike.%${search}%,ordem_servico.cliente.nome.ilike.%${search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setReceitas(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar receitas",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReceitas();
  }, [search]);

  const deleteReceita = async (id: number) => {
    try {
      const { error } = await supabase.from("receita").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Receita deletada com sucesso!" });
      fetchReceitas();
    } catch (error: any) {
      toast({
        title: "Erro ao deletar receita",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startEdit = (receita: any) => {
    setEditingReceita(receita);
    setForm({ 
      ...receita,
      esferico_longe_od: receita.esferico_longe_od?.toString() || "",
      cilindrico_longe_od: receita.cilindrico_longe_od?.toString() || "",
      eixo_longe_od: receita.eixo_longe_od?.toString() || "",
      dnp_longe_od: receita.dnp_longe_od?.toString() || "",
      altura_od: receita.altura_od?.toString() || "",
      adicao_od: receita.adicao_od?.toString() || "",
      esferico_longe_oe: receita.esferico_longe_oe?.toString() || "",
      cilindrico_longe_oe: receita.cilindrico_longe_oe?.toString() || "",
      eixo_longe_oe: receita.eixo_longe_oe?.toString() || "",
      dnp_longe_oe: receita.dnp_longe_oe?.toString() || "",
      altura_oe: receita.altura_oe?.toString() || "",
      adicao_oe: receita.adicao_oe?.toString() || "",
    });
  };

  const cancelEdit = () => {
    setEditingReceita(null);
    setForm({
      id: 0,
      id_os: 0,
      esferico_longe_od: "",
      cilindrico_longe_od: "",
      eixo_longe_od: "",
      dnp_longe_od: "",
      altura_od: "",
      adicao_od: "",
      esferico_longe_oe: "",
      cilindrico_longe_oe: "",
      eixo_longe_oe: "",
      dnp_longe_oe: "",
      altura_oe: "",
      adicao_oe: "",
    });
  };

  const saveReceita = async () => {
    try {
      // Convert string values to numbers for database insertion
      const formData = {
        ...form,
        esferico_longe_od: form.esferico_longe_od ? Number(form.esferico_longe_od) : null,
        cilindrico_longe_od: form.cilindrico_longe_od ? Number(form.cilindrico_longe_od) : null,
        eixo_longe_od: form.eixo_longe_od ? Number(form.eixo_longe_od) : null,
        dnp_longe_od: form.dnp_longe_od ? Number(form.dnp_longe_od) : null,
        altura_od: form.altura_od ? Number(form.altura_od) : null,
        adicao_od: form.adicao_od ? Number(form.adicao_od) : null,
        esferico_longe_oe: form.esferico_longe_oe ? Number(form.esferico_longe_oe) : null,
        cilindrico_longe_oe: form.cilindrico_longe_oe ? Number(form.cilindrico_longe_oe) : null,
        eixo_longe_oe: form.eixo_longe_oe ? Number(form.eixo_longe_oe) : null,
        dnp_longe_oe: form.dnp_longe_oe ? Number(form.dnp_longe_oe) : null,
        altura_oe: form.altura_oe ? Number(form.altura_oe) : null,
        adicao_oe: form.adicao_oe ? Number(form.adicao_oe) : null,
      };

      if (editingReceita && editingReceita.id) {
        const { error } = await supabase
          .from("receita")
          .update(formData)
          .eq("id", formData.id);
        if (error) throw error;
        toast({ title: "Receita atualizada com sucesso!" });
      } else {
        const { error } = await supabase.from("receita").insert([formData]);
        if (error) throw error;
        toast({ title: "Receita criada com sucesso!" });
      }
      cancelEdit();
      fetchReceitas();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar receita",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Receitas</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex justify-between mb-4">
              <Input
                placeholder="Pesquisar por OS, cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {!editingReceita && (
                <Button
                  variant="secondary"
                  className="ml-2"
                  onClick={() => setEditingReceita({})}
                >
                  <Plus className="mr-2" /> Nova Receita
                </Button>
              )}
            </div>

          {editingReceita && (
            <Card className="mb-4 p-4 bg-muted/50">
              <div className="flex justify-between mb-4">
                <CardTitle>{editingReceita.id ? "Editar Receita" : "Nova Receita"}</CardTitle>
                <Button variant="ghost" onClick={cancelEdit}>
                  <X />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Input
                    placeholder="ID OS"
                    value={form.id_os}
                    onChange={(e) => setForm({ ...form, id_os: Number(e.target.value) })}
                    className="mb-4"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Olho Direito (OD)</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Esférico"
                        value={form.esferico_longe_od}
                        onChange={(e) => setForm({ ...form, esferico_longe_od: e.target.value })}
                      />
                      <Input
                        placeholder="Cilíndrico"
                        value={form.cilindrico_longe_od}
                        onChange={(e) => setForm({ ...form, cilindrico_longe_od: e.target.value })}
                      />
                      <Input
                        placeholder="Eixo"
                        value={form.eixo_longe_od}
                        onChange={(e) => setForm({ ...form, eixo_longe_od: e.target.value })}
                      />
                      <Input
                        placeholder="DNP"
                        value={form.dnp_longe_od}
                        onChange={(e) => setForm({ ...form, dnp_longe_od: e.target.value })}
                      />
                      <Input
                        placeholder="Altura"
                        value={form.altura_od}
                        onChange={(e) => setForm({ ...form, altura_od: e.target.value })}
                      />
                      <Input
                        placeholder="Adição"
                        value={form.adicao_od}
                        onChange={(e) => setForm({ ...form, adicao_od: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Olho Esquerdo (OE)</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Esférico"
                        value={form.esferico_longe_oe}
                        onChange={(e) => setForm({ ...form, esferico_longe_oe: e.target.value })}
                      />
                      <Input
                        placeholder="Cilíndrico"
                        value={form.cilindrico_longe_oe}
                        onChange={(e) => setForm({ ...form, cilindrico_longe_oe: e.target.value })}
                      />
                      <Input
                        placeholder="Eixo"
                        value={form.eixo_longe_oe}
                        onChange={(e) => setForm({ ...form, eixo_longe_oe: e.target.value })}
                      />
                      <Input
                        placeholder="DNP"
                        value={form.dnp_longe_oe}
                        onChange={(e) => setForm({ ...form, dnp_longe_oe: e.target.value })}
                      />
                      <Input
                        placeholder="Altura"
                        value={form.altura_oe}
                        onChange={(e) => setForm({ ...form, altura_oe: e.target.value })}
                      />
                      <Input
                        placeholder="Adição"
                        value={form.adicao_oe}
                        onChange={(e) => setForm({ ...form, adicao_oe: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <Button className="mt-6" onClick={saveReceita}>
                {editingReceita.id ? "Atualizar Receita" : "Salvar Receita"}
              </Button>
            </Card>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número OS</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data Pedido</TableHead>
                <TableHead>Esférico OD</TableHead>
                <TableHead>Cilíndrico OD</TableHead>
                <TableHead>Esférico OE</TableHead>
                <TableHead>Cilíndrico OE</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receitas.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.ordem_servico?.numero_os || `OS-${r.id_os}`}</TableCell>
                  <TableCell>{r.ordem_servico?.cliente?.nome || "Cliente não encontrado"}</TableCell>
                  <TableCell>{r.ordem_servico?.data_pedido ? new Date(r.ordem_servico.data_pedido).toLocaleDateString('pt-BR') : "-"}</TableCell>
                  <TableCell>{r.esferico_longe_od}</TableCell>
                  <TableCell>{r.cilindrico_longe_od}</TableCell>
                  <TableCell>{r.esferico_longe_oe}</TableCell>
                  <TableCell>{r.cilindrico_longe_oe}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(r)}>
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteReceita(r.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
