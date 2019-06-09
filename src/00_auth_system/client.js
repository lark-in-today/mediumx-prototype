/* config module */
const __config = {
  debug: true,
  baseUrl: 'http://localhost:6006',
  seed: 'THzTNmjn3ULghj3vshk/XvjsEeNpFEfGKM1bgM8k2NE='
}
///
///
///
/* store module */
const __store = require('store');
class Store {
  static get(k) { return __store.get(k) }
  static set(k, v) { return __store.set(k, v) }
}

const store = Store;
///
///
///
/* crypto module */
const __nacl = require('tweetnacl');
const {
  encodeBase64,
  decodeBase64
} = require('tweetnacl-util');
class Ed25519 {
  static gen() {
    let seed = __nacl.randomBytes(nacl.sign.seedLength);
    let kp = __nacl.sign.keyPair.fromSeed(seed);
    kp.seed = seed;
    
    return kp;
  }

  static sign(msg, sk) {
    return __nacl.sign.detached(msg, sk);
  }

  static verify(msg, sign, pk) {
    return __nacl.sign.detached.verify(msg, sign, pk);
  }

  static genFromSeed() {
    let seed = decodeBase64(__config.seed);
    let kp = __nacl.sign.keyPair.fromSeed(seed);
    kp.seed = seed;
    
    return kp;
  }
}

function genKey() {
  let keypair = {};
  if (!__config.debug) {
    keypair = Ed25519.gen();
  } else {
    keypair = Ed25519.genFromSeed();
  }
  
  let sk = encodeBase64(keypair.secretKey);
  let pk = encodeBase64(keypair.publicKey);
  let seed = encodeBase64(keypair.seed);

  store.set('seed', seed);
  store.set('public_key', pk);
  store.set('secret_key', sk);

  return pk;
}

const crypto = {
  Ed25519,
  encodeBase64, decodeBase64,
  genKey
}
///
///
///
/* modules */
const axios = require('axios');
const baseUrl = __config.baseUrl;

///
///
///
/* client */
function auth(res, url, params) {
  let method = res.config.method;
  if (res.data.msg.match(/WARNING_000/)) {

    let _tk = '' + res.data.token;
    let token = crypto.decodeBase64(res.data.token);
    let sk = crypto.decodeBase64(store.get('secret_key'));
    let stoken = crypto.encodeBase64(crypto.Ed25519.sign(token, sk));

    store.set('token', _tk);
    store.set('signed_token', stoken);

    let ret = crypto.Ed25519.verify(
      crypto.decodeBase64(_tk),
      crypto.decodeBase64(stoken),
      crypto.decodeBase64(store.get('public_key')),
    );

    return Requests[method](url, params);
  } else if(res.data.msg.match(/OK_000/)) {
    return Requests[method](url, params);
  } else {
    return res.data;
  }
}

class Requests {
  static request(method, url, params) {
    let pk = store.get('public_key');
    let token = store.get('token');
    let stoken = store.get('signed_token');

    if (pk === undefined) { pk = crypto.genKey(); }
    if (token === undefined) { token = ''; }
    if (stoken === undefined) { stoken = ''; }

    return axios.request({
      url: `${baseUrl + url}`,
      headers: {
	'public-key-header': pk,
	'token-header': token,
	'signed-token-header': stoken
      },
      method: method,
    }).then(
      res => auth(res, url, params)
    );
  }

  static get(url, params) {
    return Requests.request('GET', url, params);
  }

  static put(url, params) {
    return Requests.request('PUT', url, params);
  }
  
  static post(url, params) {
    return Requests.request('POST', url, params);
  }
}

module.exports = Requests;
