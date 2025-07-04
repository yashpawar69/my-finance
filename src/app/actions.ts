'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import type { Transaction } from '@/lib/types';
import { ObjectId } from 'mongodb';

type NewTransaction = Omit<Transaction, 'id'>;

export async function addTransaction(transaction: NewTransaction) {
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

export async function updateTransaction(id: string, transactionData: NewTransaction) {
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
