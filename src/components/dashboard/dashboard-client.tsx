"use client";

import React, { useState, useMemo, useTransition, useEffect } from 'react';
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
import { addTransaction, updateTransaction, deleteTransaction, getBudgetsForMonth } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  initialBudgets,
  currentMonth,
  currentYear
}: DashboardClientProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState('all');
  const [monthlyExpenseYear, setMonthlyExpenseYear] = useState('all');
  const [monthlyExpenseMonth, setMonthlyExpenseMonth] = useState('all');
  
  const [budgetChartYear, setBudgetChartYear] = useState(String(currentYear));
  const [budgetChartMonth, setBudgetChartMonth] = useState(String(currentMonth));
  const [displayBudgets, setDisplayBudgets] = useState<Budget[]>(initialBudgets);


  const months = useMemo(() => [
    { value: 'all', label: 'All Months' },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: String(i),
      label: new Date(0, i).toLocaleString('default', { month: 'long' }),
    })),
  ], []);

  const budgetMonths = useMemo(() => months.filter(m => m.value !== 'all'), [months]);

  const availableYears = useMemo(() => {
    if (transactions.length === 0) {
      return ['all', String(new Date().getFullYear())];
    }
    const years = [...new Set(transactions.map((t) => new Date(t.date).getFullYear()))];
    years.sort((a, b) => b - a);
    return ['all', ...years.map(String)];
  }, [transactions]);
  
  const budgetYears = useMemo(() => availableYears.filter(y => y !== 'all'), [availableYears]);

  useEffect(() => {
    const year = parseInt(budgetChartYear);
    const month = parseInt(budgetChartMonth);

    if (year === currentYear && month === currentMonth) {
      setDisplayBudgets(initialBudgets);
      return;
    }
    
    startTransition(async () => {
      const newBudgets = await getBudgetsForMonth(month, year);
      setDisplayBudgets(newBudgets);
    });
  }, [budgetChartYear, budgetChartMonth, currentYear, currentMonth, initialBudgets]);
  
  const budgetChartTransactions = useMemo(() => {
    const year = parseInt(budgetChartYear, 10);
    const month = parseInt(budgetChartMonth, 10);
    return transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
    });
  }, [transactions, budgetChartMonth, budgetChartYear]);

  const pieChartTransactions = useMemo(() => {
    if (selectedYear === 'all') {
      return transactions;
    }
    const year = parseInt(selectedYear, 10);
    return transactions.filter((t) => new Date(t.date).getFullYear() === year);
  }, [transactions, selectedYear]);

  const monthlyExpensesChartTransactions = useMemo(() => {
    let filtered = transactions;
    if (monthlyExpenseYear !== 'all') {
        const year = parseInt(monthlyExpenseYear, 10);
        filtered = filtered.filter((t) => new Date(t.date).getFullYear() === year);
    }
    if (monthlyExpenseMonth !== 'all' && monthlyExpenseYear !== 'all') {
        const month = parseInt(monthlyExpenseMonth, 10);
        filtered = filtered.filter((t) => new Date(t.date).getMonth() === month);
    }
    return filtered;
  }, [transactions, monthlyExpenseYear, monthlyExpenseMonth]);

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
                    <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
                        <CardTitle className="text-lg font-medium">Budget vs. Actual Spending</CardTitle>
                        <div className="flex items-center gap-2">
                            <Select value={budgetChartMonth} onValueChange={setBudgetChartMonth}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {budgetMonths.map((month) => (
                                        <SelectItem key={month.value} value={month.value}>
                                            {month.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={budgetChartYear} onValueChange={setBudgetChartYear}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(budgetYears.length > 0 ? budgetYears : [String(currentYear)]).map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <BudgetComparisonChart transactions={budgetChartTransactions} budgets={displayBudgets} categories={categories} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
                        <CardTitle className="text-lg font-medium">Monthly Expenses</CardTitle>
                         <div className="flex items-center gap-2">
                            <Select value={monthlyExpenseMonth} onValueChange={setMonthlyExpenseMonth} disabled={monthlyExpenseYear === 'all'}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((month) => (
                                        <SelectItem key={month.value} value={month.value}>
                                            {month.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={monthlyExpenseYear} onValueChange={(year) => {
                                setMonthlyExpenseYear(year);
                                if (year === 'all') {
                                    setMonthlyExpenseMonth('all');
                                }
                            }}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableYears.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year === 'all' ? 'All Time' : year}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                       <MonthlyExpensesChart 
                            transactions={monthlyExpensesChartTransactions} 
                            groupBy={monthlyExpenseMonth !== 'all' && monthlyExpenseYear !== 'all' ? 'day' : 'month'}
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
                 <SpendingInsights transactions={budgetChartTransactions} budgets={displayBudgets} categories={categories} />
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
                        <CardTitle className="text-lg font-medium">Category Breakdown</CardTitle>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                             {availableYears.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year === 'all' ? 'All Time' : year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center pt-4">
                        <CategoryPieChart transactions={pieChartTransactions} />
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
        currentBudgets={displayBudgets}
        currentMonth={parseInt(budgetChartMonth, 10)}
        currentYear={parseInt(budgetChartYear, 10)}
      />
    </div>
  );
}
