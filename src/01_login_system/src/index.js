const Koa = require('koa');
const cors = require('@koa/cors');
const logger = require('koa-logger');
const Router = require('koa-router');
const bodyparser = require('koa-body');

const user = require('./user');

class Index {
  static router() {
    let r = new Router();

    r
      .get('/', ctx => {
	ctx.body = 'hello, world';
      })
      .post('/user/register', user.register)
      .post('/user/login', user.login)

    return r;
  }

  static server(r) {
    const server = new Koa();
    console.log('Server listen to 6000...');

    server
      .use(cors())
      .use(logger())
      .use(bodyparser())
      .use(r.routes())
      .use(r.allowedMethods())
      .listen(6000);
  }

  static main() {
    Index.server(Index.router());
  }
}

Index.main();
