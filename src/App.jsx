import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
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
import { AddInvestmentBalanceModal } from './components/investments/AddInvestmentBalanceModal';
import { DailyDetailModal } from './components/daily/DailyDetailModal';
import { ReceiptViewerModal } from './components/common/ReceiptViewerModal';
import { AccountFormModal } from './components/accounts/AccountFormModal';
import { AccountDetailModal } from './components/accounts/AccountDetailModal';
import { TransferModal } from './components/accounts/TransferModal';
import { BudgetFormModal } from './components/budget/BudgetFormModal';
import { DebtFormModal } from './components/debts/DebtFormModal';
import { RecurringFormModal } from './components/recurring/RecurringFormModal';
import { SalaryModal } from './components/recurring/SalaryModal';
import { AiAdvisorModal } from './components/ai/AiAdvisorModal';
import { InstallAppModal } from './components/layout/InstallAppModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function MainLayout() {
  const { activeTab, viewingReceipt, closeReceiptViewer } = useFinance();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-primary-100 selection:text-primary-900">
      {/* Top Header */}
      <Header />

      {/* Auto-Processing System Notification Banner */}
      <AutoProcessBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-6">
        <ErrorBoundary>
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'daily' && <DailyView />}
          {activeTab === 'accounts' && <AccountList />}
          {activeTab === 'budget' && <BudgetView />}
          {activeTab === 'transactions' && <TransactionList />}
          {activeTab === 'investments' && <InvestmentList />}
          {activeTab === 'debts' && <DebtView />}
          {activeTab === 'recurring' && <RecurringView />}
          {activeTab === 'settings' && <SettingsView />}
        </ErrorBoundary>
      </main>

      {/* Floating Action Button for Quick Add */}
      <FloatingAddButton />

      {/* Bottom Navigation for Mobile */}
      <BottomNav />

      {/* Global Modals */}
      <TransactionFormModal />
      <InvestmentFormModal />
      <UpdatePriceModal />
      <AddInvestmentBalanceModal />
      <DailyDetailModal />
      <ReceiptViewerModal
        isOpen={Boolean(viewingReceipt)}
        onClose={closeReceiptViewer}
        receipt={viewingReceipt}
      />
      <AccountFormModal />
      <AccountDetailModal />
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

import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthView } from './components/auth/AuthView';

function AuthWrapper({ children }) {
  const { user, loading } = useAuth();
  const [skipAuth, setSkipAuth] = React.useState(() => localStorage.getItem('finans_skip_auth') === 'true');

  const handleSkip = () => {
    localStorage.setItem('finans_skip_auth', 'true');
    setSkipAuth(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && !skipAuth) {
    return <AuthView onContinueOffline={handleSkip} />;
  }

  return children;
}

import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <FinanceProvider>
            <AuthWrapper>
              <MainLayout />
            </AuthWrapper>
          </FinanceProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
