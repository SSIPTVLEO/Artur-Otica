import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye, ArrowLeft, X } from "lucide-react";
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
  const [clientes, setClientes] = useState<any[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<any | null>(null);
  const [ordensDoCliente, setOrdensDoCliente] = useState<any[]>([]);
  const [receitaSelecionada, setReceitaSelecionada] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [editingReceita, setEditingReceita] = useState<any | null>(null);
  const [ordensServico, setOrdensServico] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'clientes' | 'ordens' | 'receita'>('clientes');
  const { toast } = useToast();

  const [form, setForm] = useState({
    id: 0,
    id_os: 0,
    // Longe OD
    esferico_longe_od: "",
    cilindrico_longe_od: "",
    eixo_longe_od: "",
    dnp_longe_od: "",
    altura_od: "",
    adicao_od: "",
    // Longe OE
    esferico_longe_oe: "",
    cilindrico_longe_oe: "",
    eixo_longe_oe: "",
    dnp_longe_oe: "",
    altura_oe: "",
    adicao_oe: "",
    // Perto OD (calculados automaticamente)
    esferico_perto_od: "",
    cilindrico_perto_od: "",
    // Perto OE (calculados automaticamente)
    esferico_perto_oe: "",
    cilindrico_perto_oe: "",
  });

  // Função para formatar valores esféricos (sempre com + ou -)
  const formatEsferico = (value: string) => {
    if (!value) return "";
    const num = parseFloat(value.replace(/[^-0-9.]/g, ""));
    if (isNaN(num)) return "";
    return num >= 0 ? `+${num.toFixed(2)}` : `${num.toFixed(2)}`;
  };

  // Função para formatar valores cilíndricos (sempre negativo)
  const formatCilindrico = (value: string) => {
    if (!value) return "";
    const num = Math.abs(parseFloat(value.replace(/[^0-9.]/g, "")));
    if (isNaN(num)) return "";
    return `-${num.toFixed(2)}`;
  };

  // Função para calcular graus de perto
  const calculatePerto = (esfericoLonge: string, adicao: string) => {
    if (!esfericoLonge || !adicao) return "";
    const longe = parseFloat(esfericoLonge.replace(/[^-0-9.]/g, ""));
    const add = parseFloat(adicao.replace(/[^-0-9.]/g, ""));
    if (isNaN(longe) || isNaN(add)) return "";
    const perto = longe + add;
    return perto >= 0 ? `+${perto.toFixed(2)}` : `${perto.toFixed(2)}`;
  };

  // Atualizar campos de perto quando adição mudar
  useEffect(() => {
    if (form.adicao_od) {
      const pertOD = calculatePerto(form.esferico_longe_od, form.adicao_od);
      setForm(prev => ({
        ...prev,
        esferico_perto_od: pertOD,
        cilindrico_perto_od: form.cilindrico_longe_od,
      }));
    }
  }, [form.esferico_longe_od, form.adicao_od, form.cilindrico_longe_od]);

  useEffect(() => {
    if (form.adicao_oe) {
      const pertOE = calculatePerto(form.esferico_longe_oe, form.adicao_oe);
      setForm(prev => ({
        ...prev,
        esferico_perto_oe: pertOE,
        cilindrico_perto_oe: form.cilindrico_longe_oe,
      }));
    }
  }, [form.esferico_longe_oe, form.adicao_oe, form.cilindrico_longe_oe]);

  const fetchClientes = async () => {
    try {
      let query = supabase
        .from("cliente")
        .select("*")
        .order("nome", { ascending: true });
      
      if (search) {
        query = query.or(`nome.ilike.%${search}%,telefone.ilike.%${search}%,cpf.ilike.%${search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setClientes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchOrdensDoCliente = async (clienteId: number) => {
    try {
      const { data, error } = await supabase
        .from("ordem_servico")
        .select(`
          id,
          numero_os,
          data_pedido,
          receita:receita!receita_id_os_fkey(id)
        `)
        .eq("id_cliente", clienteId)
        .order("data_pedido", { ascending: false });
      
      if (error) throw error;
      setOrdensDoCliente(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar ordens do cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchReceitaByOS = async (osId: number) => {
    try {
      const { data, error } = await supabase
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
        .eq("id_os", osId)
        .single();
      
      if (error) throw error;
      setReceitaSelecionada(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar receita",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchOrdensServico = async () => {
    try {
      const { data, error } = await supabase
        .from("ordem_servico")
        .select(`
          id,
          numero_os,
          data_pedido,
          cliente:cliente!ordem_servico_id_cliente_fkey (
            nome
          )
        `)
        .order("id", { ascending: false });
      
      if (error) throw error;
      setOrdensServico(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar ordens de serviço",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (currentView === 'clientes') {
      fetchClientes();
    }
  }, [search, currentView]);

  useEffect(() => {
    if (editingReceita) {
      fetchOrdensServico();
    }
  }, [editingReceita]);

  const handleVisualizarCliente = (cliente: any) => {
    setClienteSelecionado(cliente);
    setCurrentView('ordens');
    fetchOrdensDoCliente(cliente.id);
  };

  const handleVisualizarOS = (ordem: any) => {
    setCurrentView('receita');
    fetchReceitaByOS(ordem.id);
  };

  const handleVoltar = () => {
    if (currentView === 'receita') {
      setCurrentView('ordens');
      setReceitaSelecionada(null);
    } else if (currentView === 'ordens') {
      setCurrentView('clientes');
      setClienteSelecionado(null);
      setOrdensDoCliente([]);
    }
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
      esferico_perto_od: "",
      cilindrico_perto_od: "",
      esferico_perto_oe: "",
      cilindrico_perto_oe: "",
    });
  };

  const saveReceita = async () => {
    try {
      if (!form.id_os) {
        toast({
          title: "Erro",
          description: "Selecione uma ordem de serviço",
          variant: "destructive",
        });
        return;
      }

      const formData = {
        ...form,
        esferico_longe_od: form.esferico_longe_od ? parseFloat(form.esferico_longe_od.replace(/[^-0-9.]/g, "")) : null,
        cilindrico_longe_od: form.cilindrico_longe_od ? parseFloat(form.cilindrico_longe_od.replace(/[^-0-9.]/g, "")) : null,
        eixo_longe_od: form.eixo_longe_od ? parseInt(form.eixo_longe_od) : null,
        dnp_longe_od: form.dnp_longe_od ? parseFloat(form.dnp_longe_od) : null,
        altura_od: form.altura_od ? parseFloat(form.altura_od) : null,
        adicao_od: form.adicao_od ? parseFloat(form.adicao_od.replace(/[^-0-9.]/g, "")) : null,
        esferico_longe_oe: form.esferico_longe_oe ? parseFloat(form.esferico_longe_oe.replace(/[^-0-9.]/g, "")) : null,
        cilindrico_longe_oe: form.cilindrico_longe_oe ? parseFloat(form.cilindrico_longe_oe.replace(/[^-0-9.]/g, "")) : null,
        eixo_longe_oe: form.eixo_longe_oe ? parseInt(form.eixo_longe_oe) : null,
        dnp_longe_oe: form.dnp_longe_oe ? parseFloat(form.dnp_longe_oe) : null,
        altura_oe: form.altura_oe ? parseFloat(form.altura_oe) : null,
        adicao_oe: form.adicao_oe ? parseFloat(form.adicao_oe.replace(/[^-0-9.]/g, "")) : null,
        esferico_perto_od: form.esferico_perto_od ? parseFloat(form.esferico_perto_od.replace(/[^-0-9.]/g, "")) : null,
        cilindrico_perto_od: form.cilindrico_perto_od ? parseFloat(form.cilindrico_perto_od.replace(/[^-0-9.]/g, "")) : null,
        esferico_perto_oe: form.esferico_perto_oe ? parseFloat(form.esferico_perto_oe.replace(/[^-0-9.]/g, "")) : null,
        cilindrico_perto_oe: form.cilindrico_perto_oe ? parseFloat(form.cilindrico_perto_oe.replace(/[^-0-9.]/g, "")) : null,
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
    } catch (error: any) {
      toast({
        title: "Erro ao salvar receita",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field.includes('esferico') || field.includes('adicao')) {
      // Permite inserção livre, formata apenas na saída
      setForm({ ...form, [field]: value });
      return;
    } else if (field.includes('cilindrico')) {
      // Permite inserção livre, formata apenas na saída
      setForm({ ...form, [field]: value });
      return;
    }
    
    setForm({ ...form, [field]: formattedValue });
  };

  // Função para formatar na saída (blur)
  const handleInputBlur = (field: string) => {
    if (field.includes('esferico') || field.includes('adicao')) {
      const formatted = formatEsferico(form[field as keyof typeof form] as string);
      setForm({ ...form, [field]: formatted });
    } else if (field.includes('cilindrico')) {
      const formatted = formatCilindrico(form[field as keyof typeof form] as string);
      setForm({ ...form, [field]: formatted });
    }
  };

  return (
    <div>
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {currentView === 'clientes' && "Receitas - Clientes"}
              {currentView === 'ordens' && `Ordens de Serviço - ${clienteSelecionado?.nome}`}
              {currentView === 'receita' && "Visualizar Receita"}
            </CardTitle>
            {currentView !== 'clientes' && (
              <Button variant="outline" onClick={handleVoltar}>
                <ArrowLeft className="mr-2" /> Voltar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {currentView === 'clientes' && (
            <>
              <div className="flex justify-between mb-4">
                <Input
                  placeholder="Pesquisar por nome, telefone ou CPF..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button
                  variant="secondary"
                  className="ml-2"
                  onClick={() => setEditingReceita({})}
                >
                  <Plus className="mr-2" /> Nova Receita
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>{cliente.nome}</TableCell>
                      <TableCell>{cliente.telefone || "-"}</TableCell>
                      <TableCell>{cliente.cpf || "-"}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVisualizarCliente(cliente)}
                        >
                          <Eye size={16} className="mr-1" /> Visualizar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}

          {currentView === 'ordens' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número OS</TableHead>
                  <TableHead>Data do Pedido</TableHead>
                  <TableHead>Receita</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordensDoCliente.map((ordem) => (
                  <TableRow key={ordem.id}>
                    <TableCell>{ordem.numero_os}</TableCell>
                    <TableCell>{new Date(ordem.data_pedido).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{ordem.receita?.length > 0 ? "Sim" : "Não"}</TableCell>
                    <TableCell>
                      {ordem.receita?.length > 0 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVisualizarOS(ordem)}
                        >
                          <Eye size={16} className="mr-1" /> Visualizar
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">Sem receita</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {currentView === 'receita' && receitaSelecionada && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  OS: {receitaSelecionada.ordem_servico?.numero_os} - {receitaSelecionada.ordem_servico?.cliente?.nome}
                </h3>
                <p className="text-muted-foreground">
                  Data: {receitaSelecionada.ordem_servico?.data_pedido ? new Date(receitaSelecionada.ordem_servico.data_pedido).toLocaleDateString('pt-BR') : "-"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Olho Direito */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Olho Direito (OD)</h3>
                  
                  <div className="mb-4">
                    <h4 className="text-md font-medium mb-2">Longe</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><strong>Esférico:</strong> {receitaSelecionada.esferico_longe_od || "-"}</div>
                      <div><strong>Cilíndrico:</strong> {receitaSelecionada.cilindrico_longe_od || "-"}</div>
                      <div><strong>Eixo:</strong> {receitaSelecionada.eixo_longe_od || "-"}</div>
                      <div><strong>DNP:</strong> {receitaSelecionada.dnp_longe_od || "-"}</div>
                      <div><strong>Altura:</strong> {receitaSelecionada.altura_od || "-"}</div>
                      <div><strong>Adição:</strong> {receitaSelecionada.adicao_od || "-"}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium mb-2">Perto</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><strong>Esférico:</strong> {receitaSelecionada.esferico_perto_od || "-"}</div>
                      <div><strong>Cilíndrico:</strong> {receitaSelecionada.cilindrico_perto_od || "-"}</div>
                    </div>
                  </div>
                </Card>

                {/* Olho Esquerdo */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Olho Esquerdo (OE)</h3>
                  
                  <div className="mb-4">
                    <h4 className="text-md font-medium mb-2">Longe</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><strong>Esférico:</strong> {receitaSelecionada.esferico_longe_oe || "-"}</div>
                      <div><strong>Cilíndrico:</strong> {receitaSelecionada.cilindrico_longe_oe || "-"}</div>
                      <div><strong>Eixo:</strong> {receitaSelecionada.eixo_longe_oe || "-"}</div>
                      <div><strong>DNP:</strong> {receitaSelecionada.dnp_longe_oe || "-"}</div>
                      <div><strong>Altura:</strong> {receitaSelecionada.altura_oe || "-"}</div>
                      <div><strong>Adição:</strong> {receitaSelecionada.adicao_oe || "-"}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium mb-2">Perto</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><strong>Esférico:</strong> {receitaSelecionada.esferico_perto_oe || "-"}</div>
                      <div><strong>Cilíndrico:</strong> {receitaSelecionada.cilindrico_perto_oe || "-"}</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {editingReceita && (
            <Card className="mb-4 p-4 bg-muted/50">
              <div className="flex justify-between mb-4">
                <CardTitle>Nova Receita</CardTitle>
                <Button variant="ghost" onClick={cancelEdit}>
                  <X />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Select
                    value={form.id_os.toString()}
                    onValueChange={(value) => setForm({ ...form, id_os: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma Ordem de Serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {ordensServico.map((os) => (
                        <SelectItem key={os.id} value={os.id.toString()}>
                          {os.numero_os} - {os.cliente?.nome} - {new Date(os.data_pedido).toLocaleDateString('pt-BR')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Olho Direito */}
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Olho Direito (OD)</h3>
                    
                    <div className="mb-4">
                      <h4 className="text-md font-medium mb-2">Longe</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Esférico"
                          value={form.esferico_longe_od}
                          onChange={(e) => handleInputChange('esferico_longe_od', e.target.value)}
                          onBlur={() => handleInputBlur('esferico_longe_od')}
                          step="0.25"
                        />
                        <Input
                          placeholder="Cilíndrico"
                          value={form.cilindrico_longe_od}
                          onChange={(e) => handleInputChange('cilindrico_longe_od', e.target.value)}
                          onBlur={() => handleInputBlur('cilindrico_longe_od')}
                          step="0.25"
                        />
                        <Input
                          placeholder="Eixo"
                          value={form.eixo_longe_od}
                          onChange={(e) => setForm({ ...form, eixo_longe_od: e.target.value })}
                          type="number"
                        />
                        <Input
                          placeholder="DNP"
                          value={form.dnp_longe_od}
                          onChange={(e) => setForm({ ...form, dnp_longe_od: e.target.value })}
                          type="number"
                          step="0.5"
                        />
                        <Input
                          placeholder="Altura"
                          value={form.altura_od}
                          onChange={(e) => setForm({ ...form, altura_od: e.target.value })}
                          type="number"
                          step="0.5"
                        />
                        <Input
                          placeholder="Adição"
                          value={form.adicao_od}
                          onChange={(e) => handleInputChange('adicao_od', e.target.value)}
                          onBlur={() => handleInputBlur('adicao_od')}
                          step="0.25"
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-2">Perto (Calculado automaticamente)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Esférico Perto"
                          value={form.esferico_perto_od}
                          readOnly
                          className="bg-muted"
                        />
                        <Input
                          placeholder="Cilíndrico Perto"
                          value={form.cilindrico_perto_od}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Olho Esquerdo */}
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Olho Esquerdo (OE)</h3>
                    
                    <div className="mb-4">
                      <h4 className="text-md font-medium mb-2">Longe</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Esférico"
                          value={form.esferico_longe_oe}
                          onChange={(e) => handleInputChange('esferico_longe_oe', e.target.value)}
                          onBlur={() => handleInputBlur('esferico_longe_oe')}
                          step="0.25"
                        />
                        <Input
                          placeholder="Cilíndrico"
                          value={form.cilindrico_longe_oe}
                          onChange={(e) => handleInputChange('cilindrico_longe_oe', e.target.value)}
                          onBlur={() => handleInputBlur('cilindrico_longe_oe')}
                          step="0.25"
                        />
                        <Input
                          placeholder="Eixo"
                          value={form.eixo_longe_oe}
                          onChange={(e) => setForm({ ...form, eixo_longe_oe: e.target.value })}
                          type="number"
                        />
                        <Input
                          placeholder="DNP"
                          value={form.dnp_longe_oe}
                          onChange={(e) => setForm({ ...form, dnp_longe_oe: e.target.value })}
                          type="number"
                          step="0.5"
                        />
                        <Input
                          placeholder="Altura"
                          value={form.altura_oe}
                          onChange={(e) => setForm({ ...form, altura_oe: e.target.value })}
                          type="number"
                          step="0.5"
                        />
                        <Input
                          placeholder="Adição"
                          value={form.adicao_oe}
                          onChange={(e) => handleInputChange('adicao_oe', e.target.value)}
                          onBlur={() => handleInputBlur('adicao_oe')}
                          step="0.25"
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-2">Perto (Calculado automaticamente)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Esférico Perto"
                          value={form.esferico_perto_oe}
                          readOnly
                          className="bg-muted"
                        />
                        <Input
                          placeholder="Cilíndrico Perto"
                          value={form.cilindrico_perto_oe}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              
              <Button className="mt-6" onClick={saveReceita}>
                Salvar Receita
              </Button>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}