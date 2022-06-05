"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChapterModel = void 0;
/* eslint linebreak-style: ["error", "unix"] */
const mongoose_1 = require("mongoose");
const ChapterSchema = new mongoose_1.Schema({
    _id: { type: Number },
    chapter_id: { type: Number },
    chapter: { type: Object }
});
exports.ChapterModel = (0, mongoose_1.model)('capitulos', ChapterSchema);
