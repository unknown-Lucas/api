/* eslint linebreak-style: ["error", "unix"] */
import { Schema, model } from 'mongoose';

const ChapterSchema = new Schema({
  _id: { type: Number },
  chapter_id: { type: Number },
  chapter: { type: Object }
});

export const ChapterModel = model('capitulos', ChapterSchema);
