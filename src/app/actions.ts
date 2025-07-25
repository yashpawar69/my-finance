'use server';

import 'dotenv/config';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import type { Transaction, Budget, TransactionInput } from '@/lib/types';
import { ObjectId } from 'mongodb';

export async function addTransaction(transaction: TransactionInput) {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('transactions').insertOne(transaction);
    revalidatePath('/');
    return { success: true, insertedId: result.insertedId.toString() };
  } catch (error) {
    console.error('Error adding transaction:', error);
    return { success: false, error: 'Failed to add transaction.' };
  }
}

export async function updateTransaction(id: string, transactionData: TransactionInput) {
    try {
        const { db } = await connectToDatabase();
        const result = await db.collection('transactions').updateOne(
            { _id: new ObjectId(id) },
            { $set: transactionData }
        );
        revalidatePath('/');
        if (result.matchedCount === 0) {
            return { success: false, error: 'Could not find transaction to update.' };
        }
        return { success: true };
    } catch (error) {
        console.error('Error updating transaction:', error);
        return { success: false, error: 'Failed to update transaction.' };
    }
}


export async function deleteTransaction(id: string) {
    try {
        const { db } = await connectToDatabase();
        const result = await db.collection('transactions').deleteOne({ _id: new ObjectId(id) });
        revalidatePath('/');
        if (result.deletedCount === 0) {
            return { success: false, error: 'Could not find transaction to delete.' };
        }
        return { success: true };
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return { success: false, error: 'Failed to delete transaction.' };
    }
}

export async function getBudgetsForMonth(month: number, year: number): Promise<Budget[]> {
  try {
    const { db } = await connectToDatabase();
    const budgetsFromDb = await db
      .collection('budgets')
      .find({ month, year })
      .toArray();

    return budgetsFromDb.map((b) => ({
      id: b._id.toString(),
      category: b.category,
      limitAmount: b.limitAmount,
      month: b.month,
      year: b.year,
    }));
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return [];
  }
}

export async function upsertBudget(budget: {
  category: string;
  limitAmount: number;
  month: number;
  year: number;
}) {
  try {
    const { db } = await connectToDatabase();
    
    const limitAmount = Number(budget.limitAmount);
    if (isNaN(limitAmount) || limitAmount < 0) {
        return { success: false, error: 'Invalid budget amount.' };
    }

    const result = await db.collection('budgets').updateOne(
      { category: budget.category, month: budget.month, year: budget.year },
      { $set: { limitAmount } },
      { upsert: true }
    );
    revalidatePath('/');
    return { success: true, result };
  } catch (error) {
    console.error('Error upserting budget:', error);
    return { success: false, error: 'Failed to save budget.' };
  }
}
