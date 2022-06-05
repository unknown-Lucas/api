"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
/* eslint linebreak-style: ["error", "unix"] */
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    _id: { type: Number },
    usuario: { type: String },
    contraseña: { type: String },
    email: { type: String },
    favs: { type: Array },
    tipo: { type: String },
});
exports.UserModel = (0, mongoose_1.model)('users', UserSchema);
