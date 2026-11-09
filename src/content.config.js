import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { TOPICS, TYPES, TAGS } from './data/site.js';

// One post = src/content/posts/<type>/<slug>.mdx  (type folder must match the `type` field) (+ optional <slug>.shots.json / .spec.json)
const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    topic: z.enum(Object.keys(TOPICS)),
    type: z.enum(Object.keys(TYPES)),
    tags: z.array(z.enum(Object.keys(TAGS))).default([]),
    date: z.coerce.date(),
    reading: z.string().optional(), // e.g. "20.35V · 4.52A · 91.9W" — measured, shown on the post card
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

// One project = src/content/projects/<slug>.mdx → /projects/<slug>/ (no external docs links: everything lives here)
const projects = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    status: z.enum(['LIVE', 'BETA', 'INTERNAL', 'PAUSED']),
    summary: z.string(),          // one or two sentences, shown on cards and as the page lead
    order: z.number(),            // position in the projects menu
    icon: z.string().optional(),
    facts: z.array(z.tuple([z.string(), z.string()])).default([]), // short label/value pairs for the side box
  }),
});

export const collections = { posts, projects };
