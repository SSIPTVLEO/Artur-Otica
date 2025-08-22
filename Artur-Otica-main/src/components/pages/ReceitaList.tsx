import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
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

  // Campos do formulário
  const [form, setForm] = useState({
    id: 0,
    nome_cliente: "",
    esferico_od: "",
    esferico_oe: "",
    cilindro_od: "",
    cilindro_oe: "",
    adicao: "",
    data_receita: "",
  });

  const fetchReceitas = async () => {
    try {
      let query = supabase
        .from("receita")
        .select("*")
        .order("data_receita", { ascending: false });

      if (search) query = query.ilike("nome_cliente", `%${search}%`);

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
      id: receita.id,
      nome_cliente: receita.nome_cliente,
      esferico_od: receita.esferico_od,
      esferico_oe: receita.esferico_oe,
      cilindro_od: receita.cilindro_od,
      cilindro_oe: receita.cilindro_oe,
      adicao: receita.adicao,
      data_receita: receita.data_receita?.split("T")[0] || "",
    });
  };

  const cancelEdit = () => {
    setEditingReceita(null);
    setForm({
      id: 0,
      nome_cliente: "",
      esferico_od: "",
      esferico_oe: "",
      cilindro_od: "",
      cilindro_oe: "",
      adicao: "",
      data_receita: "",
    });
  };

  const saveReceita = async () => {
    try {
      if (editingReceita) {
        const { error } = await supabase
          .from("receita")
          .update({
            nome_cliente: form.nome_cliente,
            esferico_od: form.esferico_od,
            esferico_oe: form.esferico_oe,
            cilindro_od: form.cilindro_od,
            cilindro_oe: form.cilindro_oe,
            adicao: form.adicao,
            data_receita: form.data_receita,
          })
          .eq("id", form.id);
        if (error) throw error;
        toast({ title: "Receita atualizada com sucesso!" });
      } else {
        const { error } = await supabase.from("receita").insert([form]);
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
              placeholder="Pesquisar por cliente..."
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

          {/* Formulário de edição/criação */}
          {editingReceita && (
            <Card className="mb-4 p-4 bg-gray-50">
              <div className="flex justify-between mb-4">
                <CardTitle>
                  {editingReceita.id ? "Editar Receita" : "Nova Receita"}
                </CardTitle>
                <Button variant="ghost" onClick={cancelEdit}>
                  <X />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Nome do Cliente"
                  value={form.nome_cliente}
                  onChange={(e) => setForm({ ...form, nome_cliente: e.target.value })}
                />
                <Input
                  placeholder="Esférico OD"
                  value={form.esferico_od}
                  onChange={(e) => setForm({ ...form, esferico_od: e.target.value })}
                />
                <Input
                  placeholder="Esférico OE"
                  value={form.esferico_oe}
                  onChange={(e) => setForm({ ...form, esferico_oe: e.target.value })}
                />
                <Input
                  placeholder="Cilindro OD"
                  value={form.cilindro_od}
                  onChange={(e) => setForm({ ...form, cilindro_od: e.target.value })}
                />
                <Input
                  placeholder="Cilindro OE"
                  value={form.cilindro_oe}
                  onChange={(e) => setForm({ ...form, cilindro_oe: e.target.value })}
                />
                <Input
                  placeholder="Adição"
                  value={form.adicao}
                  onChange={(e) => setForm({ ...form, adicao: e.target.value })}
                />
                <Input
                  type="date"
                  placeholder="Data Receita"
                  value={form.data_receita}
                  onChange={(e) => setForm({ ...form, data_receita: e.target.value })}
                />
              </div>
              <Button className="mt-4" onClick={saveReceita}>
                {editingReceita.id ? "Atualizar Receita" : "Salvar Receita"}
              </Button>
            </Card>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Esférico OD</TableHead>
                <TableHead>Esférico OE</TableHead>
                <TableHead>Cilindro OD</TableHead>
                <TableHead>Cilindro OE</TableHead>
                <TableHead>Adição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receitas.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.nome_cliente}</TableCell>
                  <TableCell>{r.esferico_od}</TableCell>
                  <TableCell>{r.esferico_oe}</TableCell>
                  <TableCell>{r.cilindro_od}</TableCell>
                  <TableCell>{r.cilindro_oe}</TableCell>
                  <TableCell>{r.adicao}</TableCell>
                  <TableCell>
                    {r.data_receita ? new Date(r.data_receita).toLocaleDateString() : "-"}
                  </TableCell>
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
