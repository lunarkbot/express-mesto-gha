const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const UnauthorizedError = require('../errors/unauthorized-error');

const ERROR_404 = 'Пользователь с указанным ID не найден.';

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  const { _id } = req.user;

  User.findById(_id)
    .then((user) => {
      res.send({ data: user })
    })
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError(ERROR_404);
      }
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError());
        return;
      }
      next(err);
    });
};

module.exports.createUser = (req, res) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  if (!password) {
    res.status(401).send({ message: 'Укажите пароль для пользователя' });
    return;
  }

  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
        .then((user) => res.send({
          _id: user._id,
          name,
          about,
          avatar,
          email,
        }))
        .catch((err) => {
          if (err.name === 'ValidationError') {
            res.status(400).send({ message: ERROR_400 });
            return;
          }
          res.status(500).send({ message: err.message });
        });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;

  User.findOneAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send({
      _id: user._id,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: ERROR_400 });
        return;
      }
      if (err.name === 'CastError') {
        res.status(404).send({ message: ERROR_404 });
        return;
      }
      res.status(500).send({ message: err.message });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findOneAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => res.send({ _id: user._id, avatar: user.avatar }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(400).send({ message: ERROR_400 });
        return;
      }
      res.status(500).send({ message: err.message });
    });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'iddqd&idkfa',
        { expiresIn: '7d' },
      );

      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
        })
        .end();
    })
    .catch((err) => {
      res.status(401).send({ message: err.message });
    });
};
