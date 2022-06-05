/* eslint linebreak-style: ["error", "unix"] */
import { Schema, createConnection, model } from 'mongoose';

const UserSchema = new Schema({
  _id: { type: Number },
  usuario: { type: String },
  contraseña: { type: String },
  email: {type: String},
  favs: {type: Array},
  tipo: { type: String },
});

export const UserModel = model('users', UserSchema);