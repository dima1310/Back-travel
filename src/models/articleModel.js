const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const articleSchema = new Schema({
    title: { type: String, required: true },
    summary: { type: String },
    content: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: { type: Date, default: Date.now },
    tags: [{ type: String }],
}, { timestamps: true });

module.exports = model('Article', articleSchema); 
