import DashboardClient from '@/components/dashboard/dashboard-client';
import { transactions, categories } from '@/lib/data';

export default function Home() {
  // In a real application, this data would be fetched from a database.
  // We pass it to a client component to manage state for this demo.
  return <DashboardClient initialTransactions={transactions} categories={categories} />;
}
