"use client";

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Category, Budget } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { upsertBudget } from '@/app/actions';

const budgetFormSchema = z.object({
  budgets: z.array(z.object({
    category: z.string(),
    limitAmount: z.coerce.number().min(0, "Budget must be a positive number.").optional(),
  })),
});

type SetBudgetDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  categories: Category[];
  currentBudgets: Budget[];
  currentMonth: number;
  currentYear: number;
};

export function SetBudgetDialog({
  isOpen,
  setIsOpen,
  categories,
  currentBudgets,
  currentMonth,
  currentYear,
}: SetBudgetDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();

  const defaultValues = React.useMemo(() => {
    return categories.map(category => {
      const existingBudget = currentBudgets.find(b => b.category === category);
      return {
        category,
        limitAmount: existingBudget?.limitAmount,
      };
    });
  }, [categories, currentBudgets]);

  const form = useForm<z.infer<typeof budgetFormSchema>>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      budgets: defaultValues,
    },
  });
  
  React.useEffect(() => {
    if(isOpen) {
        form.reset({ budgets: defaultValues });
    }
  }, [isOpen, form, defaultValues]);

  const { fields } = useFieldArray({
    control: form.control,
    name: "budgets",
  });

  const onSubmit = (data: z.infer<typeof budgetFormSchema>) => {
    startTransition(async () => {
      let success = true;
      for (const budget of data.budgets) {
        if (budget.limitAmount !== undefined && budget.limitAmount >= 0) {
          const result = await upsertBudget({
            category: budget.category,
            limitAmount: budget.limitAmount,
            month: currentMonth,
            year: currentYear,
          });
          if (!result.success) {
            success = false;
            toast({
              title: `Error setting budget for ${budget.category}`,
              description: result.error || 'An unknown error occurred.',
              variant: 'destructive',
            });
            break; 
          }
        }
      }

      if (success) {
        toast({
          title: 'Budgets Saved',
          description: 'Your monthly budgets have been updated.',
        });
        setIsOpen(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Monthly Budgets</DialogTitle>
          <DialogDescription>
            Set your budget limits for each category for the current month.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`budgets.${index}.limitAmount`}
                render={({ field: formField }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{form.getValues(`budgets.${index}.category`)}</span>
                      <FormControl>
                        <div className="relative w-32">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                          <Input type="number" placeholder="e.g., 500" className="pl-7" {...formField} value={formField.value ?? ''} />
                        </div>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <DialogFooter className="pt-4 sticky bottom-0 bg-background">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Budgets'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
