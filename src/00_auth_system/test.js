const client = require('./client');

function main() {
  client.get('/hello').then(r => {
    console.log(r);
  }).catch(err => {
    console.log(err)
  })
}

main();
