'use server';
/**
 * @fileOverview An AI flow to suggest a category for a financial transaction.
 *
 * - suggestCategory - A function that suggests a transaction category based on its description.
 * - SuggestCategoryInput - The input type for the suggestCategory function.
 * - SuggestCategoryOutput - The return type for the suggestCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Category } from '@/lib/types';
import { connectToDatabase } from '@/lib/db';

async function getCategories(): Promise<Category[]> {
    const { db } = await connectToDatabase();
    const categoriesFromDB = (await db.collection('transactions').distinct('category')) as Category[];
    const budgetCategoriesFromDB = (await db.collection('budgets').distinct('category')) as Category[];
    const staticCategories: Category[] = [
      'Groceries',
      'Rent',
      'Utilities',
      'Transport',
      'Entertainment',
      'Other',
    ];
    // Merge database categories with static fallback categories and ensure uniqueness
    const allCategories = [...new Set([...staticCategories, ...categoriesFromDB, ...budgetCategoriesFromDB])];
    return allCategories;
}

const SuggestCategoryInputSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters long.").describe('The description of the transaction.'),
});
export type SuggestCategoryInput = z.infer<typeof SuggestCategoryInputSchema>;

const SuggestCategoryOutputSchema = z.object({
  category: z.string().describe('The suggested category for the transaction.'),
});
export type SuggestCategoryOutput = z.infer<typeof SuggestCategoryOutputSchema>;

// This is the function the client component will call.
export async function suggestCategory(input: SuggestCategoryInput): Promise<SuggestCategoryOutput> {
  const parsedInput = SuggestCategoryInputSchema.safeParse(input);
  if (!parsedInput.success) {
    throw new Error(parsedInput.error.errors[0].message);
  }
  return suggestCategoryFlow(input);
}

const suggestCategoryFlow = ai.defineFlow(
  {
    name: 'suggestCategoryFlow',
    inputSchema: SuggestCategoryInputSchema,
    outputSchema: SuggestCategoryOutputSchema,
  },
  async (input) => {
    const allCategories = await getCategories();

    const prompt = ai.definePrompt({
        name: 'suggestCategoryPrompt',
        input: { schema: SuggestCategoryInputSchema },
        output: { schema: SuggestCategoryOutputSchema },
        prompt: `You are an expert financial assistant. Your task is to categorize a transaction based on its description.
        
        Analyze the following transaction description:
        "{{{description}}}"

        Suggest the single most appropriate category from the following list:
        ${allCategories.join(', ')}

        Rules:
        - Respond with only the category name.
        - If the description does not clearly match any category, you MUST respond with "Other".
        - Do not add any extra text, explanation, or punctuation.
        `,
    });
    
    const { output } = await prompt(input);
    
    // Validate that the output is one of the available categories
    if (output && allCategories.includes(output.category)) {
      return output;
    }

    // Fallback if the model hallucinates a new category
    return { category: 'Other' };
  }
);
