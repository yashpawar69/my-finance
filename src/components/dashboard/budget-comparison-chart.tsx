"use client";

import React from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import type { Transaction, Budget, Category } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

type BudgetComparisonChartProps = {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
};

const chartConfig = {
  budget: {
    label: 'Budget',
    color: 'hsl(204, 100%, 75%)',
  },
  actual: {
    label: 'Actual Spent',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function BudgetComparisonChart({ transactions, budgets, categories }: BudgetComparisonChartProps) {
  const comparisonData = React.useMemo(() => {
    const dataMap = new Map<Category, { budget: number; actual: number }>();

    categories.forEach(cat => {
      dataMap.set(cat, { budget: 0, actual: 0 });
    });

    budgets.forEach(b => {
      if (dataMap.has(b.category)) {
        dataMap.get(b.category)!.budget = b.limitAmount;
      }
    });

    transactions.forEach(t => {
      if (dataMap.has(t.category)) {
        dataMap.get(t.category)!.actual += t.amount;
      }
    });
    
    return Array.from(dataMap.entries())
      .map(([name, values]) => ({ name, ...values }))
      .filter(d => d.budget > 0 || d.actual > 0);
  }, [transactions, budgets, categories]);

  if (comparisonData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No budget or spending data to display for this month.
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
       <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={chartConfig}>
          <BarChart data={comparisonData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
            <Tooltip 
              cursor={{ fill: 'hsl(var(--muted))' }}
              content={<ChartTooltipContent />} 
            />
            <Legend />
            <Bar dataKey="budget" fill="var(--color-budget)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" fill="var(--color-actual)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
}
