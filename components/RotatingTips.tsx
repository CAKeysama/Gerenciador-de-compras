import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const TIPS = [
  "Depósitos pequenos e frequentes criam grandes resultados.",
  "Defina metas realistas e acompanhe seu progresso regularmente.",
  "Economize primeiro, gaste o que sobra - inverta essa prioridade.",
  "Automatize suas transferências para não esquecer de poupar.",
  "Divida metas grandes em objetivos menores e mais atingíveis.",
  "Use aplicativos para rastrear seus gastos e identificar economia.",
  "Crie um fundo de emergência antes de investir em grandes compras.",
  "Evite impulsos: espere 24 horas antes de fazer compras não essenciais.",
  "Pesquise preços antes de fazer grandes compras - economize 10-20%.",
  "Renegue dívidas com juros altos para economizar dinheiro.",
  "Mantenha registros detalhados de suas despesas e receitas.",
  "Invista em você mesmo através de educação financeira continua.",
  "Negocie descontos em contas recorrentes (internet, telefone, etc).",
  "Use cashback e programas de recompensas do seu cartão.",
  "Organize suas contas em categorias para melhor controle.",
  "Revise suas metas mensalmente e ajuste conforme necessário.",
  "Dê um tempo antes de decidir se realmente precisa de algo.",
  "Aprenda a diferença entre necessidades e desejos.",
  "Celebre cada milestone alcançado para manter a motivação.",
  "Compartilhe seus objetivos com alguém para maior comprometimento.",
  "Use planilhas para visualizar seu progresso ao longo do tempo.",
  "Crie um orçamento realista baseado em seu padrão de vida.",
];

export const RotatingTips: React.FC = () => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl md:rounded-2xl flex items-start gap-3 md:gap-4 animate-in fade-in duration-500">
      <div className="p-1.5 bg-amber-100 rounded-full text-amber-600 mt-0.5 flex-shrink-0">
        <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs md:text-sm font-bold text-amber-900">Dica</p>
        <p className="text-[10px] md:text-xs text-amber-700 mt-1 leading-relaxed transition-all duration-300">
          {TIPS[tipIndex]}
        </p>
      </div>
    </div>
  );
};
