import mongoose, { InferSchemaType } from 'mongoose';

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
  completed: { type: Boolean, default: false },
  dueDate: { type: String, match: /^\d{4}-\d{2}-\d{2}$/ },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

todoSchema.index({ userId: 1, dueDate: 1 });
todoSchema.index({ userId: 1, createdAt: -1 });

export type TodoDocument = InferSchemaType<typeof todoSchema> & mongoose.Document;
export const Todo = mongoose.model('Todo', todoSchema);
