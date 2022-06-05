"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaModel = void 0;
/* eslint linebreak-style: ["error", "unix"] */
const mongoose_1 = require("mongoose");
const MangaSchema = new mongoose_1.Schema({
    _id: { type: Number },
    Datos: { type: Object },
    Personal: { type: Object },
    Tags: { type: Array },
    tipo: { type: String },
    apiID: { type: String },
});
exports.MangaModel = (0, mongoose_1.model)('mangas', MangaSchema);
