import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReceitaForm } from "@/components/forms/ReceitaForm";
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
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
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

  const stats = [
    {
      title: "Total Clientes",
      value: "1,234",
      icon: Users,
      change: "+12%",
      color: "text-blue-600",
    },
    {
      title: "Ordens Ativas",
      value: "89",
      icon: FileText,
      change: "+5%",
      color: "text-green-600",
    },
    {
      title: "Receitas",
      value: "456",
      icon: Eye,
      change: "+8%",
      color: "text-purple-600",
    },
    {
      title: "Faturamento",
      value: "R$ 45.6K",
      icon: TrendingUp,
      change: "+15%",
      color: "text-primary",
    },
  ];

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
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Receitas</h2>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-primary hover:shadow-glow"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Receita
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Lista de receitas será implementada aqui.
                </p>
              </CardContent>
            </Card>
          </div>
        );

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
                        <span className="text-green-600">{stat.change}</span> desde o mês passado
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
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">OS #1234 - João Silva</p>
                        <p className="text-xs text-muted-foreground">Receita multifocal</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Hoje
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">OS #1233 - Maria Santos</p>
                        <p className="text-xs text-muted-foreground">Óculos de grau</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Ontem
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Clientes Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Ana Costa</p>
                        <p className="text-xs text-muted-foreground">ana@email.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Carlos Oliveira</p>
                        <p className="text-xs text-muted-foreground">carlos@email.com</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="lg:pl-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />
        
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}