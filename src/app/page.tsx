import DashboardClient from '@/components/dashboard/dashboard-client';
import { connectToDatabase } from '@/lib/db';
import type { Transaction, Category } from '@/lib/types';

async function getTransactions(): Promise<Transaction[]> {
  const { db } = await connectToDatabase();
  const transactionsFromDB = await db
    .collection('transactions')
    .find({})
    .sort({ date: -1 })
    .toArray();
  
  return transactionsFromDB.map((t) => ({
    id: t._id.toString(),
    date: t.date,
    description: t.description,
    amount: t.amount,
    category: t.category,
  }));
}

async function getCategories(): Promise<Category[]> {
    const { db } = await connectToDatabase();
    const categoriesFromDB = (await db.collection('transactions').distinct('category')) as Category[];
    const staticCategories: Category[] = [
      'Groceries',
      'Rent',
      'Utilities',
      'Transport',
      'Entertainment',
      'Other',
    ];
    // Merge database categories with static fallback categories and ensure uniqueness
    const allCategories = [...new Set([...staticCategories, ...categoriesFromDB])];
    return allCategories;
}

export default async function Home() {
  const transactions = await getTransactions();
  const categories = await getCategories();

  return <DashboardClient initialTransactions={transactions} categories={categories} />;
}
