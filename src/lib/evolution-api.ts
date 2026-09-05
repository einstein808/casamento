import { Guest, WeddingSettings } from './types';

export interface EvolutionSendResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export function cleanPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/\D/g, '');
  if (!clean) return '';

  clean = clean.replace(/^0+/, '');

  if (clean.length === 10 || clean.length === 11) {
    clean = `55${clean}`;
  }

  return clean;
}

/**
 * Processa sintaxe Spintax {Opção 1|Opção 2}
 */
export function processSpintax(text: string): string {
  if (!text) return '';
  let result = text;
  const spintaxRegex = /\{([^{}]+)\}/g;
  
  let match;
  while ((match = spintaxRegex.exec(result)) !== null) {
    const choices = match[1].split('|');
    const chosen = choices[Math.floor(Math.random() * choices.length)];
    result = result.replace(match[0], chosen);
    spintaxRegex.lastIndex = 0;
  }
  
  return result;
}

/**
 * Interpola variáveis dinâmicas no modelo de mensagem
 */
export function interpolateWeddingMessage(
  template: string,
  guest: Guest,
  settings: WeddingSettings,
  baseUrl: string
): string {
  const inviteUrl = `${baseUrl}/convite/${guest.slug}`;
  const weddingDateObj = new Date(settings.weddingDate);
  const timeDiff = weddingDateObj.getTime() - new Date().getTime();
  const daysLeft = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  const calculatedWeeks = Math.ceil(daysLeft / 7);

  const formattedDate = !isNaN(weddingDateObj.getTime())
    ? weddingDateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  const companionsText = guest.maxCompanions > 0 
    ? `(Convite para você + ${guest.maxCompanions} acompanhante${guest.maxCompanions > 1 ? 's' : ''})`
    : `(Convite individual)`;

  const confirmedCompsList = guest.confirmedCompanions && guest.confirmedCompanions.length > 0
    ? guest.confirmedCompanions.map(c => c.name).join(', ')
    : 'Nenhum';

  let raw = (template || '')
    .replace(/\{\{nome\}\}/gi, guest.name || 'Convidado(a)')
    .replace(/\{\{primeiroNome\}\}/gi, (guest.name || '').split(' ')[0] || 'Convidado(a)')
    .replace(/\{\{link\}\}/gi, inviteUrl)
    .replace(/\{\{noivos\}\}/gi, `${settings.brideName} & ${settings.groomName}`)
    .replace(/\{\{noiva\}\}/gi, settings.brideName)
    .replace(/\{\{noivo\}\}/gi, settings.groomName)
    .replace(/\{\{data\}\}/gi, formattedDate)
    .replace(/\{\{horario\}\}/gi, settings.ceremonyTime)
    .replace(/\{\{local\}\}/gi, settings.ceremonyVenueName)
    .replace(/\{\{endereco\}\}/gi, settings.ceremonyAddress)
    .replace(/\{\{acompanhantes\}\}/gi, companionsText)
    .replace(/\{\{acompanhantesConfirmados\}\}/gi, confirmedCompsList)
    .replace(/\{\{dias\}\}/gi, daysLeft.toString())
    .replace(/\{\{semanas\}\}/gi, calculatedWeeks.toString());

  return processSpintax(raw);
}

export class EvolutionApiClient {
  private baseUrl: string;
  private instance: string;
  private apiKey: string;
  private settings?: Partial<WeddingSettings>;

  constructor(settings?: Partial<WeddingSettings>) {
    this.settings = settings;

    let endpoint = (
      settings?.evolutionApiUrl || 
      process.env.NEXT_PUBLIC_WPP_API_URL || 
      process.env.NEXT_PUBLIC_EVOLUTION_API_URL || 
      'https://api.gabryelamaro.com'
    ).trim();

    this.apiKey = (
      settings?.evolutionApiKey || 
      process.env.NEXT_PUBLIC_WPP_API_KEY || 
      process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || 
      ''
    ).trim();

    let instanceName = (
      settings?.evolutionInstanceName || 
      process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE || 
      'BarmanJF'
    ).trim();

    if (endpoint.includes('/message/sendText/')) {
      const parts = endpoint.split('/message/sendText/');
      this.baseUrl = parts[0].replace(/\/+$/, '');
      if (parts[1] && (!instanceName || instanceName === 'BarmanJF')) {
        this.instance = parts[1].replace(/\/+$/, '').trim();
      } else {
        this.instance = instanceName;
      }
    } else if (endpoint.includes('/message/sendText')) {
      this.baseUrl = endpoint.replace('/message/sendText', '').replace(/\/+$/, '');
      this.instance = instanceName;
    } else {
      this.baseUrl = endpoint.replace(/\/+$/, '');
      this.instance = instanceName;
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.baseUrl && this.instance && this.apiKey);
  }

  public getConfigurationInfo() {
    return {
      baseUrl: this.baseUrl,
      instance: this.instance,
      hasApiKey: Boolean(this.apiKey),
      isConfigured: this.isConfigured(),
    };
  }

  async sendTextMessage(phone: string, text: string): Promise<EvolutionSendResponse> {
    const cleaned = cleanPhoneForWhatsApp(phone);
    if (!cleaned || cleaned.length < 10) {
      return { success: false, error: 'Número de telefone inválido ou incompleto.' };
    }

    if (!this.apiKey) {
      return { success: false, error: 'Chave de API (API Key) não informada. Preencha a API Key nas Configurações do painel e clique em Salvar.' };
    }

    // Se estiver executando no navegador, redireciona para a API Route interna do Next.js para evitar bloqueio de CORS
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: cleaned,
            message: text,
            settings: this.settings,
          }),
        });

        const data = await response.json();
        return data;
      } catch (err: any) {
        return {
          success: false,
          error: err.message || 'Erro ao comunicar com o servidor interno do site.',
        };
      }
    }

    // Execução Server-Side (Node.js) - Sem restrições de CORS
    try {
      const sendEndpoint = `${this.baseUrl}/message/sendText/${encodeURIComponent(this.instance)}`;
      const sendPayload = {
        number: cleaned,
        text: text,
        textMessage: {
          text: text,
        },
        options: {
          delay: 1200,
          presence: 'composing',
        },
      };

      const response = await fetch(sendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(sendPayload),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          messageId: data?.key?.id || data?.messageId || data?.id || 'sent',
        };
      } else {
        const errText = await response.text();
        let parsedErr = errText;
        try {
          const jsonErr = JSON.parse(errText);
          parsedErr = jsonErr?.response?.message?.[0] || 
                      jsonErr?.response?.message || 
                      jsonErr?.message || 
                      jsonErr?.error || 
                      errText;
          if (Array.isArray(parsedErr)) {
            parsedErr = parsedErr.join(', ');
          }
        } catch {}

        let help = '';
        if (response.status === 401 || response.status === 403) {
          help = ' (Chave de API inválida ou sem permissão na Evolution API)';
        } else if (response.status === 404) {
          help = ` (Instância "${this.instance}" não encontrada na Evolution API)`;
        } else if (response.status === 400) {
          help = ' (Verifique se o WhatsApp está conectado e se o número é válido com DDD)';
        }

        return {
          success: false,
          error: `${parsedErr || `Erro HTTP ${response.status}`}${help}`,
        };
      }
    } catch (err: any) {
      console.error('Erro ao conectar com Evolution API:', err);
      return {
        success: false,
        error: err.message || 'Falha ao conectar com o servidor da Evolution API.',
      };
    }
  }

  /**
   * Teste de conexão com envio de mensagem ou verificação de status
   */
  async testConnection(testPhone?: string): Promise<{ success: boolean; message: string }> {
    if (!this.apiKey) {
      return { success: false, message: 'API Key não configurada. Preencha o campo API Key e salve.' };
    }
    if (!this.instance) {
      return { success: false, message: 'Nome da instância não configurado.' };
    }
    if (!this.baseUrl) {
      return { success: false, message: 'URL da Evolution API não informada.' };
    }

    if (testPhone) {
      const res = await this.sendTextMessage(
        testPhone, 
        '💍 *Teste de Conexão - Casamento*\n\n' +
        'Olá! Esta é uma mensagem de teste enviada a partir do painel do seu site de casamento.\n\n' +
        'Se você recebeu esta mensagem, sua integração com a *Evolution API (WhatsApp)* está 100% configurada e funcionando! 🚀✨'
      );
      if (res.success) {
        return { success: true, message: 'Mensagem de teste enviada com sucesso para o WhatsApp!' };
      } else {
        return { success: false, message: `Falha ao enviar: ${res.error}` };
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/whatsapp/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: this.settings }),
        });
        return await res.json();
      } catch (e: any) {
        return { success: false, message: e.message || 'Erro ao testar conexão' };
      }
    }

    try {
      const checkEndpoint = `${this.baseUrl}/instance/connectionState/${encodeURIComponent(this.instance)}`;
      const res = await fetch(checkEndpoint, {
        headers: {
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const state = data?.instance?.state || data?.state || 'open';
        return { success: true, message: `Instância "${this.instance}" conectada com sucesso! (Estado: ${state})` };
      } else {
        const txt = await res.text();
        return { success: false, message: `Evolution API respondeu com erro (${res.status}): ${txt}` };
      }
    } catch (err: any) {
      return { success: false, message: `Falha de rede ao conectar à Evolution API: ${err.message}` };
    }
  }

  /**
   * 1. Envio de Convite Inicial
   */
  async sendInvitation(guest: Guest, settings: WeddingSettings, baseUrl: string, customTemplate?: string): Promise<EvolutionSendResponse> {
    if (!guest.phone) {
      return { success: false, error: 'O convidado não possui telefone cadastrado.' };
    }

    const defaultTemplate = `💍 *CONVITE DE CASAMENTO* 💍\n\n` +
      `Olá *{{nome}}*!\n\n` +
      `Com imensa alegria, nós, *{{noivos}}*, convidamos você para celebrar o nosso amor e o início do nosso para sempre!\n\n` +
      `🗓 *Data:* {{data}}\n` +
      `⏰ *Horário:* {{horario}}\n` +
      `📍 *Local:* {{local}}\n` +
      `✨ {{acompanhantes}}\n\n` +
      `Para nos organizarmos da melhor forma com o buffet e cerimonial, pedimos com carinho que *confirme sua presença* através do seu link exclusivo:\n` +
      `👉 {{link}}\n\n` +
      `Esperamos você para viver esse dia inesquecível conosco! ❤️`;

    const templateToUse = customTemplate || settings.customInviteMessageTemplate || defaultTemplate;
    const text = interpolateWeddingMessage(templateToUse, guest, settings, baseUrl);

    return this.sendTextMessage(guest.phone, text);
  }

  /**
   * 2. Lembrete de Confirmação
   */
  async sendRsvpReminder(guest: Guest, settings: WeddingSettings, baseUrl: string, customTemplate?: string): Promise<EvolutionSendResponse> {
    if (!guest.phone) {
      return { success: false, error: 'O convidado não possui telefone cadastrado.' };
    }

    const defaultTemplate = `⏰ *LEMBRETE DE CONFIRMAÇÃO - CASAMENTO* ⏰\n\n` +
      `Olá *{{nome}}*!\n\n` +
      `Faltam apenas *{{dias}} dias* (~{{semanas}} semanas) para o nosso grande dia! 👰🤵\n\n` +
      `Estamos finalizando a lista de convidados junto ao buffet e cerimonial. Você ainda não confirmou sua presença no nosso site.\n\n` +
      `Por favor, acesse o link abaixo em 1 minuto para nos avisar se poderá comparecer:\n` +
      `👉 {{link}}\n\n` +
      `Com amor,\n*{{noivos}}* ❤️`;

    const templateToUse = customTemplate || settings.customReminderMessageTemplate || defaultTemplate;
    const text = interpolateWeddingMessage(templateToUse, guest, settings, baseUrl);

    return this.sendTextMessage(guest.phone, text);
  }

  /**
   * 3. Reconfirmação Final Pré-Evento
   */
  async sendReconfirmationMessage(guest: Guest, settings: WeddingSettings, baseUrl: string, customTemplate?: string): Promise<EvolutionSendResponse> {
    if (!guest.phone) {
      return { success: false, error: 'O convidado não possui telefone cadastrado.' };
    }

    const defaultTemplate = `📋 *RECONFIRMAÇÃO FINAL DE PRESENÇA* 📋\n\n` +
      `Olá *{{nome}}*!\n\n` +
      `Faltam apenas *{{dias}} dias* para o casamento de *{{noivos}}*! 👰🤵✨\n\n` +
      `Estamos enviando esta mensagem para fazer a *Reconfirmação Final* dos convidados confirmados, para passarmos a lista definitiva ao Buffet e organização dos lugares.\n\n` +
      `Por favor, dê um clique rápido no link abaixo para fazer a *Reconfirmação Definitiva* ou nos avisar caso tenha ocorrido algum imprevisto:\n` +
      `👉 {{link}}#rsvp\n\n` +
      `Muito obrigado pelo carinho de sempre! ❤️`;

    const templateToUse = customTemplate || settings.customReconfirmationMessageTemplate || defaultTemplate;
    const text = interpolateWeddingMessage(templateToUse, guest, settings, baseUrl);

    return this.sendTextMessage(guest.phone, text);
  }

  static getWhatsAppDirectUrl(phone: string, message: string): string {
    const cleaned = cleanPhoneForWhatsApp(phone);
    const encoded = encodeURIComponent(message);
    return `https://api.whatsapp.com/send?phone=${cleaned}&text=${encoded}`;
  }
}
