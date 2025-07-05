"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Transaction, Budget, Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getCategoryColor } from '@/lib/colors';

type SpendingInsightsProps = {
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
};

export default function SpendingInsights({ transactions, budgets, categories }: SpendingInsightsProps) {
  const insightsData = React.useMemo(() => {
    const dataMap = new Map<Category, { budget: number; actual: number }>();

    budgets.forEach(b => {
      dataMap.set(b.category, { budget: b.limitAmount, actual: 0 });
    });

    transactions.forEach(t => {
      if (dataMap.has(t.category)) {
        dataMap.get(t.category)!.actual += t.amount;
      }
    });

    return Array.from(dataMap.entries())
      .map(([name, values]) => ({
        name,
        ...values,
        percentage: values.budget > 0 ? Math.min((values.actual / values.budget) * 100, 100) : 0,
        overBudget: values.budget > 0 ? values.actual > values.budget : false,
      }))
      .filter(d => d.budget > 0);
  }, [transactions, budgets]);

  if (insightsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-full text-muted-foreground py-10">
            Set a budget to see insights.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insightsData.map(item => (
          <div key={item.name}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-sm text-muted-foreground">
                {item.actual.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} / {item.budget.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </span>
            </div>
            <Progress
              value={item.percentage}
              className={cn(
                "h-2",
                !item.overBudget && "[&>div]:bg-[--category-color]",
                item.overBudget && "[&>div]:bg-destructive"
              )}
              style={{ '--category-color': getCategoryColor(item.name) } as React.CSSProperties}
            />
            <p className={cn(
                "text-xs mt-1",
                item.overBudget ? "text-destructive" : "text-muted-foreground"
            )}>
              {item.overBudget 
                ? `You've exceeded your budget for ${item.name}.`
                : "You are on track this month."
              }
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
