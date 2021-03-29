const crypto = require('crypto')
const md5 = crypto.createHash('md5')

function cryptPwd(password) {
  const md5 = crypto.createHash('md5');
  return md5.update(password).digest('hex').toString();
}

module.exports = cryptPwd