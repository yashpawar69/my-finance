"use client";

import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { Transaction, Category } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { getCategoryColor } from '@/lib/colors';

type CategoryPieChartProps = {
  transactions: Transaction[];
};

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

  const chartConfig = React.useMemo(() => {
    if (!categoryData.length) return {};
    return categoryData.reduce((acc, { name }) => {
      acc[name] = {
        label: name,
        color: getCategoryColor(name),
      };
      return acc;
    }, {} as ChartConfig);
  }, [categoryData]);

  if (categoryData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No data to display
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] flex items-center justify-center">
      <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full max-h-[300px]">
        <PieChart>
          <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            innerRadius={40}
            dataKey="value"
            nameKey="name"
            paddingAngle={2}
          >
            {categoryData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={`var(--color-${entry.name})`} />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
