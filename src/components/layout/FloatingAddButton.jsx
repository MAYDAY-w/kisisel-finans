import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Plus } from 'lucide-react';

export function FloatingAddButton() {
  const {
    activeTab,
    openAddTransactionModal,
    openBudgetModal,
    openAddInvestmentModal,
    openDebtModal,
    openRecurringModal,
    openAccountModal,
    openTransferModal,
  } = useFinance();

  const handleClick = () => {
    switch (activeTab) {
      case 'budget':
        openBudgetModal();
        break;
      case 'investments':
        openAddInvestmentModal();
        break;
      case 'debts':
        openDebtModal();
        break;
      case 'recurring':
        openRecurringModal();
        break;
      case 'accounts':
        openAccountModal();
        break;
      case 'dashboard':
      case 'daily':
      case 'transactions':
      default:
        openAddTransactionModal();
        break;
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Hızlı İşlem Ekle"
      className="md:hidden fixed right-5 bottom-20 z-40 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl shadow-xl shadow-primary-600/40 flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary-500/30"
    >
      <Plus className="w-7 h-7 stroke-[2.5]" />
    </button>
  );
}
