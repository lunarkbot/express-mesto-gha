const bcrypt = require('bcryptjs');
const User = require('../models/user');

const ERROR_400 = 'Переданы некорректные данные.';
const ERROR_404 = 'Пользователь с указанным ID не найден.';

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        res.status(404).send({ message: ERROR_404 });
        return;
      }
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: ERROR_400 });
        return;
      }
      res.status(500).send({ message: err.message });
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
