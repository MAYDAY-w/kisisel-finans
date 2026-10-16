import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { analyzeFinancialHealth, getAiAdvisorResponse } from '../../services/aiAdvisor.js';
import { calculateExpensesByCategory } from '../../utils/calculations.js';
import { Sparkles, Send, Bot, User, CheckCircle2, TrendingUp, AlertCircle, ShieldCheck, Zap } from 'lucide-react';

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
    investments,
    accounts,
    settings,
    formatMoney,
    t,
    isEn,
  } = useFinance();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'm-1',
          sender: 'ai',
          text: t('aiAdvisor.greeting'),
        },
      ]);
    }
  }, [t, messages.length]);

  const categoriesData = useMemo(() => {
    return calculateExpensesByCategory(transactions, categories).categories;
  }, [transactions, categories]);

  const health = useMemo(() => {
    return analyzeFinancialHealth(
      financialSummary,
      budgetsWithSpent,
      debts,
      recurring,
      investments,
      accounts,
      isEn
    );
  }, [financialSummary, budgetsWithSpent, debts, recurring, investments, accounts, isEn]);

  useEffect(() => {
    if (isAiAdvisorOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isAiAdvisorOpen, messages]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const reply = await getAiAdvisorResponse(text, {
        summary: financialSummary,
        categoriesData,
        budgets: budgetsWithSpent,
        debts,
        recurring,
        investments,
        accounts,
        geminiApiKey: settings?.geminiApiKey || '',
        isEn,
      });

      const aiMsg = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: reply,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI Advisor error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-err-' + Date.now(),
          sender: 'ai',
          text: isEn
            ? 'An error occurred while generating the advice. Please try again.'
            : 'Tavsiye oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const presetQuestions = isEn
    ? [
        'Where did my money go this month?',
        'How is my salary & cash flow?',
        'How much do I spend on subscriptions?',
        'How can I save more effectively?',
        'Is my emergency fund sufficient?',
        'What is my debt and installment status?',
        'How am I doing on the 50/30/20 rule?',
      ]
    : [
        'Bu ay nereye gitti?',
        'Maaşım ve nakit akışım nasıl?',
        'Aboneliklerim ne kadar tutuyor?',
        'Nasıl tasarruf edebilirim?',
        'Acil durum fonum yeterli mi?',
        'Borç ve taksit durumum nedir?',
        '50/30/20 kuralına göre durumum ne?',
      ];

  const hasGeminiKey = Boolean(settings?.geminiApiKey);

  return (
    <Modal
      isOpen={isAiAdvisorOpen}
      onClose={closeAiAdvisor}
      title={`🤖 ${t('aiAdvisor.title')}`}
      subtitle={t('aiAdvisor.subtitle')}
      maxWidth="max-w-xl"
    >
      <div className="space-y-3.5">
        {/* Health Score & Financial Vitals Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-4 rounded-2xl border border-emerald-900/60 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider">
                  {t('aiAdvisor.quickHealth')}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    hasGeminiKey
                      ? 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  }`}
                >
                  {hasGeminiKey ? <Sparkles className="w-2.5 h-2.5" /> : <Zap className="w-2.5 h-2.5" />}
                  <span>{hasGeminiKey ? 'Gemini AI' : 'Akıllı Analiz'}</span>
                </span>
              </div>

              <div className="text-2xl sm:text-3xl font-black mt-1 flex items-center gap-2.5">
                <span>{health.score}/100</span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                    health.score >= 80
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : health.score >= 60
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {health.grade}
                </span>
              </div>
            </div>

            {/* Quick Financial Vitals Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
                <div className="text-[10px] text-slate-400 font-medium">Aylık Maaş / Gelir:</div>
                <strong className="text-emerald-400 font-bold text-xs">
                  {health.salaryAmount > 0 ? `+${formatMoney(health.salaryAmount)}` : (health.totalRegularIncome > 0 ? `+${formatMoney(health.totalRegularIncome)}` : '-')}
                </strong>
              </div>

              <div className="bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
                <div className="text-[10px] text-slate-400 font-medium">Sabit Abonelikler:</div>
                <strong className="text-rose-400 font-bold text-xs">
                  {health.totalRegularExpense > 0 ? `-${formatMoney(health.totalRegularExpense)}` : '0 ₺'}
                </strong>
              </div>
            </div>
          </div>

          {health.highlights.length > 0 && (
            <p className="text-xs text-slate-200 mt-3 pt-2.5 border-t border-white/10 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{health.highlights[0]}</span>
            </p>
          )}
        </div>

        {/* Chat Message Window */}
        <div className="h-64 sm:h-72 overflow-y-auto space-y-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs overscroll-contain">
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
              <span>{isEn ? 'Analyzing financial data...' : 'Finansal verileriniz analiz ediliyor...'}</span>
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
              className="text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-colors shrink-0 shadow-2xs"
            >
              💡 {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-0.5"
        >
          <input
            type="text"
            placeholder={t('aiAdvisor.placeholder')}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
          />
          <Button type="submit" variant="primary" size="md" icon={Send} disabled={isTyping || !inputText.trim()}>
            {t('aiAdvisor.send')}
          </Button>
        </form>
      </div>
    </Modal>
  );
}
