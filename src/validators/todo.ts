import { z } from 'zod';

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD');
export const createTodoSchema = z.object({
  title: z.string().trim().min(1, 'Todo title is required').max(120),
  dueDate: dateOnly.optional()
});
export const updateTodoSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  completed: z.boolean().optional(),
  dueDate: dateOnly.optional()
}).refine((value) => Object.keys(value).length > 0, 'At least one field is required');

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
