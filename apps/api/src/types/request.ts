import { z } from 'zod';


export const PaginationOptionsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export type PaginationOptions = z.infer<typeof PaginationOptionsSchema>;
