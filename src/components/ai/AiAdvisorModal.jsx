import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { analyzeFinancialHealth, getAiAdvisorResponse } from '../../services/aiAdvisor.js';
import { calculateExpensesByCategory } from '../../utils/calculations.js';
import { Sparkles, Send, Bot, User, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

export function AiAdvisorModal() {
  const {
    isAiAdvisorOpen,
    closeAiAdvisor,
    financialSummary,
    transactions,
    categories,
    budgetsWithSpent,
    debts,
    recurring,
    formatMoney,
  } = useFinance();

  const [messages, setMessages] = useState([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Merhaba! Ben Kişisel Muhasebe AI Danışmanınızım. 🤖\nGelirlerinizi, harcamalarınızı, fişlerinizi ve bütçelerinizi analiz ettim. Bana bütçenizle veya tasarruf etmekle ilgili dilediğinizi sorabilirsiniz!',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const categoriesData = useMemo(() => {
    return calculateExpensesByCategory(transactions, categories).categories;
  }, [transactions, categories]);

  const health = useMemo(() => {
    return analyzeFinancialHealth(financialSummary, budgetsWithSpent, debts, recurring);
  }, [financialSummary, budgetsWithSpent, debts, recurring]);

  useEffect(() => {
    if (isAiAdvisorOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isAiAdvisorOpen, messages]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = getAiAdvisorResponse(text, {
        summary: financialSummary,
        categoriesData,
        budgets: budgetsWithSpent,
        debts,
        recurring,
      });

      const aiMsg = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: reply,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 400);
  };

  const presetQuestions = [
    'Bu ay nereye gitti?',
    'Nasıl tasarruf edebilirim?',
    'Borç ve alacaklarım ne durumda?',
    'Aboneliklerim ne kadar tutuyor?',
  ];

  return (
    <Modal
      isOpen={isAiAdvisorOpen}
      onClose={closeAiAdvisor}
      title="🤖 Yapay Zeka Finans Koçu"
      subtitle="Finansal sağlık analizi ve kişisel bütçe tavsiyeleri"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Health Score Banner */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-4 rounded-2xl border border-emerald-800/60 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                Finansal Sağlık Puanı
              </span>
              <div className="text-2xl font-black mt-0.5 flex items-center gap-2">
                <span>{health.score}/100</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                  {health.grade}
                </span>
              </div>
            </div>
            <div className="text-right text-xs text-slate-300">
              <div>Aylık Tasarruf Oranı:</div>
              <strong className="text-emerald-400 text-sm">
                %{financialSummary.monthlySavingsRate.toFixed(1)}
              </strong>
            </div>
          </div>

          {health.highlights.length > 0 && (
            <p className="text-xs text-slate-300 mt-2.5 pt-2 border-t border-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{health.highlights[0]}</span>
            </p>
          )}
        </div>

        {/* Chat Message Window */}
        <div className="h-64 sm:h-72 overflow-y-auto space-y-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs overscroll-contain">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-line leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-9">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-200" />
              <span>Yapay zeka analiz ediyor...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Preset Question Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {presetQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-colors shrink-0"
            >
              💬 {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-1"
        >
          <input
            type="text"
            placeholder="Yapay zekaya bir soru sorun..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
          />
          <Button type="submit" variant="primary" size="md" icon={Send}>
            Gönder
          </Button>
        </form>
      </div>
    </Modal>
  );
}
