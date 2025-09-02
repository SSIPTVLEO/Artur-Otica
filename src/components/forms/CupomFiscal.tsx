import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, MessageCircle, FileImage, FileText } from "lucide-react";
import { gerarTextoComprovanteWhatsApp, enviarWhatsApp } from "@/lib/cupom-utils";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";

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
    armacao_lente?: Array<{
      marca_armacao?: string;
      referencia_armacao?: string;
      lente_comprada?: string;
    }>;
  };
}

interface CupomFiscalProps {
  pagamento: Pagamento | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CupomFiscal({ pagamento, isOpen, onClose }: CupomFiscalProps) {
  const { toast } = useToast();
  const cupomRef = useRef<HTMLDivElement>(null);
  
  if (!pagamento) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const textoComprovante = gerarTextoComprovanteWhatsApp(pagamento);
    enviarWhatsApp(textoComprovante);
    toast({
      title: "WhatsApp aberto",
      description: "O cupom foi preparado para envio via WhatsApp.",
    });
  };

  const handleWhatsAppPNG = async () => {
    if (!cupomRef.current) return;
    
    try {
      const canvas = await html2canvas(cupomRef.current, {
        backgroundColor: 'white',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `cupom-fiscal-${pagamento.ordem_servico?.numero_os}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: "Imagem gerada",
            description: "O cupom foi salvo como PNG. Envie pelo WhatsApp!",
          });
        }
      }, 'image/png');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar a imagem.",
        variant: "destructive"
      });
    }
  };

  const handleWhatsAppPDF = async () => {
    if (!cupomRef.current) return;
    
    try {
      const canvas = await html2canvas(cupomRef.current, {
        backgroundColor: 'white',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', [80, 120]);
      const imgWidth = 70;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 5, 5, imgWidth, imgHeight);
      pdf.save(`cupom-fiscal-${pagamento.ordem_servico?.numero_os}.pdf`);
      
      toast({
        title: "PDF gerado",
        description: "O cupom foi salvo como PDF. Envie pelo WhatsApp!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md print:shadow-none print:max-w-full print:m-0">
        <DialogHeader className="print:hidden">
          <DialogTitle>Cupom Fiscal</DialogTitle>
        </DialogHeader>
        
        <div ref={cupomRef} className="space-y-4 font-mono text-sm print:text-xs bg-white p-4">
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
                <div>
                  <div className="flex justify-between">
                    <span>Armação</span>
                    <span>R$ {pagamento.valor_armacao.toFixed(2)}</span>
                  </div>
                  {pagamento.ordem_servico?.armacao_lente?.[0] && (
                    <div className="text-xs text-gray-600 ml-2">
                      {pagamento.ordem_servico.armacao_lente[0].marca_armacao && (
                        <p>Marca: {pagamento.ordem_servico.armacao_lente[0].marca_armacao}</p>
                      )}
                      {pagamento.ordem_servico.armacao_lente[0].referencia_armacao && (
                        <p>Ref: {pagamento.ordem_servico.armacao_lente[0].referencia_armacao}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              {pagamento.valor_lente && (
                <div>
                  <div className="flex justify-between">
                    <span>Lente</span>
                    <span>R$ {pagamento.valor_lente.toFixed(2)}</span>
                  </div>
                  {pagamento.ordem_servico?.armacao_lente?.[0]?.lente_comprada && (
                    <div className="text-xs text-gray-600 ml-2">
                      <p>Lente: {pagamento.ordem_servico.armacao_lente[0].lente_comprada}</p>
                    </div>
                  )}
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
            <h3 className="font-bold mb-1">PAGAMENTO</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Forma</span>
                <span>{pagamento.forma_pagamento?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span>{pagamento.status?.toUpperCase()}</span>
              </div>
              {pagamento.entrada && pagamento.entrada > 0 && (
                <div className="text-xs">
                  <div className="flex justify-between">
                    <span>• Entrada</span>
                    <span>R$ {pagamento.entrada.toFixed(2)}</span>
                  </div>
                  {pagamento.parcelas && pagamento.parcelas > 0 && (
                    <div className="flex justify-between">
                      <span>• Restante</span>
                      <span>{pagamento.parcelas}x R$ {pagamento.valor_parcelas?.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
              {!pagamento.entrada && pagamento.parcelas && pagamento.parcelas > 1 && (
                <div className="text-xs">
                  <div className="flex justify-between">
                    <span>• Parcelado</span>
                    <span>{pagamento.parcelas}x R$ {pagamento.valor_parcelas?.toFixed(2)}</span>
                  </div>
                </div>
              )}
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
          <Button variant="outline" onClick={handleWhatsApp} className="bg-green-600 text-white hover:bg-green-700">
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp Texto
          </Button>
          <Button variant="outline" onClick={handleWhatsAppPNG} className="bg-blue-600 text-white hover:bg-blue-700">
            <FileImage className="mr-2 h-4 w-4" />
            PNG
          </Button>
          <Button variant="outline" onClick={handleWhatsAppPDF} className="bg-red-600 text-white hover:bg-red-700">
            <FileText className="mr-2 h-4 w-4" />
            PDF
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