import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { FloatingAddButton } from './components/layout/FloatingAddButton';
import { AutoProcessBanner } from './components/common/AutoProcessBanner';
import { DashboardView } from './components/dashboard/DashboardView';
import { DailyView } from './components/daily/DailyView';
import { AccountList } from './components/accounts/AccountList';
import { BudgetView } from './components/budget/BudgetView';
import { TransactionList } from './components/transactions/TransactionList';
import { InvestmentList } from './components/investments/InvestmentList';
import { DebtView } from './components/debts/DebtView';
import { RecurringView } from './components/recurring/RecurringView';
import { SettingsView } from './components/settings/SettingsView';

// Modals
import { TransactionFormModal } from './components/transactions/TransactionFormModal';
import { InvestmentFormModal } from './components/investments/InvestmentFormModal';
import { UpdatePriceModal } from './components/investments/UpdatePriceModal';
import { DailyDetailModal } from './components/daily/DailyDetailModal';
import { ReceiptViewerModal } from './components/common/ReceiptViewerModal';
import { AccountFormModal } from './components/accounts/AccountFormModal';
import { TransferModal } from './components/accounts/TransferModal';
import { BudgetFormModal } from './components/budget/BudgetFormModal';
import { DebtFormModal } from './components/debts/DebtFormModal';
import { RecurringFormModal } from './components/recurring/RecurringFormModal';
import { SalaryModal } from './components/recurring/SalaryModal';
import { AiAdvisorModal } from './components/ai/AiAdvisorModal';
import { InstallAppModal } from './components/layout/InstallAppModal';

function MainLayout() {
  const { activeTab, viewingReceipt, closeReceiptViewer } = useFinance();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <Header />

      {/* Auto-Processing System Notification Banner */}
      <AutoProcessBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'daily' && <DailyView />}
        {activeTab === 'accounts' && <AccountList />}
        {activeTab === 'budget' && <BudgetView />}
        {activeTab === 'transactions' && <TransactionList />}
        {activeTab === 'investments' && <InvestmentList />}
        {activeTab === 'debts' && <DebtView />}
        {activeTab === 'recurring' && <RecurringView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Floating Action Button for Quick Add */}
      <FloatingAddButton />

      {/* Bottom Navigation for Mobile */}
      <BottomNav />

      {/* Global Modals */}
      <TransactionFormModal />
      <InvestmentFormModal />
      <UpdatePriceModal />
      <DailyDetailModal />
      <ReceiptViewerModal
        isOpen={Boolean(viewingReceipt)}
        onClose={closeReceiptViewer}
        receipt={viewingReceipt}
      />
      <AccountFormModal />
      <TransferModal />
      <BudgetFormModal />
      <DebtFormModal />
      <RecurringFormModal />
      <SalaryModal />
      <AiAdvisorModal />
      <InstallAppModal />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <MainLayout />
    </FinanceProvider>
  );
}
