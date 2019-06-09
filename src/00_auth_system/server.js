///
///
///
/* msg */
class Messager {
  constructor() {
    const OK = 'OK_00';
    const ERROR = 'ERROR_00';
    const WARNING = 'WARNING_00';

    const ok_code = [
      'Created Token.',
    ];

    // error code here
    const error_code = [
      'No Public Key in Request Header.',
    ];

    // warning code here
    const warning_code = [
      'Generating Token...',
    ];

    this.ok = ok_code.map((e, i) => `${OK + i}: ${e}`);
    this.error = error_code.map((e, i) => `${ERROR + i}: ${e}`);
    this.warning = warning_code.map((e, i) => `${WARNING + i}: ${e}`);
  }
}
const msg = new Messager();
///
///
///
/* utils */
const nacl = require('tweetnacl');
const { decodeBase64, encodeBase64 } = require('tweetnacl-util');

function bytes_to_hex(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

class Ed25519 {
  static verify(msg, sign, pk) {
    return nacl.sign.detached.verify(msg, sign, pk);
  }
}

const utils = {
  Ed25519,
  bytes_to_hex,
  decodeBase64,
  encodeBase64
}
///
///
///~~~.>~~~.>~~~.>~~~.>~~~.>~~~.>~~~.>~~~.>~~~.>~~~.>~~~.>~~~.>~~~.>~~~.>
/* modules */
const crypto = require('crypto');
const Redis = require('ioredis');
const redis = new Redis();
/** auth
 * @pk: public key
 * @sign: signature
 */
class Middleware {
  static async auth(ctx, next) {
    let headers = ctx.headers;
    console.log(headers);

    let pk = headers['public-key-header'];
    let token = headers['token-header'];
    let stoken = headers['signed-token-header'];

    let _stoken = await redis.get(pk);

    if (pk === undefined || pk === '') {
      ctx.status = 401;
      ctx.body = {
	msg: msg.error[0]
      }
    } else if (stoken === undefined || stoken === '') {
      let token = await crypto.randomBytes(64);
      token = utils.encodeBase64(token);

      ctx.status = 202;
      ctx.body = {
	token: token,
	msg: msg.warning[0]
      };
    } else if (stoken === _stoken) {
      next();
    } else {
      let result = utils.Ed25519.verify(
	utils.decodeBase64(token),
	utils.decodeBase64(stoken),
	utils.decodeBase64(pk)
      );

      await redis.set(pk, stoken)

      ctx.status = 201;
      ctx.body = {
	msg: msg.ok[0]
      }
    }
  }
}

async function midware(ctx, next) {
  await Middleware.auth(ctx, next)
}
///
///
///
/* server */
const Koa = require('koa');
const logger = require('koa-logger');
let server = new Koa();

console.log('server start at 6006...');

server
  .use(midware)
  .use(logger())
  .use((ctx, next) => {
    ctx.body = { msg: 'hello, world!' };
  })
  .listen(6006);
