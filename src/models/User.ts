import mongoose, { InferSchemaType } from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false }
}, { timestamps: true });

export type UserDocument = InferSchemaType<typeof userSchema> & mongoose.Document;
export const User = mongoose.model('User', userSchema);
