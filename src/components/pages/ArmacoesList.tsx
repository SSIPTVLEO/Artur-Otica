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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ArmacaoLente {
  id: number;
  id_os: number;
  marca_armacao?: string;
  referencia_armacao?: string;
  material_armacao?: string;
  horizontal?: string;
  ponte?: string;
  vertical?: string;
  diagonal_maior?: string;
  lente_comprada?: string;
  tratamento?: string;
  coloracao?: string;
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

export function ArmacoesList() {
  const [armacoes, setArmacoes] = useState<ArmacaoLente[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArmacao, setEditingArmacao] = useState<ArmacaoLente | null>(null);
  const [formData, setFormData] = useState({
    id_os: "",
    marca_armacao: "",
    referencia_armacao: "",
    material_armacao: "",
    horizontal: "",
    ponte: "",
    vertical: "",
    diagonal_maior: "",
    lente_comprada: "",
    tratamento: "",
    coloracao: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchArmacoes();
    fetchOrdens();
  }, []);

  const fetchArmacoes = async () => {
    try {
      const { data, error } = await supabase
        .from("armacao_lente")
        .select(`
          *,
          ordem_servico:ordem_servico!armacao_lente_id_os_fkey (
            numero_os,
            cliente:cliente!ordem_servico_id_cliente_fkey (
              nome
            )
          )
        `)
        .order("id", { ascending: false });

      if (error) throw error;
      setArmacoes(data || []);
    } catch (error) {
      console.error("Erro ao buscar armações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as armações e lentes.",
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
        ...formData,
        id_os: parseInt(formData.id_os),
      };

      if (editingArmacao) {
        const { error } = await supabase
          .from("armacao_lente")
          .update(dataToSave)
          .eq("id", editingArmacao.id);
        
        if (error) throw error;
        toast({ title: "Sucesso", description: "Armação/Lente atualizada!" });
      } else {
        const { error } = await supabase
          .from("armacao_lente")
          .insert([dataToSave]);
        
        if (error) throw error;
        toast({ title: "Sucesso", description: "Armação/Lente criada!" });
      }
      
      setIsDialogOpen(false);
      setEditingArmacao(null);
      resetForm();
      fetchArmacoes();
    } catch (error) {
      console.error("Erro ao salvar armação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a armação/lente.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      id_os: "",
      marca_armacao: "",
      referencia_armacao: "",
      material_armacao: "",
      horizontal: "",
      ponte: "",
      vertical: "",
      diagonal_maior: "",
      lente_comprada: "",
      tratamento: "",
      coloracao: "",
    });
  };

  const handleEdit = (armacao: ArmacaoLente) => {
    setEditingArmacao(armacao);
    setFormData({
      id_os: String(armacao.id_os),
      marca_armacao: armacao.marca_armacao || "",
      referencia_armacao: armacao.referencia_armacao || "",
      material_armacao: armacao.material_armacao || "",
      horizontal: armacao.horizontal || "",
      ponte: armacao.ponte || "",
      vertical: armacao.vertical || "",
      diagonal_maior: armacao.diagonal_maior || "",
      lente_comprada: armacao.lente_comprada || "",
      tratamento: armacao.tratamento || "",
      coloracao: armacao.coloracao || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta armação/lente?")) return;
    
    try {
      const { error } = await supabase
        .from("armacao_lente")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast({ title: "Sucesso", description: "Armação/Lente excluída!" });
      fetchArmacoes();
    } catch (error) {
      console.error("Erro ao excluir armação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a armação/lente.",
        variant: "destructive",
      });
    }
  };

  const filteredArmacoes = armacoes.filter((armacao) =>
    armacao.marca_armacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    armacao.referencia_armacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    armacao.ordem_servico?.numero_os.toLowerCase().includes(searchTerm.toLowerCase()) ||
    armacao.ordem_servico?.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Armações e Lentes</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow">
              <Plus className="mr-2 h-4 w-4" />
              Nova Armação/Lente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingArmacao ? "Editar Armação/Lente" : "Nova Armação/Lente"}</DialogTitle>
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
                <Label htmlFor="marca_armacao">Marca da Armação</Label>
                <Input
                  id="marca_armacao"
                  value={formData.marca_armacao}
                  onChange={(e) => setFormData({ ...formData, marca_armacao: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="referencia_armacao">Referência</Label>
                <Input
                  id="referencia_armacao"
                  value={formData.referencia_armacao}
                  onChange={(e) => setFormData({ ...formData, referencia_armacao: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="material_armacao">Material</Label>
                <Input
                  id="material_armacao"
                  value={formData.material_armacao}
                  onChange={(e) => setFormData({ ...formData, material_armacao: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="horizontal">Horizontal (mm)</Label>
                <Input
                  id="horizontal"
                  value={formData.horizontal}
                  onChange={(e) => setFormData({ ...formData, horizontal: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ponte">Ponte (mm)</Label>
                <Input
                  id="ponte"
                  value={formData.ponte}
                  onChange={(e) => setFormData({ ...formData, ponte: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="vertical">Vertical (mm)</Label>
                <Input
                  id="vertical"
                  value={formData.vertical}
                  onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="diagonal_maior">Diagonal Maior (mm)</Label>
                <Input
                  id="diagonal_maior"
                  value={formData.diagonal_maior}
                  onChange={(e) => setFormData({ ...formData, diagonal_maior: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lente_comprada">Lente Comprada</Label>
                <Input
                  id="lente_comprada"
                  value={formData.lente_comprada}
                  onChange={(e) => setFormData({ ...formData, lente_comprada: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tratamento">Tratamento</Label>
                <Input
                  id="tratamento"
                  value={formData.tratamento}
                  onChange={(e) => setFormData({ ...formData, tratamento: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="coloracao">Coloração</Label>
                <Input
                  id="coloracao"
                  value={formData.coloracao}
                  onChange={(e) => setFormData({ ...formData, coloracao: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setEditingArmacao(null);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!formData.id_os}>
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
              placeholder="Buscar armações..."
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
                <TableHead>Marca</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Lente Comprada</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArmacoes.map((armacao) => (
                <TableRow key={armacao.id}>
                  <TableCell>{armacao.ordem_servico?.numero_os}</TableCell>
                  <TableCell>{armacao.ordem_servico?.cliente?.nome}</TableCell>
                  <TableCell>{armacao.marca_armacao || "-"}</TableCell>
                  <TableCell>{armacao.referencia_armacao || "-"}</TableCell>
                  <TableCell>{armacao.material_armacao || "-"}</TableCell>
                  <TableCell>{armacao.lente_comprada || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(armacao)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(armacao.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredArmacoes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma armação/lente encontrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}