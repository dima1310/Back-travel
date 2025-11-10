import mongoose from "mongoose";

const { Schema, model } = mongoose;

const storySchema = new Schema(
  {
    img: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "categories", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    favoriteCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default model("story", storySchema, "travellers.travellers");
