import axios from 'axios';

export async function generateAiWeddingMessage(prompt: string, tone: 'romantic' | 'friendly' | 'formal' = 'friendly'): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return 'Desejo a vocês toda a felicidade do mundo nessa nova etapa! Que o amor se multiplique a cada dia.';
  }

  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especialista em casamentos. Gere mensagens e votos lindos, emocionantes, acolhedores e elegantes para noivos e convidados em português do Brasil.',
          },
          {
            role: 'user',
            content: `Crie uma mensagem curta de casamento no tom ${tone} com base no seguinte pedido: ${prompt}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 10000,
      }
    );

    return response.data?.choices?.[0]?.message?.content || 'Felicidades aos noivos Fernanda e Gabryel!';
  } catch (err: any) {
    console.error('Erro na API DeepSeek:', err?.response?.data || err.message);
    return 'Desejamos que essa união seja repleta de paz, amor e realizações!';
  }
}
