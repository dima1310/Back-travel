import mongoose from "mongoose";

const { Schema, model } = mongoose;

const articleSchema = new Schema(
  {
    img: { type: String, required: true },
    title: { type: String, required: true },
    article: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "categories", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    favoriteCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model("Article", articleSchema, "travellers");
