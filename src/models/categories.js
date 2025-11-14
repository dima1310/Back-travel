import { model, Schema } from 'mongoose';

const categoriesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { versionKey: false },
);

export const CategoriesCollection = model(
  'categories',
  categoriesSchema,
  'travellers.categories',
);
