import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Plus } from 'lucide-react';

export function FloatingAddButton() {
  const { openAddTransactionModal } = useFinance();

  return (
    <button
      onClick={() => openAddTransactionModal()}
      aria-label="Hızlı İşlem Ekle"
      className="md:hidden fixed right-5 bottom-20 z-40 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl shadow-emerald-600/40 flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
    >
      <Plus className="w-7 h-7 stroke-[2.5]" />
    </button>
  );
}
