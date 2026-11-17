import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ChevronDown, ChevronUp, Layers, Target } from 'lucide-react';

export function BudgetFormModal() {
  const {
    isBudgetModalOpen,
    closeBudgetModal,
    editingBudget,
    setBudget,
    categories,
    t,
    getCategoryName,
    overallBudget,
    saveOverallBudget,
  } = useFinance();

  // 'total' or 'category'
  const [budgetType, setBudgetType] = useState('category');

  // Category budget fields
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'food');
  const [limit, setLimit] = useState('');
  const [showTiers, setShowTiers] = useState(false);
  const [upperLimit, setUpperLimit] = useState('');
  const [averageLimit, setAverageLimit] = useState('');
  const [lowerLimit, setLowerLimit] = useState('');

  // Total budget fields
  const [totalBudgetAmount, setTotalBudgetAmount] = useState('');
  const [totalUpperLimit, setTotalUpperLimit] = useState('');
  const [totalAverageLimit, setTotalAverageLimit] = useState('');
  const [totalLowerLimit, setTotalLowerLimit] = useState('');
  const [showTotalTiers, setShowTotalTiers] = useState(false);

  useEffect(() => {
    if (isBudgetModalOpen) {
      if (editingBudget) {
        // Editing existing category budget
        setBudgetType('category');
        setCategoryId(editingBudget.categoryId || categories[0]?.id || 'food');
        setLimit(editingBudget.limit ? String(editingBudget.limit) : '');
        setUpperLimit(editingBudget.upperLimit ? String(editingBudget.upperLimit) : '');
        setAverageLimit(editingBudget.averageLimit ? String(editingBudget.averageLimit) : '');
        setLowerLimit(editingBudget.lowerLimit ? String(editingBudget.lowerLimit) : '');
        setShowTiers(Boolean(editingBudget.upperLimit || editingBudget.averageLimit || editingBudget.lowerLimit));
      } else {
        // New budget - reset
        setBudgetType('category');
        setCategoryId(categories[0]?.id || 'food');
        setLimit('');
        setUpperLimit('');
        setAverageLimit('');
        setLowerLimit('');
        setShowTiers(false);
      }
      // Always populate total budget from saved state
      setTotalBudgetAmount(overallBudget.totalBudget ? String(overallBudget.totalBudget) : '');
      setTotalUpperLimit(overallBudget.upperLimit ? String(overallBudget.upperLimit) : '');
      setTotalAverageLimit(overallBudget.averageLimit ? String(overallBudget.averageLimit) : '');
      setTotalLowerLimit(overallBudget.lowerLimit ? String(overallBudget.lowerLimit) : '');
      setShowTotalTiers(Boolean(overallBudget.upperLimit || overallBudget.averageLimit || overallBudget.lowerLimit));
    }
  }, [isBudgetModalOpen, editingBudget, categories, overallBudget]);

  const parseNum = (val) => {
    const n = parseFloat(String(val).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (budgetType === 'total') {
      const parsedTotal = parseNum(totalBudgetAmount);
      if (parsedTotal <= 0) {
        alert(t('transfer.validAmountError') || 'Geçerli bir tutar giriniz.');
        return;
      }
      saveOverallBudget({
        totalBudget: parsedTotal,
        upperLimit: parseNum(totalUpperLimit),
        averageLimit: parseNum(totalAverageLimit),
        lowerLimit: parseNum(totalLowerLimit),
      });
      closeBudgetModal();
      return;
    }

    // Category budget
    const parsedLimit = parseNum(limit);
    if (parsedLimit <= 0) {
      alert(t('transfer.validAmountError') || 'Geçerli bir tutar giriniz.');
      return;
    }

    const cat = categories.find((c) => c.id === categoryId);

    setBudget({
      categoryId,
      categoryName: cat?.name || 'Kategori',
      limit: parsedLimit,
      upperLimit: parseNum(upperLimit),
      averageLimit: parseNum(averageLimit),
      lowerLimit: parseNum(lowerLimit),
    });

    closeBudgetModal();
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20';
  const labelClass = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1';

  const renderTierInputs = (upper, setUpper, average, setAverage, lower, setLower) => (
    <div className="space-y-3 mt-3 pl-3 border-l-2 border-emerald-200 dark:border-emerald-800">
      <div>
        <label className={labelClass}>{t('budget.upperLimit')}</label>
        <input
          type="number"
          step="any"
          placeholder="10000"
          value={upper}
          onChange={(e) => setUpper(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>{t('budget.averageLimit')}</label>
        <input
          type="number"
          step="any"
          placeholder="7000"
          value={average}
          onChange={(e) => setAverage(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>{t('budget.lowerLimit')}</label>
        <input
          type="number"
          step="any"
          placeholder="3000"
          value={lower}
          onChange={(e) => setLower(e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isBudgetModalOpen}
      onClose={closeBudgetModal}
      title={editingBudget ? t('budget.editBudget') : t('budget.newBudget')}
      subtitle={t('budget.subtitle')}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Budget Type Toggle (only when adding new) */}
        {!editingBudget && (
          <div>
            <label className={labelClass}>{t('budget.budgetType')}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBudgetType('total')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  budgetType === 'total'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {t('budget.typeTotalBudget')}
              </button>
              <button
                type="button"
                onClick={() => setBudgetType('category')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  budgetType === 'category'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                {t('budget.typeCategoryBudget')}
              </button>
            </div>
          </div>
        )}

        {/* ---- TOTAL BUDGET MODE ---- */}
        {budgetType === 'total' && !editingBudget && (
          <>
            <div>
              <label className={labelClass}>{t('budget.totalBudget')}</label>
              <input
                type="number"
                step="any"
                placeholder={t('budget.totalBudgetPlaceholder')}
                value={totalBudgetAmount}
                onChange={(e) => setTotalBudgetAmount(e.target.value)}
                required
                className={`${inputClass} text-2xl font-bold`}
              />
            </div>

            {/* Tier toggle */}
            <button
              type="button"
              onClick={() => setShowTotalTiers(!showTotalTiers)}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              {showTotalTiers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showTotalTiers ? t('budget.hideTierLimits') : t('budget.showTierLimits')}
            </button>

            {showTotalTiers &&
              renderTierInputs(
                totalUpperLimit,
                setTotalUpperLimit,
                totalAverageLimit,
                setTotalAverageLimit,
                totalLowerLimit,
                setTotalLowerLimit
              )}
          </>
        )}

        {/* ---- CATEGORY BUDGET MODE ---- */}
        {(budgetType === 'category' || editingBudget) && (
          <>
            {/* Category */}
            <div>
              <label className={labelClass}>{t('budget.category')}</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={Boolean(editingBudget)}
                className={inputClass}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {getCategoryName(cat.id, cat.name)}
                  </option>
                ))}
              </select>
            </div>

            {/* Limit */}
            <div>
              <label className={labelClass}>{t('budget.monthlyLimit')}</label>
              <input
                type="number"
                step="any"
                placeholder="8000"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                required
                className={`${inputClass} text-2xl font-bold`}
              />
            </div>

            {/* Tier toggle */}
            <button
              type="button"
              onClick={() => setShowTiers(!showTiers)}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              {showTiers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showTiers ? t('budget.hideTierLimits') : t('budget.showTierLimits')}
            </button>

            {showTiers &&
              renderTierInputs(
                upperLimit,
                setUpperLimit,
                averageLimit,
                setAverageLimit,
                lowerLimit,
                setLowerLimit
              )}
          </>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="secondary" onClick={closeBudgetModal}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" className="font-bold">
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
