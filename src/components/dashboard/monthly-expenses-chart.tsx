"use client";

import React from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { format, startOfMonth } from 'date-fns';
import type { Transaction } from '@/lib/types';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

type MonthlyExpensesChartProps = {
  transactions: Transaction[];
  groupBy?: 'month' | 'day';
};

const chartConfig = {
  expenses: {
    label: 'Expenses',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function MonthlyExpensesChart({ transactions, groupBy = 'month' }: MonthlyExpensesChartProps) {
  const chartData = React.useMemo(() => {
    const data: { [key: string]: { date: Date, expenses: number } } = {};
    const isDaily = groupBy === 'day' && transactions.length > 0;
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = isDaily 
        ? format(date, 'yyyy-MM-dd') 
        : format(startOfMonth(date), 'yyyy-MM');
      
      if (!data[key]) {
        data[key] = { date: isDaily ? date : startOfMonth(date), expenses: 0 };
      }
      data[key].expenses += t.amount;
    });

    return Object.values(data)
      .sort((a,b) => a.date.getTime() - b.date.getTime())
      .map(d => ({
          name: isDaily ? format(d.date, 'MMM d') : format(d.date, 'MMM'),
          expenses: d.expenses 
      }));
  }, [transactions, groupBy]);
  
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No data to display
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={<ChartTooltipContent hideLabel />} 
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
