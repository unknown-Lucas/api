import { query, Request, Response, Router } from "express";
import { MangaModel } from "../model/Mangas";
import { db } from "../database/database";
import { UserModel } from "../model/Users";
import { ChapterModel } from "../model/Chapters";
import { querysToapi } from "../Midlle-Api/Querys";
var jwt = require("jsonwebtoken");

class DatoRoutes {
  private _router: Router;

  constructor() {
    this._router = Router();
  }
  get router() {
    return this._router;
  }

  private getMangas = async (req: Request, res: Response) => {
    await db
      .conectarBD()
      .then(async () => {
        let query = undefined;
        let Mangas: any = [];
        if (req.params.MangaName) {
          let a = req.params.MangaName.split(",");
          await Promise.all(
            a.map(async (id) => {
              await MangaModel.findOne({ _id: id }).then(
              (res)=> {return Mangas.push(res)}
              );
            })
          );
          return res.send(Mangas)
        } else {
          query = await MangaModel.find({ "Datos.genero": { $ne: null } });
        }
        console.log(query);
        res.json(query);
      })
    db.desconectarBD();
  };

  private postMangas = async (req: Request, res: Response) => {
    await db.conectarBD().then(async () => {
      if (await MangaModel.findOne({ _id: req.body._id })) {
        res.send("ese manga ya existe");
      } else {
        let mangaReceived = new MangaModel(req.body);

        mangaReceived.save((err: any, result: any) => {
          if (err) {
            res.send(err);
          }

          res.send(`${result.Datos.titulo} guardado`);
        });
      }
    });
    db.desconectarBD();
  };

  private updateMangas = async (req: Request, res: Response) => {
    await db.conectarBD().then(async () => {
      if (await MangaModel.findOne({ _id: req.params.mangaID })) {
        let value = req.params.value;
        if (value) {
          await MangaModel.findOneAndUpdate(
            { _id: req.params.mangaID },
            { "Datos.titulo": value }
          )
            .then(() => res.send(`${req.params.mangaID} actualizado`))
            .catch(() =>
              res.send(
                `ha habido un error actualizando el manga ${req.params.mangaID}`
              )
            );
        } else {
          res.send("No puedes poner un titulo en blanco");
        }
      } else {
        res.send("ese manga no existe");
      }
    });
    db.desconectarBD();
  };

  private deleteMangas = async (req: Request, res: Response) => {
    await db.conectarBD().then(async () => {
      if (await MangaModel.findOne({ _id: req.params.mangaID })) {
        await MangaModel.findOneAndDelete({ _id: req.params.mangaID })
          .then((docs) => res.send(`deleted: ${docs}`))
          .catch((err) => res.send(err));
      } else {
        res.send("ese manga no existe");
      }
    });
  };

  private postUser = async (req: Request, res: Response) => {
    await db.conectarBD();
    let expiresIn: number = 24 * 60 * 60;
    if (await UserModel.findOne({ usuario: req.body.usuario })) {
      return res.send("ese nombre de usuario ya existe");
    } else {
      req.body._id = await this.getLastID();
      let userReceived = new UserModel(req.body);
      await db.conectarBD();
      await userReceived.save();
      let dataToken = {
        token: jwt.sign({ _id: userReceived._id }, "Token", {
          expiresIn: expiresIn,
        }),
        expiresIn: expiresIn,
      };

      return res.send(dataToken);
    }
  };

  private login = async (req: Request, res: Response) => {
    await db.conectarBD();
    let usuario: any = await UserModel.findOne({ usuario: req.body.usuario });
    let expiresIn: number = 24 * 60 * 60;
    if (!usuario) {
      await db.desconectarBD();
      return res.send("Ese usuario no existe");
    } else {
      if (usuario.contraseña === req.body.contraseña) {
        let dataToken = {
          token: jwt.sign({ _id: usuario._id }, "Token", {
            expiresIn: expiresIn,
          }),
          expiresIn: expiresIn,
        };
        await db.desconectarBD();
        res.send(dataToken);
      } else {
        await db.desconectarBD();
        return res.send("Contraseña Incorrecta");
      }
    }
  };

  private tokenChecker = () => {};

  private tokenUser = async (req: Request, res: Response) => {
	let query = undefined;
	if (req.params.tokenUser) {
		console.log(req.params.tokenUser)
	const decoded = jwt.verify(req.params.tokenUser, "Token");  
	var userId = decoded._id;

  await db.desconectarBD();
  await db.conectarBD().then(async()=>{
		query = await UserModel.findOne({_id:userId}).then((res:Object)=>{return res});
    console.log(query)
    return res.send(query)
	})
	}
  };

  private getUser = () => {};

  private getChapters = async (req: Request, res: Response) => {
    await db
      .conectarBD()
      .then(async () => {
        let query = undefined;
        if (req.params.MangaID) {
          query = await ChapterModel.findOne({ _id: req.params.MangaID });
          console.log(query);
          return res.send(query);
        } else {
          query = await ChapterModel.find({});
          return res.send(query);
        }
      })
      .catch((mensaje) => {
        return res.send(mensaje);
      });
    await db.desconectarBD();
  };

  private readChapter = async (req: Request, res: Response) => {
    console.log(req.params.chapterID);
    let imageName: string[] = await querysToapi.URL(req.params.chapterID);
    let imagesUrl: any[] = [];
    
    await Promise.all(
      imageName.map(async (names: string) => {
        let pos = "";
        if (+names[0]) {
          pos = names.substring(0, 2).replace(/\D/g, "");
        } else {
          pos = names.substring(0, 3).replace(/\D/g, "");
        }
        imagesUrl.push({ image: await querysToapi.getIMAGE(names), pos: pos });
      })
    )
      .catch((err) => {
        console.log(err);
      })
      .finally(async () => {
        imagesUrl.sort((a: any, b: any) => {
          return a.pos - b.pos;
        });
        console.log(imagesUrl);
        return await res.send(imagesUrl);
      });
  };

  private getLastID = async () => {
    db.conectarBD();
    let lastUser = await UserModel.findOne().sort({ $natural: -1 }).limit(1);
    if (!lastUser) {
      return 0;
    }
    db.desconectarBD();
    return lastUser._id + 1;

  };

  private isFavourite = async (req: Request, res: Response) => {
    db.conectarBD();
    let user = await UserModel.findOne({_id:req.params.userID})
    console.log(user);
    db.desconectarBD();
  }

  private addFavourite = async (req:Request , res: Response) => {
    db.conectarBD();
    let data = req.body;
    data.userID;
    data.mangaId;
    console.log(data.mangaId)
    console.log(data.userID)
    return await UserModel.findOneAndUpdate({_id:data.userID},{$push:{favs:`${data.mangaId}`}}).then((res)=>console.log(res))
    db.desconectarBD();
  } 

  private removeFavourite = async (req:Request , res:Response) =>{
    db.conectarBD();
    let data = req.body;
    await UserModel.findOneAndUpdate({_id:data.userID},{$pull:{favs:`${data.mangaId}`}}).then((res)=>console.log(res))
    db.desconectarBD();
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
export const routes = obj.router;
