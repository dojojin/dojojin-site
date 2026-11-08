import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { TOPICS, TYPES } from './data/site.js';

// One post = src/content/posts/<type>/<slug>.mdx  (type folder must match the `type` field) (+ optional <slug>.shots.json / .spec.json)
const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    topic: z.enum(Object.keys(TOPICS)),
    type: z.enum(Object.keys(TYPES)),
    tags: z.array(z.string()).default([]),
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

export const collections = { posts };
