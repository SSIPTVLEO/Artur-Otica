import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ReceitaFormProps {
  ordemServicoId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReceitaForm({ ordemServicoId, onSuccess, onCancel }: ReceitaFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [ordensServico, setOrdensServico] = useState<any[]>([]);
  const [selectedOS, setSelectedOS] = useState<string>(ordemServicoId?.toString() || "");
  const { toast } = useToast();

  // Estado para os campos da receita
  const [receita, setReceita] = useState({
    // Olho Direito Longe
    esferico_longe_od: "",
    cilindrico_longe_od: "",
    eixo_longe_od: "",
    dnp_longe_od: "",
    altura_od: "",
    adicao_od: "",
    // Olho Esquerdo Longe
    esferico_longe_oe: "",
    cilindrico_longe_oe: "",
    eixo_longe_oe: "",
    dnp_longe_oe: "",
    altura_oe: "",
    adicao_oe: "",
    // Olho Direito Perto - calculados automaticamente
    esferico_perto_od: "",
    cilindrico_perto_od: "",
    eixo_perto_od: "",
    // Olho Esquerdo Perto - calculados automaticamente
    esferico_perto_oe: "",
    cilindrico_perto_oe: "",
    eixo_perto_oe: "",
  });

  useEffect(() => {
    fetchOrdensServico();
  }, []);

  // Cálculo automático dos campos "perto" quando a adição é preenchida
  useEffect(() => {
    if (receita.adicao_od && receita.esferico_longe_od) {
      const esfericoLonge = parseFloat(receita.esferico_longe_od) || 0;
      const adicao = parseFloat(receita.adicao_od) || 0;
      setReceita(prev => ({
        ...prev,
        esferico_perto_od: (esfericoLonge + adicao).toFixed(2),
        cilindrico_perto_od: prev.cilindrico_longe_od,
        eixo_perto_od: prev.eixo_longe_od,
      }));
    }
  }, [receita.adicao_od, receita.esferico_longe_od, receita.cilindrico_longe_od, receita.eixo_longe_od]);

  useEffect(() => {
    if (receita.adicao_oe && receita.esferico_longe_oe) {
      const esfericoLonge = parseFloat(receita.esferico_longe_oe) || 0;
      const adicao = parseFloat(receita.adicao_oe) || 0;
      setReceita(prev => ({
        ...prev,
        esferico_perto_oe: (esfericoLonge + adicao).toFixed(2),
        cilindrico_perto_oe: prev.cilindrico_longe_oe,
        eixo_perto_oe: prev.eixo_longe_oe,
      }));
    }
  }, [receita.adicao_oe, receita.esferico_longe_oe, receita.cilindrico_longe_oe, receita.eixo_longe_oe]);

  const fetchOrdensServico = async () => {
    try {
      const { data, error } = await supabase
        .from("ordem_servico")
        .select(`
          id,
          numero_os,
          data_pedido,
          cliente (
            nome
          )
        `)
        .order("data_pedido", { ascending: false });

      if (error) throw error;
      setOrdensServico(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar ordens de serviço.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOS) {
      toast({
        title: "Erro",
        description: "Selecione uma ordem de serviço.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from("receita").insert({
        id_os: parseInt(selectedOS),
        ...Object.fromEntries(
          Object.entries(receita).map(([key, value]) => [
            key.toUpperCase(),
            value === "" ? null : isNaN(Number(value)) ? value : Number(value)
          ])
        ),
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Receita cadastrada com sucesso!",
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar receita.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setReceita(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Nova Receita
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ordem-servico">Ordem de Serviço</Label>
            <Select value={selectedOS} onValueChange={setSelectedOS} disabled={!!ordemServicoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma ordem de serviço" />
              </SelectTrigger>
              <SelectContent>
                {ordensServico.map((os) => (
                  <SelectItem key={os.id} value={os.id.toString()}>
                    OS {os.numero_os} - {os.cliente?.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Olho Direito */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Olho Direito (OD)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Esférico Longe</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={receita.esferico_longe_od}
                      onChange={(e) => handleInputChange("esferico_longe_od", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Cilíndrico Longe</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={receita.cilindrico_longe_od}
                      onChange={(e) => handleInputChange("cilindrico_longe_od", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Eixo Longe</Label>
                    <Input
                      type="number"
                      min="0"
                      max="180"
                      value={receita.eixo_longe_od}
                      onChange={(e) => handleInputChange("eixo_longe_od", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>DNP</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={receita.dnp_longe_od}
                      onChange={(e) => handleInputChange("dnp_longe_od", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Altura</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={receita.altura_od}
                      onChange={(e) => handleInputChange("altura_od", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Adição</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={receita.adicao_od}
                    onChange={(e) => handleInputChange("adicao_od", e.target.value)}
                    className="border-primary"
                  />
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Valores Perto (Calculados)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Esférico Perto</Label>
                      <Input value={receita.esferico_perto_od} disabled className="bg-accent" />
                    </div>
                    <div>
                      <Label>Cilíndrico Perto</Label>
                      <Input value={receita.cilindrico_perto_od} disabled className="bg-accent" />
                    </div>
                    <div>
                      <Label>Eixo Perto</Label>
                      <Input value={receita.eixo_perto_od} disabled className="bg-accent" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Olho Esquerdo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Olho Esquerdo (OE)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Esférico Longe</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={receita.esferico_longe_oe}
                      onChange={(e) => handleInputChange("esferico_longe_oe", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Cilíndrico Longe</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={receita.cilindrico_longe_oe}
                      onChange={(e) => handleInputChange("cilindrico_longe_oe", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Eixo Longe</Label>
                    <Input
                      type="number"
                      min="0"
                      max="180"
                      value={receita.eixo_longe_oe}
                      onChange={(e) => handleInputChange("eixo_longe_oe", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>DNP</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={receita.dnp_longe_oe}
                      onChange={(e) => handleInputChange("dnp_longe_oe", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Altura</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={receita.altura_oe}
                      onChange={(e) => handleInputChange("altura_oe", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Adição</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={receita.adicao_oe}
                    onChange={(e) => handleInputChange("adicao_oe", e.target.value)}
                    className="border-primary"
                  />
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Valores Perto (Calculados)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Esférico Perto</Label>
                      <Input value={receita.esferico_perto_oe} disabled className="bg-accent" />
                    </div>
                    <div>
                      <Label>Cilíndrico Perto</Label>
                      <Input value={receita.cilindrico_perto_oe} disabled className="bg-accent" />
                    </div>
                    <div>
                      <Label>Eixo Perto</Label>
                      <Input value={receita.eixo_perto_oe} disabled className="bg-accent" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-primary hover:shadow-glow" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Receita
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}