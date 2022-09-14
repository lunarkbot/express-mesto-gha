const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const UnauthorizedError = require('../errors/unauthorized-error');

const ERROR_400 = 'Переданы некорректные данные.';
const ERROR_404 = 'Карточка с указанным ID не найдена.';

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (card.owner !== req.user._id) {
        res.status(401).send({ message: 'Нет прав доступа на удаление карточки' });
        return;
      }
      Card.findByIdAndRemove(req.params.cardId)
        .then((result) => {
          res.send({ data: result });
        })
        .catch((err) => {
          res.status(500).send({ message: err.message });
        })
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: ERROR_400 });
        return;
      }
      res.status(500).send({ message: err.message });
    });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: ERROR_400 });
        return;
      }
      res.status(500).send({ message: err.message });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true, runValidators: true },
  )
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: ERROR_404 });
        return;
      }
      res.send({
        _id: card._id,
        name: card.name,
        link: card.link,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(400).send({ message: ERROR_400 });
        return;
      }
      res.status(500).send({ message: err.message });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true, runValidators: true },
  )
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: ERROR_404 });
        return;
      }
      res.send({
        _id: card._id,
        name: card.name,
        link: card.link,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(400).send({ message: ERROR_400 });
        return;
      }
      res.status(500).send({ message: err.message });
    });
};
