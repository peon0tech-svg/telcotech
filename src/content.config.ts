import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const gazettesCollection = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/gazettes" }),
  schema: z.object({
    title: z.string(),
    id: z.string(),
  }),
});

export const collections = {
  'gazettes': gazettesCollection,
};
