"use client";

import React, { useState, useMemo, useTransition } from 'react';
import type { Transaction, Category, Budget } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, ReceiptText, TrendingUp, Tag, PlusCircle, Target } from '@/components/icons';
import SummaryCard from './summary-card';
import MonthlyExpensesChart from './monthly-expenses-chart';
import CategoryPieChart from './category-pie-chart';
import TransactionList from './transaction-list';
import { AddTransactionSheet } from './add-transaction-sheet';
import { SetBudgetDialog } from './set-budget-dialog';
import BudgetComparisonChart from './budget-comparison-chart';
import SpendingInsights from './spending-insights';
import { addTransaction, updateTransaction, deleteTransaction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

type DashboardClientProps = {
  initialTransactions: Transaction[];
  categories: Category[];
  initialBudgets: Budget[];
  currentMonth: number;
  currentYear: number;
};

export default function DashboardClient({ 
  initialTransactions: transactions, 
  categories,
  initialBudgets: budgets,
  currentMonth,
  currentYear
}: DashboardClientProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);


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
    startTransition(async () => {
      const result = await deleteTransaction(id);
      if (result.success) {
        toast({
          title: 'Transaction Deleted',
          description: 'The transaction has been successfully deleted.',
        });
      } else {
        toast({
          title: 'Error Deleting',
          description: result.error || 'An unknown error occurred.',
          variant: 'destructive',
        });
      }
    });
  };
  
  const handleSaveTransaction = (data: Omit<Transaction, 'id'> & { id?: string }) => {
    startTransition(async () => {
      const { id, ...transactionData } = data;
      const isEditing = !!id;

      const result = isEditing 
        ? await updateTransaction(id, transactionData) 
        : await addTransaction(transactionData);

      if (result.success) {
        toast({
          title: `Transaction ${isEditing ? 'Updated' : 'Added'}`,
          description: `Successfully ${isEditing ? 'updated' : 'added'} transaction.`,
        });
        setIsSheetOpen(false);
      } else {
        toast({
          title: `Error ${isEditing ? 'Updating' : 'Adding'}`,
          description: result.error || 'An unknown error occurred.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-primary font-headline">My Finance</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsBudgetDialogOpen(true)} variant="outline">
                <Target className="w-4 h-4 mr-2" />
                Set Budgets
            </Button>
            <Button onClick={handleAddTransaction} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Transaction
            </Button>
          </div>
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

        <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Budget vs. Actual Spending (Current Month)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BudgetComparisonChart transactions={currentMonthTransactions} budgets={budgets} categories={categories} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Expenses (All Time)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MonthlyExpensesChart transactions={transactions} />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
                 <SpendingInsights transactions={currentMonthTransactions} budgets={budgets} categories={categories} />
                <Card>
                    <CardHeader>
                        <CardTitle>Category Breakdown (All Time)</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center pt-4">
                        <CategoryPieChart transactions={transactions} />
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="mt-6">
          <TransactionList 
            transactions={transactions} 
            onEdit={handleEditTransaction} 
            onDelete={handleDeleteTransaction}
            isPending={isPending}
          />
        </div>
      </main>

       <AddTransactionSheet
        isOpen={isSheetOpen}
        setIsOpen={setIsSheetOpen}
        categories={categories}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
        isPending={isPending}
      />
      <SetBudgetDialog
        isOpen={isBudgetDialogOpen}
        setIsOpen={setIsBudgetDialogOpen}
        categories={categories}
        currentBudgets={budgets}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />
    </div>
  );
}
