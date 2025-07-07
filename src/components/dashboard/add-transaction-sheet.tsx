"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Transaction, Category, TransactionInput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Sparkles } from '@/components/icons';
import { suggestCategory } from '@/ai/flows/categorize-transaction-flow';
import { toast } from 'sonner';

const getTransactionSchema = (categories: Category[]) => z.object({
  description: z.string().min(1, "Description is required."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  date: z.date({ required_error: "A date is required." }),
  category: z.string({ required_error: "Please select a category." }).min(1, "Category is required."),
});

type AddTransactionSheetProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  categories: Category[];
  transaction?: Transaction;
  onSave: (data: TransactionInput & { id?: string }) => void;
  isPending?: boolean;
};

export function AddTransactionSheet({
  isOpen,
  setIsOpen,
  categories,
  transaction,
  onSave,
  isPending,
}: AddTransactionSheetProps) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const transactionSchema = getTransactionSchema(categories);

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      amount: 0,
      date: new Date(),
      category: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        form.reset({
          description: transaction.description,
          amount: transaction.amount,
          date: new Date(transaction.date),
          category: transaction.category,
        });
      } else {
        form.reset({
          description: '',
          amount: 0,
          date: new Date(),
          category: undefined,
        });
      }
    }
  }, [transaction, isOpen, form]);

  const onSubmit = (data: z.infer<typeof transactionSchema>) => {
    onSave({ ...data, id: transaction?.id });
  };

  const handleSuggestCategory = async () => {
    const description = form.getValues('description');
    if (!description || description.length < 3) {
      toast.info('Suggestion requires a description', {
        description: 'Please enter a description of at least 3 characters.',
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const result = await suggestCategory({ description });
      if (result.category) {
        form.setValue('category', result.category, { shouldValidate: true });
        toast.success('Category Suggested!', {
          description: `We've set the category to "${result.category}".`,
        });
      }
    } catch (error) {
      console.error('Error suggesting category:', error);
      toast.error('Suggestion Failed', {
        description: 'Could not get an AI suggestion. Please select a category manually.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{transaction ? 'Edit Transaction' : 'Add New Transaction'}</SheetTitle>
          <SheetDescription>
            {transaction ? 'Update the details of your transaction.' : 'Fill in the details for your new transaction.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Weekly groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                     <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                      <Input type="number" placeholder="0.00" className="pl-7" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Category</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSuggestCategory}
                      disabled={isSuggesting || isPending}
                      className="text-xs h-7"
                    >
                      <Sparkles className="w-3 h-3 mr-2" />
                      {isSuggesting ? 'Suggesting...' : 'Suggest'}
                    </Button>
                  </div>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Transaction'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
