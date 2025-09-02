import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReceitaForm } from "@/components/forms/ReceitaForm";
import ReceitaList from "@/components/pages/ReceitaList";
import { ClientesList } from "@/components/pages/ClientesList";
import { OrdensList } from "@/components/pages/OrdensList";
import { ArmacoesList } from "@/components/pages/ArmacoesList";
import { PagamentosList } from "@/components/pages/PagamentosList";
import { RelatoriosList } from "@/components/pages/RelatoriosList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, FileText, Eye, Glasses, CreditCard, TrendingUp } from "lucide-react";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState([
    {
      title: "Total Clientes",
      value: "0",
      icon: Users,
      change: "0%",
      color: "text-blue-600",
    },
    {
      title: "Ordens Ativas",
      value: "0",
      icon: FileText,
      change: "0%",
      color: "text-green-600",
    },
    {
      title: "Receitas",
      value: "0",
      icon: Eye,
      change: "0%",
      color: "text-purple-600",
    },
    {
      title: "Faturamento",
      value: "R$ 0,00",
      icon: TrendingUp,
      change: "0%",
      color: "text-primary",
    },
  ]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
    loadDashboardData();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();
        
        if (profile) {
          setUserRole(profile.role);
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Contar clientes
      const { count: clientesCount } = await supabase
        .from("cliente")
        .select("*", { count: "exact", head: true });

      // Contar ordens de serviço
      const { count: ordensCount } = await supabase
        .from("ordem_servico")
        .select("*", { count: "exact", head: true });

      // Contar receitas
      const { count: receitasCount } = await supabase
        .from("receita")
        .select("*", { count: "exact", head: true });

      // Calcular faturamento total
      const { data: pagamentos } = await supabase
        .from("pagamento")
        .select("valor_total");

      const faturamentoTotal = pagamentos?.reduce((sum, p) => sum + (p.valor_total || 0), 0) || 0;

      // Buscar ordens recentes com dados do cliente
      const { data: ordensRecentes } = await supabase
        .from("ordem_servico")
        .select(`
          id,
          numero_os,
          data_pedido,
          cliente:id_cliente (nome)
        `)
        .order("data_pedido", { ascending: false })
        .limit(3);

      // Buscar clientes recentes
      const { data: clientesRecentes } = await supabase
        .from("cliente")
        .select("id, nome, created_by")
        .order("id", { ascending: false })
        .limit(3);

      // Atualizar stats
      setStats([
        {
          title: "Total Clientes",
          value: clientesCount?.toString() || "0",
          icon: Users,
          change: "0%",
          color: "text-blue-600",
        },
        {
          title: "Ordens Ativas",
          value: ordensCount?.toString() || "0",
          icon: FileText,
          change: "0%",
          color: "text-green-600",
        },
        {
          title: "Receitas",
          value: receitasCount?.toString() || "0",
          icon: Eye,
          change: "0%",
          color: "text-purple-600",
        },
        {
          title: "Faturamento",
          value: `R$ ${faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          icon: TrendingUp,
          change: "0%",
          color: "text-primary",
        },
      ]);

      setRecentOrders(ordensRecentes || []);
      setRecentClients(clientesRecentes || []);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };


  const renderContent = () => {
    if (showForm) {
      return (
        <ReceitaForm
          onSuccess={() => {
            setShowForm(false);
            toast({
              title: "Sucesso",
              description: "Receita criada com sucesso!",
            });
          }}
          onCancel={() => setShowForm(false)}
        />
      );
    }

    switch (activeTab) {
      case "receitas":
        return <ReceitaList />;

      case "clientes":
        return <ClientesList />;

      case "ordens":
        return <OrdensList />;

      case "armacoes":
        return <ArmacoesList />;

      case "pagamentos":
        return <PagamentosList />;

      case "relatorios":
        return <RelatoriosList />;

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <div className="text-sm text-muted-foreground">
                Logado como: {userRole}
              </div>
            </div>
            
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
                      <p className="text-xs text-muted-foreground">
                        Dados atualizados
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ordens de Serviço Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.length > 0 ? recentOrders.map((order, index) => (
                      <div key={order.id} className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            OS #{order.numero_os} - {order.cliente?.nome || 'Cliente não encontrado'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.data_pedido).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center">
                        Nenhuma ordem de serviço encontrada
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Clientes Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentClients.length > 0 ? recentClients.map((client) => (
                      <div key={client.id} className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{client.nome}</p>
                          <p className="text-xs text-muted-foreground">Cliente #{client.id}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center">
                        Nenhum cliente encontrado
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />
        
        <main className="p-4 lg:p-6 pt-2 min-h-[calc(100vh-4rem)]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}