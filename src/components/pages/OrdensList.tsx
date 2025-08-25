import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Edit } from "lucide-react";
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

interface OrdemServico {
  id: number;
  numero_os: string;
  id_cliente: number;
  data_pedido: string;
  cliente?: {
    nome: string;
  };
}

interface Cliente {
  id: number;
  nome: string;
}

export function OrdensList() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    numero_os: "",
    id_cliente: "",
    data_pedido: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchOrdens();
    fetchClientes();
  }, []);

  const fetchOrdens = async () => {
    try {
      const { data, error } = await supabase
        .from("ordem_servico")
        .select(`
          *,
          cliente:cliente!ordem_servico_id_cliente_fkey (
            nome
          )
        `)
        .order("data_pedido", { ascending: false });

      if (error) throw error;
      setOrdens(data || []);
    } catch (error) {
      console.error("Erro ao buscar ordens:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as ordens de serviço.",
        variant: "destructive",
      });
    }
  };

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("cliente")
        .select("id, nome")
        .order("nome");

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const generateNumeroOS = async () => {
    try {
      // Buscar a última OS no banco
      const { data, error } = await supabase
        .from("ordem_servico")
        .select("numero_os")
        .order("id", { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastOS = data[0].numero_os;
        // Extrair número da última OS (assumindo formato OS001, OS002, etc.)
        const match = lastOS.match(/OS(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      
      return `OS${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
      console.error("Erro ao gerar número da OS:", error);
      // Fallback para geração baseada em tempo
      const now = new Date();
      const time = String(now.getTime()).slice(-4);
      return `OS${time}`;
    }
  };

  const handleSave = async () => {
    try {
      const numeroOS = formData.numero_os || await generateNumeroOS();
      
      const { error } = await supabase
        .from("ordem_servico")
        .insert([{
          ...formData,
          numero_os: numeroOS,
          id_cliente: parseInt(formData.id_cliente),
        }]);
      
      if (error) throw error;
      
      toast({ title: "Sucesso", description: "Ordem de serviço criada!" });
      setIsDialogOpen(false);
      setFormData({
        numero_os: "",
        id_cliente: "",
        data_pedido: new Date().toISOString().split('T')[0],
      });
      fetchOrdens();
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a ordem de serviço.",
        variant: "destructive",
      });
    }
  };

  const filteredOrdens = ordens.filter((ordem) =>
    ordem.numero_os.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ordens de Serviço</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow">
              <Plus className="mr-2 h-4 w-4" />
              Nova Ordem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Ordem de Serviço</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="numero_os">Número da OS</Label>
                <Input
                  id="numero_os"
                  value={formData.numero_os}
                  onChange={(e) => setFormData({ ...formData, numero_os: e.target.value })}
                  placeholder="Deixe vazio para gerar automaticamente"
                />
              </div>
              <div>
                <Label htmlFor="cliente">Cliente *</Label>
                <Select
                  value={formData.id_cliente}
                  onValueChange={(value) => setFormData({ ...formData, id_cliente: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={String(cliente.id)}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="data_pedido">Data do Pedido</Label>
                <Input
                  id="data_pedido"
                  type="date"
                  value={formData.data_pedido}
                  onChange={(e) => setFormData({ ...formData, data_pedido: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!formData.id_cliente}>
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
              placeholder="Buscar ordens..."
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
                <TableHead>Número OS</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data do Pedido</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrdens.map((ordem) => (
                <TableRow key={ordem.id}>
                  <TableCell className="font-medium">{ordem.numero_os}</TableCell>
                  <TableCell>{ordem.cliente?.nome}</TableCell>
                  <TableCell>{new Date(ordem.data_pedido).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredOrdens.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma ordem de serviço encontrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}