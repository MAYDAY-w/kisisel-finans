import React from 'react';
import { SummaryCards } from './SummaryCards';
import { DashboardQuickWidgets } from './DashboardQuickWidgets';
import { ExpenseCategoryChart } from './ExpenseCategoryChart';
import { MonthlyComparisonChart } from './MonthlyComparisonChart';
import { RecentTransactions } from './RecentTransactions';

export function DashboardView() {
  return (
    <div className="space-y-6 pb-20">
      {/* Top Financial Summary Cards */}
      <SummaryCards />

      {/* Quick Action Widgets (Accounts, Budget, AI Coach) */}
      <DashboardQuickWidgets />

      {/* 2 Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExpenseCategoryChart />
        <MonthlyComparisonChart />
      </div>

      {/* Recent Transactions Feed */}
      <RecentTransactions />
    </div>
  );
}
