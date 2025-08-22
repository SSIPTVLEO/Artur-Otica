import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, DollarSign } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Pagamento {
  id: number;
  id_os: number;
  valor_armacao?: number;
  valor_lente?: number;
  valor_total: number;
  entrada?: number;
  parcelas?: number;
  valor_parcelas?: number;
  forma_pagamento?: string;
  status?: string;
  ordem_servico?: {
    numero_os: string;
    cliente?: {
      nome: string;
    };
  };
}

interface OrdemServico {
  id: number;
  numero_os: string;
  cliente?: {
    nome: string;
  };
}

export function PagamentosList() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPagamento, setEditingPagamento] = useState<Pagamento | null>(null);
  const [formData, setFormData] = useState({
    id_os: "",
    valor_armacao: "",
    valor_lente: "",
    valor_total: "",
    entrada: "",
    parcelas: "",
    valor_parcelas: "",
    forma_pagamento: "",
    status: "pendente",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPagamentos();
    fetchOrdens();
  }, []);

  useEffect(() => {
    // Calcular valor total automaticamente
    const armacao = parseFloat(formData.valor_armacao) || 0;
    const lente = parseFloat(formData.valor_lente) || 0;
    const total = armacao + lente;
    setFormData(prev => ({ ...prev, valor_total: total.toString() }));
  }, [formData.valor_armacao, formData.valor_lente]);

  useEffect(() => {
    // Calcular valor das parcelas automaticamente
    const total = parseFloat(formData.valor_total) || 0;
    const entrada = parseFloat(formData.entrada) || 0;
    const numParcelas = parseInt(formData.parcelas) || 1;
    
    if (total > 0 && numParcelas > 0) {
      const valorParcelado = (total - entrada) / numParcelas;
      setFormData(prev => ({ 
        ...prev, 
        valor_parcelas: valorParcelado > 0 ? valorParcelado.toFixed(2) : "0"
      }));
    }
  }, [formData.valor_total, formData.entrada, formData.parcelas]);

  const fetchPagamentos = async () => {
    try {
      const { data, error } = await supabase
        .from("pagamento")
        .select(`
          *,
          ordem_servico:ordem_servico!pagamento_id_os_fkey (
            numero_os,
            cliente:cliente!ordem_servico_id_cliente_fkey (
              nome
            )
          )
        `)
        .order("id", { ascending: false });

      if (error) throw error;
      setPagamentos(data || []);
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pagamentos.",
        variant: "destructive",
      });
    }
  };

  const fetchOrdens = async () => {
    try {
      const { data, error } = await supabase
        .from("ordem_servico")
        .select(`
          id,
          numero_os,
          cliente:cliente!ordem_servico_id_cliente_fkey (
            nome
          )
        `)
        .order("numero_os");

      if (error) throw error;
      setOrdens(data || []);
    } catch (error) {
      console.error("Erro ao buscar ordens:", error);
    }
  };

  const handleSave = async () => {
    try {
      const dataToSave = {
        id_os: parseInt(formData.id_os),
        valor_armacao: formData.valor_armacao ? parseFloat(formData.valor_armacao) : null,
        valor_lente: formData.valor_lente ? parseFloat(formData.valor_lente) : null,
        valor_total: parseFloat(formData.valor_total),
        entrada: formData.entrada ? parseFloat(formData.entrada) : null,
        parcelas: formData.parcelas ? parseInt(formData.parcelas) : null,
        valor_parcelas: formData.valor_parcelas ? parseFloat(formData.valor_parcelas) : null,
        forma_pagamento: formData.forma_pagamento || null,
        status: formData.status,
      };

      if (editingPagamento) {
        const { error } = await supabase
          .from("pagamento")
          .update(dataToSave)
          .eq("id", editingPagamento.id);
        
        if (error) throw error;
        toast({ title: "Sucesso", description: "Pagamento atualizado!" });
      } else {
        const { error } = await supabase
          .from("pagamento")
          .insert([dataToSave]);
        
        if (error) throw error;
        toast({ title: "Sucesso", description: "Pagamento criado!" });
      }
      
      setIsDialogOpen(false);
      setEditingPagamento(null);
      resetForm();
      fetchPagamentos();
    } catch (error) {
      console.error("Erro ao salvar pagamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o pagamento.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      id_os: "",
      valor_armacao: "",
      valor_lente: "",
      valor_total: "",
      entrada: "",
      parcelas: "",
      valor_parcelas: "",
      forma_pagamento: "",
      status: "pendente",
    });
  };

  const handleEdit = (pagamento: Pagamento) => {
    setEditingPagamento(pagamento);
    setFormData({
      id_os: String(pagamento.id_os),
      valor_armacao: pagamento.valor_armacao?.toString() || "",
      valor_lente: pagamento.valor_lente?.toString() || "",
      valor_total: pagamento.valor_total.toString(),
      entrada: pagamento.entrada?.toString() || "",
      parcelas: pagamento.parcelas?.toString() || "",
      valor_parcelas: pagamento.valor_parcelas?.toString() || "",
      forma_pagamento: pagamento.forma_pagamento || "",
      status: pagamento.status || "pendente",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este pagamento?")) return;
    
    try {
      const { error } = await supabase
        .from("pagamento")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast({ title: "Sucesso", description: "Pagamento excluído!" });
      fetchPagamentos();
    } catch (error) {
      console.error("Erro ao excluir pagamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o pagamento.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "pago": return "bg-green-500";
      case "pendente": return "bg-yellow-500";
      case "cancelado": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const filteredPagamentos = pagamentos.filter((pagamento) =>
    pagamento.ordem_servico?.numero_os.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pagamento.ordem_servico?.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pagamento.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pagamentos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow">
              <Plus className="mr-2 h-4 w-4" />
              Novo Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPagamento ? "Editar Pagamento" : "Novo Pagamento"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <Label htmlFor="id_os">Ordem de Serviço *</Label>
                <Select
                  value={formData.id_os}
                  onValueChange={(value) => setFormData({ ...formData, id_os: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma OS" />
                  </SelectTrigger>
                  <SelectContent>
                    {ordens.map((ordem) => (
                      <SelectItem key={ordem.id} value={String(ordem.id)}>
                        {ordem.numero_os} - {ordem.cliente?.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="valor_armacao">Valor Armação (R$)</Label>
                <Input
                  id="valor_armacao"
                  type="number"
                  step="0.01"
                  value={formData.valor_armacao}
                  onChange={(e) => setFormData({ ...formData, valor_armacao: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="valor_lente">Valor Lente (R$)</Label>
                <Input
                  id="valor_lente"
                  type="number"
                  step="0.01"
                  value={formData.valor_lente}
                  onChange={(e) => setFormData({ ...formData, valor_lente: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="valor_total">Valor Total (R$)</Label>
                <Input
                  id="valor_total"
                  type="number"
                  step="0.01"
                  value={formData.valor_total}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="entrada">Entrada (R$)</Label>
                <Input
                  id="entrada"
                  type="number"
                  step="0.01"
                  value={formData.entrada}
                  onChange={(e) => setFormData({ ...formData, entrada: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="parcelas">Número de Parcelas</Label>
                <Input
                  id="parcelas"
                  type="number"
                  value={formData.parcelas}
                  onChange={(e) => setFormData({ ...formData, parcelas: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="valor_parcelas">Valor por Parcela (R$)</Label>
                <Input
                  id="valor_parcelas"
                  type="number"
                  step="0.01"
                  value={formData.valor_parcelas}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                <Select
                  value={formData.forma_pagamento}
                  onValueChange={(value) => setFormData({ ...formData, forma_pagamento: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="parcelado">Parcelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setEditingPagamento(null);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!formData.id_os || !formData.valor_total}>
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
              placeholder="Buscar pagamentos..."
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
                <TableHead>OS</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Forma de Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPagamentos.map((pagamento) => (
                <TableRow key={pagamento.id}>
                  <TableCell>{pagamento.ordem_servico?.numero_os}</TableCell>
                  <TableCell>{pagamento.ordem_servico?.cliente?.nome}</TableCell>
                  <TableCell>R$ {pagamento.valor_total.toFixed(2)}</TableCell>
                  <TableCell>{pagamento.forma_pagamento || "-"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(pagamento.status)}>
                      {pagamento.status || "pendente"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {pagamento.parcelas ? `${pagamento.parcelas}x R$ ${pagamento.valor_parcelas?.toFixed(2)}` : "À vista"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(pagamento)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(pagamento.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredPagamentos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum pagamento encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}