"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Transaction, Category } from '@/lib/types';
import { ChartTooltipContent } from '@/components/ui/chart';

type CategoryPieChartProps = {
  transactions: Transaction[];
};

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(240, 5.9%, 10%)',
];

export default function CategoryPieChart({ transactions }: CategoryPieChartProps) {
  const categoryData = React.useMemo(() => {
    const data: { [key in Category]?: number } = {};
    
    transactions.forEach(t => {
      if (!data[t.category]) {
        data[t.category] = 0;
      }
      data[t.category]! += t.amount;
    });

    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  if (categoryData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No data to display
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Tooltip content={<ChartTooltipContent />} />
          <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={10} />
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={110}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            paddingAngle={2}
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
