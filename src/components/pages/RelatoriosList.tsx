import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, DollarSign, Users, FileText, TrendingUp, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Relatorio {
  totalClientes: number;
  totalOrdens: number;
  totalReceitas: number;
  faturamentoTotal: number;
  faturamentoPeriodo: number;
  ordensRecentes: any[];
  clientesRecentes: any[];
  pagamentosPorStatus: any[];
}

export function RelatoriosList() {
  const [relatorio, setRelatorio] = useState<Relatorio>({
    totalClientes: 0,
    totalOrdens: 0,
    totalReceitas: 0,
    faturamentoTotal: 0,
    faturamentoPeriodo: 0,
    ordensRecentes: [],
    clientesRecentes: [],
    pagamentosPorStatus: [],
  });
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Definir período padrão (último mês)
    const hoje = new Date();
    const mesPassado = new Date();
    mesPassado.setMonth(hoje.getMonth() - 1);
    
    setDataFim(hoje.toISOString().split('T')[0]);
    setDataInicio(mesPassado.toISOString().split('T')[0]);
    
    gerarRelatorio(mesPassado.toISOString().split('T')[0], hoje.toISOString().split('T')[0]);
  }, []);

  const gerarRelatorio = async (inicio?: string, fim?: string) => {
    setIsLoading(true);
    try {
      const dataIni = inicio || dataInicio;
      const dataFinal = fim || dataFim;

      // Total de clientes
      const { count: totalClientes } = await supabase
        .from("cliente")
        .select("*", { count: 'exact', head: true });

      // Total de ordens
      const { count: totalOrdens } = await supabase
        .from("ordem_servico")
        .select("*", { count: 'exact', head: true });

      // Total de receitas
      const { count: totalReceitas } = await supabase
        .from("receita")
        .select("*", { count: 'exact', head: true });

      // Faturamento total
      const { data: faturamentoData } = await supabase
        .from("pagamento")
        .select("valor_total")
        .eq("status", "pago");

      const faturamentoTotal = faturamentoData?.reduce((acc, p) => acc + p.valor_total, 0) || 0;

      // Faturamento do período
      const { data: faturamentoPeriodoData } = await supabase
        .from("pagamento")
        .select(`
          valor_total,
          ordem_servico:ordem_servico!pagamento_id_os_fkey (
            data_pedido
          )
        `)
        .eq("status", "pago")
        .gte("ordem_servico.data_pedido", dataIni)
        .lte("ordem_servico.data_pedido", dataFinal);

      const faturamentoPeriodo = faturamentoPeriodoData?.reduce((acc, p) => acc + p.valor_total, 0) || 0;

      // Ordens recentes
      const { data: ordensRecentes } = await supabase
        .from("ordem_servico")
        .select(`
          *,
          cliente:cliente!ordem_servico_id_cliente_fkey (
            nome
          )
        `)
        .order("data_pedido", { ascending: false })
        .limit(10);

      // Clientes recentes
      const { data: clientesRecentes } = await supabase
        .from("cliente")
        .select("*")
        .order("id", { ascending: false })
        .limit(10);

      // Pagamentos por status
      const { data: pagamentosStatus } = await supabase
        .from("pagamento")
        .select("status, valor_total");

      const pagamentosPorStatus = pagamentosStatus?.reduce((acc: any[], p) => {
        const status = p.status || 'pendente';
        const existing = acc.find(item => item.status === status);
        if (existing) {
          existing.count += 1;
          existing.valor += p.valor_total;
        } else {
          acc.push({ status, count: 1, valor: p.valor_total });
        }
        return acc;
      }, []) || [];

      setRelatorio({
        totalClientes: totalClientes || 0,
        totalOrdens: totalOrdens || 0,
        totalReceitas: totalReceitas || 0,
        faturamentoTotal,
        faturamentoPeriodo,
        ordensRecentes: ordensRecentes || [],
        clientesRecentes: clientesRecentes || [],
        pagamentosPorStatus,
      });

    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportarRelatorio = () => {
    const csvContent = [
      "Relatório Artur Ótica",
      `Período: ${dataInicio} a ${dataFim}`,
      "",
      "Resumo:",
      `Total de Clientes,${relatorio.totalClientes}`,
      `Total de Ordens,${relatorio.totalOrdens}`,
      `Total de Receitas,${relatorio.totalReceitas}`,
      `Faturamento Total,R$ ${relatorio.faturamentoTotal.toFixed(2)}`,
      `Faturamento do Período,R$ ${relatorio.faturamentoPeriodo.toFixed(2)}`,
      "",
      "Ordens Recentes:",
      "Número OS,Cliente,Data",
      ...relatorio.ordensRecentes.map(ordem => 
        `${ordem.numero_os},${ordem.cliente?.nome || 'N/A'},${new Date(ordem.data_pedido).toLocaleDateString('pt-BR')}`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_artur_otica_${dataInicio}_${dataFim}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Sucesso",
      description: "Relatório exportado com sucesso!",
    });
  };

  const stats = [
    {
      title: "Total Clientes",
      value: relatorio.totalClientes.toString(),
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Ordens",
      value: relatorio.totalOrdens.toString(),
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Total Receitas",
      value: relatorio.totalReceitas.toString(),
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      title: "Faturamento Período",
      value: `R$ ${relatorio.faturamentoPeriodo.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Relatórios</h2>
        <Button 
          onClick={exportarRelatorio}
          className="bg-gradient-primary hover:shadow-glow"
          disabled={isLoading}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros de Data */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="data-inicio">Data Início</Label>
              <Input
                id="data-inicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="data-fim">Data Fim</Label>
              <Input
                id="data-fim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div>
              <Button 
                onClick={() => gerarRelatorio()}
                disabled={isLoading || !dataInicio || !dataFim}
              >
                {isLoading ? "Gerando..." : "Gerar Relatório"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-primary transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Ordens Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Ordens Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>OS</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatorio.ordensRecentes.map((ordem) => (
                  <TableRow key={ordem.id}>
                    <TableCell className="font-medium">{ordem.numero_os}</TableCell>
                    <TableCell>{ordem.cliente?.nome}</TableCell>
                    <TableCell>
                      {new Date(ordem.data_pedido).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagamentos por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Pagamentos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatorio.pagamentosPorStatus.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium capitalize">{item.status}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>R$ {item.valor.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Faturamento Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Faturamento Total</p>
              <p className="text-2xl font-bold">R$ {relatorio.faturamentoTotal.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-muted-foreground">Período Selecionado</p>
              <p className="text-2xl font-bold">R$ {relatorio.faturamentoPeriodo.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}