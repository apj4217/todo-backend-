import { Response } from 'express';
import mongoose from 'mongoose';
import { Todo } from '../models/Todo.js';
import { ApiError } from '../utils/apiError.js';
import { AuthRequest } from '../middleware/auth.js';
import { CreateTodoInput, UpdateTodoInput } from '../validators/todo.js';

interface TodoLike {
  _id?: unknown;
  id?: string;
  title: string;
  completed: boolean;
  dueDate?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function ensureObjectId(id: string) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'Invalid todo id');
}

function serialize(todo: TodoLike) {
  return {
    id: todo.id ?? String(todo._id),
    title: todo.title,
    completed: todo.completed,
    dueDate: todo.dueDate,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt
  };
}

export async function listTodos(req: AuthRequest, res: Response) {
  const todos = await Todo.find({ userId: req.userId }).sort({ dueDate: 1, createdAt: -1 }).lean();
  return res.json({ success: true, todos: todos.map(serialize) });
}

export async function createTodo(req: AuthRequest, res: Response) {
  const body = req.body as CreateTodoInput;
  const todo = await Todo.create({ title: body.title, dueDate: body.dueDate, userId: req.userId });
  return res.status(201).json({ success: true, todo: serialize(todo) });
}

export async function updateTodo(req: AuthRequest, res: Response) {
  const id = req.params.id as string;
  ensureObjectId(id);
  const body = req.body as UpdateTodoInput;
  const todo = await Todo.findOneAndUpdate({ _id: id, userId: req.userId }, body, { new: true, runValidators: true });
  if (!todo) throw new ApiError(404, 'Todo not found');
  return res.json({ success: true, todo: serialize(todo) });
}

export async function deleteTodo(req: AuthRequest, res: Response) {
  const id = req.params.id as string;
  ensureObjectId(id);
  const todo = await Todo.findOneAndDelete({ _id: id, userId: req.userId });
  if (!todo) throw new ApiError(404, 'Todo not found');
  return res.json({ success: true });
}
