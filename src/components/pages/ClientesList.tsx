import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client"; // ✅ corrigido
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
import { Label } from "@/components/ui/label";

interface Cliente {
  id: number;
  nome: string;
  cpf?: string;
  telefone?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  data_nascimento?: string;
  created_by?: string;
}

export function ClientesList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    endereco: "",
    bairro: "",
    cidade: "",
    data_nascimento: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("cliente") // 🔄 verifique se é "cliente" ou "clientes"
        .select("*")
        .order("nome");

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      if (editingCliente) {
        // 🔄 Atualizar cliente (não precisa mexer no created_by)
        const { error } = await supabase
          .from("cliente")
          .update(formData)
          .eq("id", editingCliente.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Cliente atualizado!" });
      } else {
        // 🔄 Criar novo cliente com created_by
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const userId = userData?.user?.id;
        if (!userId) throw new Error("Usuário não autenticado");

        const { error } = await supabase
          .from("cliente")
          .insert([{ ...formData, created_by: userId }]); // ✅ agora inclui created_by

        if (error) throw error;
        toast({ title: "Sucesso", description: "Cliente criado!" });
      }

      setIsDialogOpen(false);
      setEditingCliente(null);
      setFormData({
        nome: "",
        cpf: "",
        telefone: "",
        endereco: "",
        bairro: "",
        cidade: "",
        data_nascimento: "",
      });
      fetchClientes();
    } catch (error: any) {
      console.error("Erro ao salvar cliente:", error.message || error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o cliente.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      cpf: cliente.cpf || "",
      telefone: cliente.telefone || "",
      endereco: cliente.endereco || "",
      bairro: cliente.bairro || "",
      cidade: cliente.cidade || "",
      data_nascimento: cliente.data_nascimento || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

    try {
      const { error } = await supabase
        .from("cliente")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Sucesso", description: "Cliente excluído!" });
      fetchClientes();
    } catch (error: any) {
      console.error("Erro ao excluir cliente:", error.message || error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o cliente.",
        variant: "destructive",
      });
    }
  };

  const filteredClientes = clientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cpf?.includes(searchTerm) ||
    cliente.telefone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Clientes</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCliente ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!formData.nome}>
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell>{cliente.cpf || "-"}</TableCell>
                  <TableCell>{cliente.telefone || "-"}</TableCell>
                  <TableCell>{cliente.cidade || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(cliente)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(cliente.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredClientes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum cliente encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
