"use client";

import React, { useState, useMemo } from 'react';
import type { Transaction, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, ReceiptText, TrendingUp, Tag, PlusCircle } from '@/components/icons';
import SummaryCard from './summary-card';
import MonthlyExpensesChart from './monthly-expenses-chart';
import CategoryPieChart from './category-pie-chart';
import TransactionList from './transaction-list';
import { AddTransactionSheet } from './add-transaction-sheet';

type DashboardClientProps = {
  initialTransactions: Transaction[];
  categories: Category[];
};

export default function DashboardClient({ initialTransactions, categories }: DashboardClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);

  const summary = useMemo(() => {
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalTransactions = transactions.length;
    const averageTransaction = totalTransactions > 0 ? totalExpenses / totalTransactions : 0;
    
    const categoryCounts = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<Category, number>);

    const mostFrequentCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalExpenses,
      totalTransactions,
      averageTransaction,
      mostFrequentCategory,
    };
  }, [transactions]);

  const handleAddTransaction = () => {
    setEditingTransaction(undefined);
    setIsSheetOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsSheetOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };
  
  const handleSaveTransaction = (transaction: Omit<Transaction, 'id'> & { id?: string }) => {
    if (transaction.id) {
      // Edit existing
      setTransactions(transactions.map(t => t.id === transaction.id ? { ...t, ...transaction } : t));
    } else {
      // Add new
      setTransactions([...transactions, { ...transaction, id: new Date().toISOString() }]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold text-primary font-headline">FinTrack MVP</h1>
          <Button onClick={handleAddTransaction} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard 
            title="Total Expenses" 
            value={summary.totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            icon={Landmark}
          />
          <SummaryCard 
            title="Total Transactions" 
            value={summary.totalTransactions.toString()}
            icon={ReceiptText}
          />
          <SummaryCard 
            title="Average Transaction" 
            value={summary.averageTransaction.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            icon={TrendingUp}
          />
           <SummaryCard 
            title="Top Category" 
            value={summary.mostFrequentCategory}
            icon={Tag}
          />
        </div>

        <div className="grid gap-6 mt-6 md:grid-cols-5">
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Monthly Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyExpensesChart transactions={transactions} />
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryPieChart transactions={transactions} />
              </CardContent>
            </Card>
        </div>

        <div className="mt-6">
          <TransactionList 
            transactions={transactions} 
            onEdit={handleEditTransaction} 
            onDelete={handleDeleteTransaction}
          />
        </div>
      </main>

       <AddTransactionSheet
        isOpen={isSheetOpen}
        setIsOpen={setIsSheetOpen}
        categories={categories}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
      />
    </div>
  );
}
