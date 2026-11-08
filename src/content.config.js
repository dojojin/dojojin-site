import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIES } from './data/site.js';

// One review = src/content/reviews/<category>/<slug>.mdx (+ optional <slug>.shots.json)
const reviews = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/reviews' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(Object.keys(CATEGORIES)),
    date: z.coerce.date(),
    description: z.string(),
    lead: z.string(),
    kicker: z.string(),
    meta: z.string(),
    cover: z.string(),
    coverAlt: z.string(),
    sourceUrl: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { reviews };
