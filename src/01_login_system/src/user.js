const mongoUser = new require('./mongo').User;
const Redis = require('ioredis');
const crypto = require('crypto');

const u = new mongoUser();
const redis = new Redis();

class User {
  static async register(ctx, next) {
    let body = ctx.request.body;
    let res = await u.register({
      username: body.username,
      password: body.password
    });

    ctx.body = res;
  }
  
  static async login(ctx, next) {
    let body = ctx.request.body;
    let res = await u.login({
      username: body.username,
      password: body.password
    });
    
    if (res.errMsg === 'ok') {
      let token = await crypto.randomBytes(64);
      redis.set(token.toString('hex'), body.username);
      ctx.set('auth', token.toString('hex'));
    }

    ctx.body = res;
  }
}

module.exports = User;
