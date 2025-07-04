"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import type { Transaction } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MoreVertical, Pencil, Trash2 } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';

type TransactionListProps = {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
};

export default function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const openDeleteDialog = (id: string) => {
    setTransactionToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (transactionToDelete) {
      onDelete(transactionToDelete);
      toast({
        title: 'Transaction Deleted',
        description: 'The transaction has been successfully deleted.',
      });
    }
    setIsAlertOpen(false);
    setTransactionToDelete(null);
  };

  const sortedTransactions = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length > 0 ? (
              sortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{format(new Date(transaction.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell className="text-right">
                    {transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(transaction)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => openDeleteDialog(transaction.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No transactions yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
