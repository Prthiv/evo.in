
'use server';

/**
 * @fileOverview A flow for generating poster descriptions using AI.
 *
 * - generatePosterDescription - A function that generates a product description for a poster.
 * - GeneratePosterDescriptionInput - The input type for the generatePosterDescription function.
 * - GeneratePosterDescriptionOutput - The return type for the generatePosterDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePosterDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the poster.'),
  category:
    z.string()
    .describe(
      'The category of the poster, e.g., EVO WALL POSTER & FRAMES, CAR FRAMES AND WALL POSTERS, ANIME FRAMES AND WALLPOSTERS, SUPERHERO FRAMES AND POSTERS.'
    ),
  keywords: z.string().describe('Keywords related to the poster.'),
  style: z.string().optional().describe('The style of the poster (e.g., modern, vintage, abstract).'),
});
export type GeneratePosterDescriptionInput = z.infer<
  typeof GeneratePosterDescriptionInputSchema
>;

const GeneratePosterDescriptionOutputSchema = z.object({
  description:
    z.string()
    .describe('A compelling product description for the poster.'),
});
export type GeneratePosterDescriptionOutput = z.infer<
  typeof GeneratePosterDescriptionOutputSchema
>;

export async function generatePosterDescription(
  input: GeneratePosterDescriptionInput
): Promise<GeneratePosterDescriptionOutput> {
  return generatePosterDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePosterDescriptionPrompt',
  input: {schema: GeneratePosterDescriptionInputSchema},
  output: {schema: GeneratePosterDescriptionOutputSchema},
  prompt: `You are an expert copywriter specializing in writing product descriptions for posters.

  Given the following information, write a compelling and engaging product description for the poster.

  Title: {{{title}}}
  Category: {{{category}}}
  Keywords: {{{keywords}}}
  Style: {{{style}}}

  Description:
  `,
});

const generatePosterDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePosterDescriptionFlow',
    inputSchema: GeneratePosterDescriptionInputSchema,
    outputSchema: GeneratePosterDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
