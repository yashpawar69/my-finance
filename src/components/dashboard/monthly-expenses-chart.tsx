"use client";

import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { format, startOfMonth } from 'date-fns';
import type { Transaction } from '@/lib/types';
import { ChartTooltipContent } from '@/components/ui/chart';

type MonthlyExpensesChartProps = {
  transactions: Transaction[];
};

export default function MonthlyExpensesChart({ transactions }: MonthlyExpensesChartProps) {
  const monthlyData = React.useMemo(() => {
    const data: { [key: string]: number } = {};
    
    transactions.forEach(t => {
      const month = format(startOfMonth(new Date(t.date)), 'MMM yyyy');
      if (!data[month]) {
        data[month] = 0;
      }
      data[month] += t.amount;
    });

    return Object.entries(data)
      .map(([name, expenses]) => ({ name, expenses }))
      .sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime())
      .map(d => ({...d, name: d.name.split(' ')[0]})); // just show month name
  }, [transactions]);
  
  if (monthlyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No data to display
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer>
        <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={<ChartTooltipContent />} 
          />
          <Legend />
          <Bar dataKey="expenses" fill="hsl(var(--primary))" name="Expenses" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
