const mongoose = require('mongoose');

mongoose.connect(
  'mongodb://localhost:27017/lark-in', {
    useNewUrlParser: true
  }
);

class User {
  static schema() {
    return new mongoose.Schema({
      username: {
	type: String,
	unique: true
      },
      password: String
    });
  }

  static model() {
    return mongoose.model('user', User.schema());
  }

  constructor() {
    this.user = User.model();
  }
  
  async register(params) {
    const { username, password } = params;
    let u = this.user;

    return u.exists({
      username: username
    }).then(r => {
      if (r === true) {
	return {
	  errMsg: 'err'
	}
      } else {
	return u.create({
	  username, password
	}).then(r => {
	  if (r._id) {
	    return {
	      errMsg: 'ok',
	      username: r.username
	    }
	  } else {
	    return {
	      errMsg: 'err'
	    }
	  }
	})
      }
    });
  }

  async login(params) {
    const { username, password } = params;
    let u = this.user;

    return u.findOne({
      username: username
    }).then(r => {
      if (r.password === password) {
	return {
	  username: r.username,
	  errMsg: 'ok'
	};
      } else {
	return {
	  errMsg: 'err'
	};
      }
    });
  }
}

module.exports = { User };
