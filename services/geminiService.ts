import { GoogleGenAI } from "@google/genai";
import { ShoppingList, FinancialInsight } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeFinances = async (lists: ShoppingList[]): Promise<FinancialInsight[]> => {
  try {
    const ai = getClient();
    
    // Prepare data for the model
    const summary = lists.map(l => ({
      name: l.name,
      goal: l.goal,
      totalCost: l.products.reduce((acc, p) => acc + (p.price * p.quantity), 0),
      saved: l.savedAmount,
      targetDate: l.targetDate,
      itemsCount: l.products.length,
      completion: l.products.filter(p => p.completed).length
    }));

    const prompt = `
      Atue como um consultor financeiro pessoal inteligente e empático.
      Analise os seguintes dados de planejamento de compras do usuário:
      ${JSON.stringify(summary, null, 2)}

      Forneça 3 insights curtos, diretos e úteis (estilo Google, no máximo 2 frases cada).
      Classifique cada um como 'success', 'warning' ou 'info'.
      
      Retorne APENAS um JSON array puro com o formato:
      [
        { "title": "Título curto", "message": "Mensagem clara.", "type": "warning" }
      ]
      Não use markdown code blocks.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return [];

    return JSON.parse(text) as FinancialInsight[];

  } catch (error) {
    console.error("Gemini analysis failed", error);
    // Fallback static insights if API fails
    return [
      {
        title: "Dica de Economia",
        message: "Revise suas prioridades para alcançar suas metas mais rápido.",
        type: "info"
      }
    ];
  }
};