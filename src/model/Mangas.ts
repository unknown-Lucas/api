/* eslint linebreak-style: ["error", "unix"] */
import { Schema, createConnection, model } from 'mongoose';

const MangaSchema = new Schema({
  _id: { type: Number },
  Datos: { type: Object },
  Personal: { type: Object },
  Tags: { type: Array },
  tipo: { type: String },
  apiID: { type: String },
});

export const MangaModel = model('mangas', MangaSchema);