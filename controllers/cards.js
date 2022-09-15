const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/forbidden-error');

const ERROR_404 = 'Карточка с указанным ID не найдена.';

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then(result => {
      Card.findOneAndRemove({
        _id: req.params.cardId,
        owner: req.user._id,
      })
        .then((card) => {
          if (!card) {
            throw new ForbiddenError();
          }
          res.send({ data: card });
        })
        .catch((err) => {
          if (err.name === 'CastError') {
            next(new BadRequestError());
            return;
          }
          next(err);
        })
    })
    .catch(next);

  /*Card.findById(req.params.cardId)
    .then((card) => {
      if (!card?.owner) {
        throw new NotFoundError(ERROR_404);
      }

      res.send({
        owner: card.owner,
        ich: req.user._id
      })

      if (card.owner.trim() !== req.user._id.trim()) {
        throw new BadRequestError({[card.owner]: req.user._id});
      }
      Card.findByIdAndRemove(req.params.cardId)
        .then((result) => {
          res.send({ data: result });
        })
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError());
        return;
      }
      next(err);
    });*/
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError());
        return;
      }
      next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true, runValidators: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError(ERROR_404);
      }
      res.send({
        _id: card._id,
        name: card.name,
        link: card.link,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError());
        return;
      }
      next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true, runValidators: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError(ERROR_404);
      }
      res.send({
        _id: card._id,
        name: card.name,
        link: card.link,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError());
        return;
      }
      next(err);
    });
};
