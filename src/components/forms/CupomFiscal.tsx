import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

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

interface CupomFiscalProps {
  pagamento: Pagamento | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CupomFiscal({ pagamento, isOpen, onClose }: CupomFiscalProps) {
  if (!pagamento) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md print:shadow-none print:max-w-full print:m-0">
        <DialogHeader className="print:hidden">
          <DialogTitle>Cupom Fiscal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 font-mono text-sm print:text-xs">
          <div className="text-center border-b pb-2">
            <h1 className="font-bold text-lg">ARTUR ÓTICA</h1>
            <p className="text-xs">CNPJ: 00.000.000/0001-00</p>
            <p className="text-xs">Endereço da Empresa</p>
            <p className="text-xs">Tel: (00) 0000-0000</p>
          </div>
          
          <div className="border-b pb-2">
            <div className="flex justify-between">
              <span>CUPOM FISCAL</span>
              <span>#{pagamento.ordem_servico?.numero_os}</span>
            </div>
            <div className="text-xs">
              <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
              <p>Hora: {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
          </div>
          
          <div className="border-b pb-2">
            <h3 className="font-bold mb-1">CLIENTE</h3>
            <p>{pagamento.ordem_servico?.cliente?.nome}</p>
          </div>
          
          <div className="border-b pb-2">
            <h3 className="font-bold mb-1">ITENS</h3>
            <div className="space-y-1">
              {pagamento.valor_armacao && (
                <div className="flex justify-between">
                  <span>Armação</span>
                  <span>R$ {pagamento.valor_armacao.toFixed(2)}</span>
                </div>
              )}
              {pagamento.valor_lente && (
                <div className="flex justify-between">
                  <span>Lente</span>
                  <span>R$ {pagamento.valor_lente.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-b pb-2">
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span>R$ {pagamento.valor_total.toFixed(2)}</span>
            </div>
            {pagamento.entrada && (
              <div className="flex justify-between text-xs">
                <span>Entrada</span>
                <span>R$ {pagamento.entrada.toFixed(2)}</span>
              </div>
            )}
            {pagamento.parcelas && (
              <div className="flex justify-between text-xs">
                <span>Parcelas</span>
                <span>{pagamento.parcelas}x R$ {pagamento.valor_parcelas?.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          <div className="border-b pb-2">
            <div className="flex justify-between">
              <span>Pagamento</span>
              <span>{pagamento.forma_pagamento?.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span>{pagamento.status?.toUpperCase()}</span>
            </div>
          </div>
          
          <div className="text-center text-xs">
            <p>Obrigado pela preferência!</p>
            <p>Volte sempre!</p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 print:hidden">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Fechar
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}