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

export function gerarTextoComprovanteWhatsApp(pagamento: Pagamento): string {
  const data = new Date().toLocaleDateString('pt-BR');
  const hora = new Date().toLocaleTimeString('pt-BR');
  
  let texto = `🥽 *ARTUR ÓTICA* 🥽\n`;
  texto += `📄 CNPJ: 00.000.000/0001-00\n`;
  texto += `📍 Endereço da Empresa\n`;
  texto += `📞 Tel: (00) 0000-0000\n\n`;
  
  texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
  texto += `💰 *CUPOM FISCAL* #${pagamento.ordem_servico?.numero_os}\n`;
  texto += `📅 Data: ${data}\n`;
  texto += `🕐 Hora: ${hora}\n`;
  texto += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  texto += `👤 *CLIENTE*\n`;
  texto += `${pagamento.ordem_servico?.cliente?.nome}\n\n`;
  
  texto += `📦 *ITENS*\n`;
  if (pagamento.valor_armacao) {
    texto += `• Armação - R$ ${pagamento.valor_armacao.toFixed(2)}\n`;
    if (pagamento.ordem_servico?.armacao_lente?.[0]) {
      const armacao = pagamento.ordem_servico.armacao_lente[0];
      if (armacao.marca_armacao) {
        texto += `  Marca: ${armacao.marca_armacao}\n`;
      }
      if (armacao.referencia_armacao) {
        texto += `  Ref: ${armacao.referencia_armacao}\n`;
      }
    }
  }
  
  if (pagamento.valor_lente) {
    texto += `• Lente - R$ ${pagamento.valor_lente.toFixed(2)}\n`;
    if (pagamento.ordem_servico?.armacao_lente?.[0]?.lente_comprada) {
      texto += `  Lente: ${pagamento.ordem_servico.armacao_lente[0].lente_comprada}\n`;
    }
  }
  
  texto += `━━━━━━━━━━━━━━━━━━━━━\n`;
  texto += `💸 *TOTAL: R$ ${pagamento.valor_total.toFixed(2)}*\n`;
  
  if (pagamento.entrada) {
    texto += `💰 Entrada: R$ ${pagamento.entrada.toFixed(2)}\n`;
  }
  
  if (pagamento.parcelas && pagamento.parcelas > 1) {
    texto += `📝 Parcelas: ${pagamento.parcelas}x R$ ${pagamento.valor_parcelas?.toFixed(2)}\n`;
  }
  
  texto += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  texto += `💳 *PAGAMENTO*\n`;
  texto += `🔸 Forma: ${pagamento.forma_pagamento?.toUpperCase()}\n`;
  texto += `🔸 Status: ${pagamento.status?.toUpperCase()}\n\n`;
  
  if (pagamento.entrada && pagamento.entrada > 0) {
    texto += `💰 • Entrada: R$ ${pagamento.entrada.toFixed(2)}\n`;
    if (pagamento.parcelas && pagamento.parcelas > 0) {
      texto += `📝 • Restante: ${pagamento.parcelas}x R$ ${pagamento.valor_parcelas?.toFixed(2)}\n`;
    }
  } else if (pagamento.parcelas && pagamento.parcelas > 1) {
    texto += `📝 • Parcelado: ${pagamento.parcelas}x R$ ${pagamento.valor_parcelas?.toFixed(2)}\n`;
  }
  
  texto += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  texto += `🙏 *Obrigado pela preferência!*\n`;
  texto += `✨ *Volte sempre!*\n`;
  texto += `━━━━━━━━━━━━━━━━━━━━━`;
  
  return texto;
}

export function enviarWhatsApp(texto: string, numeroCliente?: string) {
  const textoEncoded = encodeURIComponent(texto);
  const url = numeroCliente 
    ? `https://wa.me/55${numeroCliente}?text=${textoEncoded}`
    : `https://wa.me/?text=${textoEncoded}`;
  
  window.open(url, '_blank');
}