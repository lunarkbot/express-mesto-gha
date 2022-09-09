const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then(users => res.send({ data: users }))
    .catch(err => {
      if (err.name === 'ValidationError') {
        res.status(400).send({message: 'Переданы некорректные данные.'});
        return;
      }
      res.status(500).send({ message: err.message })
    });
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then(user => res.send({data: user}))
    .catch(err => {
      if (err.name === 'CastError') {
        res.status(404).send({message: `Пользователь с ID ${err.value} не найден.`});
        return;
      }
      res.status(500).send({ message: err.message })
    });
}

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({name, about, avatar})
    .then(user => res.send({_id: user._id, name, about, avatar }))
    .catch(err => {
      if (err.name === 'ValidationError') {
        res.status(400).send({message: 'Переданы некорректные данные.'});
        return;
      }
      res.status(500).send({ message: err.message })
    });
}
