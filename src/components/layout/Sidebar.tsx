import { useState } from "react";
import {
  Users,
  FileText,
  CreditCard,
  Eye,
  Glasses,
  BarChart3,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const navigation = [
  { name: "Clientes", icon: Users, value: "clientes" },
  { name: "Ordens de Serviço", icon: FileText, value: "ordens" },
  { name: "Receitas", icon: Eye, value: "receitas" },
  { name: "Armações e Lentes", icon: Glasses, value: "armacoes" },
  { name: "Pagamentos", icon: CreditCard, value: "pagamentos" },
  { name: "Relatórios", icon: BarChart3, value: "relatorios" },
];

export function Sidebar({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform overflow-y-auto bg-white border-r transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:h-screen",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/2892ba25-dff0-4b33-8c36-b163ff336807.png" 
              alt="Arthur Ótica" 
              className="h-8 w-8 rounded-full"
            />
            <span className="text-lg font-semibold lg:block hidden">Artur Ótica</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <nav className="space-y-1 px-2 lg:px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.name}
                variant={activeTab === item.value ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  activeTab === item.value && "bg-gradient-primary text-primary-foreground shadow-primary"
                )}
                onClick={() => {
                  onTabChange(item.value);
                  onClose?.();
                }}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
