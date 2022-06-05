"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = require("express");
const Mangas_1 = require("../model/Mangas");
const database_1 = require("../database/database");
const Users_1 = require("../model/Users");
const Chapters_1 = require("../model/Chapters");
const Querys_1 = require("../Midlle-Api/Querys");
var jwt = require("jsonwebtoken");
class DatoRoutes {
    constructor() {
        this.getMangas = (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield database_1.db
                .conectarBD()
                .then(() => __awaiter(this, void 0, void 0, function* () {
                let query = undefined;
                let Mangas = [];
                if (req.params.MangaName) {
                    let a = req.params.MangaName.split(",");
                    yield Promise.all(a.map((id) => __awaiter(this, void 0, void 0, function* () {
                        yield Mangas_1.MangaModel.findOne({ _id: id }).then((res) => { return Mangas.push(res); });
                    })));
                    return res.send(Mangas);
                }
                else {
                    query = yield Mangas_1.MangaModel.find({ "Datos.genero": { $ne: null } });
                }
                console.log(query);
                res.json(query);
            }));
            database_1.db.desconectarBD();
        });
        this.postMangas = (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield database_1.db.conectarBD().then(() => __awaiter(this, void 0, void 0, function* () {
                if (yield Mangas_1.MangaModel.findOne({ _id: req.body._id })) {
                    res.send("ese manga ya existe");
                }
                else {
                    let mangaReceived = new Mangas_1.MangaModel(req.body);
                    mangaReceived.save((err, result) => {
                        if (err) {
                            res.send(err);
                        }
                        res.send(`${result.Datos.titulo} guardado`);
                    });
                }
            }));
            database_1.db.desconectarBD();
        });
        this.updateMangas = (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield database_1.db.conectarBD().then(() => __awaiter(this, void 0, void 0, function* () {
                if (yield Mangas_1.MangaModel.findOne({ _id: req.params.mangaID })) {
                    let value = req.params.value;
                    if (value) {
                        yield Mangas_1.MangaModel.findOneAndUpdate({ _id: req.params.mangaID }, { "Datos.titulo": value })
                            .then(() => res.send(`${req.params.mangaID} actualizado`))
                            .catch(() => res.send(`ha habido un error actualizando el manga ${req.params.mangaID}`));
                    }
                    else {
                        res.send("No puedes poner un titulo en blanco");
                    }
                }
                else {
                    res.send("ese manga no existe");
                }
            }));
            database_1.db.desconectarBD();
        });
        this.deleteMangas = (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield database_1.db.conectarBD().then(() => __awaiter(this, void 0, void 0, function* () {
                if (yield Mangas_1.MangaModel.findOne({ _id: req.params.mangaID })) {
                    yield Mangas_1.MangaModel.findOneAndDelete({ _id: req.params.mangaID })
                        .then((docs) => res.send(`deleted: ${docs}`))
                        .catch((err) => res.send(err));
                }
                else {
                    res.send("ese manga no existe");
                }
            }));
        });
        this.postUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield database_1.db.conectarBD();
            let expiresIn = 24 * 60 * 60;
            if (yield Users_1.UserModel.findOne({ usuario: req.body.usuario })) {
                return res.send("ese nombre de usuario ya existe");
            }
            else {
                req.body._id = yield this.getLastID();
                let userReceived = new Users_1.UserModel(req.body);
                yield database_1.db.conectarBD();
                yield userReceived.save();
                let dataToken = {
                    token: jwt.sign({ _id: userReceived._id }, "Token", {
                        expiresIn: expiresIn,
                    }),
                    expiresIn: expiresIn,
                };
                return res.send(dataToken);
            }
        });
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield database_1.db.conectarBD();
            let usuario = yield Users_1.UserModel.findOne({ usuario: req.body.usuario });
            let expiresIn = 24 * 60 * 60;
            if (!usuario) {
                yield database_1.db.desconectarBD();
                return res.send("Ese usuario no existe");
            }
            else {
                if (usuario.contraseña === req.body.contraseña) {
                    let dataToken = {
                        token: jwt.sign({ _id: usuario._id }, "Token", {
                            expiresIn: expiresIn,
                        }),
                        expiresIn: expiresIn,
                    };
                    yield database_1.db.desconectarBD();
                    res.send(dataToken);
                }
                else {
                    yield database_1.db.desconectarBD();
                    return res.send("Contraseña Incorrecta");
                }
            }
        });
        this.tokenChecker = () => { };
        this.tokenUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let query = undefined;
            if (req.params.tokenUser) {
                console.log(req.params.tokenUser);
                const decoded = jwt.verify(req.params.tokenUser, "Token");
                var userId = decoded._id;
                yield database_1.db.desconectarBD();
                yield database_1.db.conectarBD().then(() => __awaiter(this, void 0, void 0, function* () {
                    query = yield Users_1.UserModel.findOne({ _id: userId }).then((res) => { return res; });
                    console.log(query);
                    return res.send(query);
                }));
            }
        });
        this.getUser = () => { };
        this.getChapters = (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield database_1.db
                .conectarBD()
                .then(() => __awaiter(this, void 0, void 0, function* () {
                let query = undefined;
                if (req.params.MangaID) {
                    query = yield Chapters_1.ChapterModel.findOne({ _id: req.params.MangaID });
                    console.log(query);
                    return res.send(query);
                }
                else {
                    query = yield Chapters_1.ChapterModel.find({});
                    return res.send(query);
                }
            }))
                .catch((mensaje) => {
                return res.send(mensaje);
            });
            yield database_1.db.desconectarBD();
        });
        this.readChapter = (req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log(req.params.chapterID);
            let imageName = yield Querys_1.querysToapi.URL(req.params.chapterID);
            let imagesUrl = [];
            yield Promise.all(imageName.map((names) => __awaiter(this, void 0, void 0, function* () {
                let pos = "";
                if (+names[0]) {
                    pos = names.substring(0, 2).replace(/\D/g, "");
                }
                else {
                    pos = names.substring(0, 3).replace(/\D/g, "");
                }
                imagesUrl.push({ image: yield Querys_1.querysToapi.getIMAGE(names), pos: pos });
            })))
                .catch((err) => {
                console.log(err);
            })
                .finally(() => __awaiter(this, void 0, void 0, function* () {
                imagesUrl.sort((a, b) => {
                    return a.pos - b.pos;
                });
                console.log(imagesUrl);
                return yield res.send(imagesUrl);
            }));
        });
        this.getLastID = () => __awaiter(this, void 0, void 0, function* () {
            database_1.db.conectarBD();
            let lastUser = yield Users_1.UserModel.findOne().sort({ $natural: -1 }).limit(1);
            if (!lastUser) {
                return 0;
            }
            database_1.db.desconectarBD();
            return lastUser._id + 1;
        });
        this.isFavourite = (req, res) => __awaiter(this, void 0, void 0, function* () {
            database_1.db.conectarBD();
            let user = yield Users_1.UserModel.findOne({ _id: req.params.userID });
            console.log(user);
            database_1.db.desconectarBD();
        });
        this.addFavourite = (req, res) => __awaiter(this, void 0, void 0, function* () {
            database_1.db.conectarBD();
            let data = req.body;
            data.userID;
            data.mangaId;
            console.log(data.mangaId);
            console.log(data.userID);
            return yield Users_1.UserModel.findOneAndUpdate({ _id: data.userID }, { $push: { favs: `${data.mangaId}` } }).then((res) => console.log(res));
            database_1.db.desconectarBD();
        });
        this.removeFavourite = (req, res) => __awaiter(this, void 0, void 0, function* () {
            database_1.db.conectarBD();
            let data = req.body;
            yield Users_1.UserModel.findOneAndUpdate({ _id: data.userID }, { $pull: { favs: `${data.mangaId}` } }).then((res) => console.log(res));
            database_1.db.desconectarBD();
        });
        this._router = (0, express_1.Router)();
    }
    get router() {
        return this._router;
    }
    misRutas() {
        this._router.get("/Mangas/:MangaName?", this.getMangas);
        this._router.post("/Mangas", this.postMangas);
        this._router.put("/Mangas/update/:mangaID/title/:value", this.updateMangas);
        this._router.delete("/Mangas/delete/:mangaID", this.deleteMangas);
        this._router.post("/register", this.postUser);
        this._router.post("/login", this.login);
        this._router.get("/user", this.tokenChecker, this.getUser);
        this._router.get("/chapters/:MangaID", this.getChapters);
        this._router.get("/chapters/:MangaID/:chapterID", this.readChapter);
        this._router.get("/tokenUser/:tokenUser", this.tokenUser);
        this._router.get("/favourite/:userID/:mangaID", this.isFavourite);
        this._router.post("/favourite/add", this.addFavourite);
        this._router.post("/favourite/remove", this.removeFavourite);
    }
}
const obj = new DatoRoutes();
obj.misRutas();
exports.routes = obj.router;
