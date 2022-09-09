const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then(cards => res.send({ data: cards }))
    .catch(err => {
      if (err.name === 'ValidationError') {
        res.status(400).send({message: 'Переданы некорректные данные.'});
        return;
      }
      res.status(500).send({ message: err.message })
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then(card => res.send({data: card}))
    .catch(err => {
      if (err.name === 'CastError') {
        res.status(404).send({message: `Карточка с ID ${err.value} не найдена.`});
        return;
      }
      res.status(500).send({ message: err.message })
    });
}

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link })
    .then(card => res.send({_id: card._id, name, link }))
    .catch(err => {
      if (err.name === 'ValidationError') {
        res.status(400).send({message: 'Переданы некорректные данные.'});
        return;
      }
      res.status(500).send({ message: err.message })
    });
}
