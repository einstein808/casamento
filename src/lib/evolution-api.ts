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

  constructor(settings?: Partial<WeddingSettings>) {
    let endpoint = settings?.evolutionApiUrl || 
                   process.env.NEXT_PUBLIC_WPP_API_URL || 
                   process.env.NEXT_PUBLIC_EVOLUTION_API_URL || 
                   'https://api.gabryelamaro.com/message/sendText/BarmanJF';

    this.apiKey = settings?.evolutionApiKey || 
                  process.env.NEXT_PUBLIC_WPP_API_KEY || 
                  process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || 
                  '';

    this.instance = settings?.evolutionInstanceName || 
                    process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE || 
                    'BarmanJF';

    if (endpoint.includes('/message/sendText/')) {
      const parts = endpoint.split('/message/sendText/');
      this.baseUrl = parts[0].replace(/\/+$/, '');
      if (parts[1]) {
        this.instance = parts[1];
      }
    } else {
      this.baseUrl = endpoint.replace(/\/+$/, '');
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.baseUrl && this.instance);
  }

  async simulateTypingPresence(number: string, durationMs: number = 2000): Promise<void> {
    try {
      const presenceEndpoint = `${this.baseUrl}/chat/sendPresence/${this.instance}`;
      await fetch(presenceEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify({
          number,
          presence: 'composing',
          delay: durationMs,
        }),
      });
    } catch {
      // Non-blocking
    }
  }

  async sendTextMessage(phone: string, text: string): Promise<EvolutionSendResponse> {
    const cleaned = cleanPhoneForWhatsApp(phone);
    if (!cleaned || cleaned.length < 10) {
      return { success: false, error: 'Número de telefone inválido ou incompleto.' };
    }

    try {
      await this.simulateTypingPresence(cleaned, 1500);

      const sendEndpoint = `${this.baseUrl}/message/sendText/${this.instance}`;
      const sendPayload = {
        number: cleaned,
        text: text,
      };

      const response = await fetch(sendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify(sendPayload),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          messageId: data?.key?.id || data?.messageId || 'sent',
        };
      } else {
        const errText = await response.text();
        let parsedErr = errText;
        try {
          const jsonErr = JSON.parse(errText);
          parsedErr = jsonErr?.response?.message || jsonErr?.message || errText;
        } catch {}
        return {
          success: false,
          error: parsedErr || `Erro HTTP ${response.status}`,
        };
      }
    } catch (err: any) {
      console.error('Erro ao enviar mensagem via Evolution API:', err);
      return {
        success: false,
        error: err.message || 'Falha de conexão com a Evolution API',
      };
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
   * 2. Lembrete de RSVP
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
