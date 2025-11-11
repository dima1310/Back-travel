import { Schema, model } from 'mongoose';

const seedUserSchema = new Schema(
  {
    name: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    articlesAmount: { type: Number, default: 0 },
  },
  { versionKey: false, timestamps: false },
);

export const SeedUser = model('seed_users', seedUserSchema, 'travellers.users');
