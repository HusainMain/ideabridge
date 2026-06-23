import { z } from 'zod';

export const analysisSchema = z.object({
  idea: z.string().min(10).max(500),
  industry: z.string().min(1).max(100),
  audience: z.string().min(1).max(200),
  problem: z.string().min(1).max(300),
  country: z.string().min(1).max(100),
  budget: z.string().min(1).max(100),
  teamSize: z.string().min(1).max(100),
});
