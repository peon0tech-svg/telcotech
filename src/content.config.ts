import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const gazettesCollection = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/gazettes" }),
  schema: z.object({
    title: z.string(),
    id: z.string(),
    year: z.number().or(z.string()),
  }),
});

const actsCollection = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/acts" }),
  schema: z.object({
    title: z.string(),
    id: z.string(),
  }),
});

const regulationsCollection = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/regulations" }),
  schema: z.object({
    title: z.string(),
    id: z.string(),
  }),
});

export const collections = {
  'gazettes': gazettesCollection,
  'acts': actsCollection,
  'regulations': regulationsCollection,
};
