import React, { useState } from 'react';
import { Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { FinancialInsight } from '../types';

interface Props {
  insights: FinancialInsight[];
  loadingInsights: boolean;
  onFetchInsights: () => void;
}

export const IntelligentAnalysis: React.FC<Props> = ({
  insights,
  loadingInsights,
  onFetchInsights,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-br from-indigo-50 via-white to-white p-4 rounded-xl border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 group-hover:bg-indigo-200 transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-sm font-bold text-indigo-600 uppercase block">
              Análise Inteligente
            </span>
            <span className="text-xs text-indigo-500">
              {insights.length > 0 ? `${insights.length} dica${insights.length > 1 ? 's' : ''}` : 'Gere análises personalizadas'}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-indigo-600 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="bg-gradient-to-br from-indigo-50 via-white to-white p-5 rounded-xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Dicas Personalizadas</h3>
            {insights.length > 0 && (
              <button
                onClick={onFetchInsights}
                className="text-xs bg-white px-3 py-1.5 rounded border border-indigo-100 text-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
              >
                Atualizar
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-96 pr-2 custom-scrollbar">
            {!loadingInsights && insights.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-6">
                <p className="text-indigo-900/60 text-sm mb-4">
                  Dicas personalizadas baseadas nos seus padrões.
                </p>
                <button
                  onClick={onFetchInsights}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-200"
                >
                  Gerar Análise
                </button>
              </div>
            )}

            {loadingInsights && (
              <div className="flex flex-col items-center justify-center py-6 text-indigo-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <span className="text-sm font-medium">Analisando...</span>
              </div>
            )}

            {insights.length > 0 && (
              <div className="grid grid-cols-1 gap-2">
                {insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`bg-white/90 p-3 rounded-xl border ${
                      insight.type === 'warning'
                        ? 'border-amber-100 bg-amber-50/50'
                        : 'border-indigo-50'
                    } shadow-sm`}
                  >
                    <p
                      className={`font-semibold text-xs mb-0.5 ${
                        insight.type === 'warning'
                          ? 'text-amber-700'
                          : 'text-slate-800'
                      }`}
                    >
                      {insight.title}
                    </p>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {insight.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
