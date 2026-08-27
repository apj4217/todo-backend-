import { Router } from 'express';
import { createTodo, deleteTodo, listTodos, updateTodo } from '../controllers/todoController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTodoSchema, updateTodoSchema } from '../validators/todo.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const todoRouter = Router();

todoRouter.use(requireAuth);
todoRouter.get('/', asyncHandler(listTodos));
todoRouter.post('/', validate(createTodoSchema), asyncHandler(createTodo));
todoRouter.patch('/:id', validate(updateTodoSchema), asyncHandler(updateTodo));
todoRouter.delete('/:id', asyncHandler(deleteTodo));
