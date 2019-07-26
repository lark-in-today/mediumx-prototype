const Redis = require('ioredis');
const redis = new Redis();

class Middleware {
  static async auth(ctx, next) {
    let headers = ctx.headers;
    return;
  }
}

async function midware(ctx, next) {
  await Middleware.auth(ctx, next);
}

module.exports = midware;
