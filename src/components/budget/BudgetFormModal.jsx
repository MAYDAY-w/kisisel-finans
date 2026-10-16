import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export function BudgetFormModal() {
  const { isBudgetModalOpen, closeBudgetModal, editingBudget, setBudget, categories, t, getCategoryName } = useFinance();

  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'food');
  const [limit, setLimit] = useState('');

  useEffect(() => {
    if (isBudgetModalOpen) {
      if (editingBudget) {
        setCategoryId(editingBudget.categoryId || categories[0]?.id || 'food');
        setLimit(editingBudget.limit ? String(editingBudget.limit) : '');
      } else {
        setCategoryId(categories[0]?.id || 'food');
        setLimit('');
      }
    }
  }, [isBudgetModalOpen, editingBudget, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedLimit = parseFloat(limit.replace(',', '.'));
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      alert(t('transfer.validAmountError') || 'Geçerli bir tutar giriniz.');
      return;
    }

    const cat = categories.find((c) => c.id === categoryId);

    setBudget({
      categoryId,
      categoryName: cat?.name || 'Kategori',
      limit: parsedLimit,
    });

    closeBudgetModal();
  };

  return (
    <Modal
      isOpen={isBudgetModalOpen}
      onClose={closeBudgetModal}
      title={editingBudget ? t('budget.editBudget') : t('budget.newBudget')}
      subtitle={t('budget.subtitle')}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {t('budget.category')}
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={Boolean(editingBudget)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
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
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {t('budget.monthlyLimit')}
          </label>
          <input
            type="number"
            step="any"
            placeholder="8000"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            required
            className="w-full text-2xl font-bold px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
          />
        </div>

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
