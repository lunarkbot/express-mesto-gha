const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  let token = req.cookies.jwt;

  if (!token) {
    const { authorization } = req.headers;

    if (authorization) {
      token = authorization.replace('Bearer ', '');
    } else {
      return res.status(401).send({ message: 'Необходима авторизация' });
    }
  }

  let payload;

  try {
    payload = jwt.verify(token, 'iddqd&idkfa');
  } catch (err) {
    return res.status(401).send({ message: 'Необходима авторизация' });
  }

  req.user = payload;

  next();
  return null;
};
