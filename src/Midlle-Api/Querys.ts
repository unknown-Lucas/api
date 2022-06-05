import axios, { AxiosRequestConfig } from 'axios';

class QuerysToAPI {
  private user = {
    username: 'Lucasc12',
    password: 'Salmeron1-',
  };

  private token : string = '';

  private hash: string = '';

  private imageUrl : string = '';

  private baseURL : string = '';

  private data : any[] = []

  private config : AxiosRequestConfig = {
    headers: {
      authorization: '',
    },
  };

  private session : boolean = false;

  async login() {
    await axios.post('https://api.mangadex.org/auth/login', this.user).then((res:any) => this.token = `${res.data.token.session}`).catch((err:any) => console.log(err.response.data));
    if (this.config.headers !== undefined) {
      this.config.headers.authorization = `bearer ${this.token}`;
      return true;
    }
    return false;
  }

  async checkSession() {
    await axios.get('https://api.mangadex.org/auth/check', this.config).then((res:any) => { if (res.data.isAuthenticated) { this.session = true; } });
  }

  async URL(id:string) {
    if (this.session) {
      await axios.get(`https://api.mangadex.org/at-home/server/${id}`, this.config).then((res:any) => {this.baseURL = res.data.baseUrl; this.hash = res.data.chapter.hash; this.data=res.data.chapter.data});
      console.log(this.data)
      return this.data
    }
    await axios.get(`https://api.mangadex.org/at-home/server/${id}`, this.config).then((res:any) => {this.baseURL = res.data.baseUrl; this.hash = res.data.chapter.hash; this.data=res.data.chapter.data});
    console.log(this.data)
    return this.data;
  }

  async getIMAGE(image:string) : Promise<string> {
      await axios.get(`${this.baseURL}/data/${this.hash}/${image}`, this.config).then((res:any) => {if(res.config.url){this.imageUrl = res.config.url}else{console.log('no url')}});
      return this.imageUrl;
  }
}

export const querysToapi = new QuerysToAPI();
