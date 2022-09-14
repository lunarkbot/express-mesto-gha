const mongoose = require('mongoose');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  email: {
    unique: true,
    type: String,
    required: true,
    validate: {
      validator(value) {
        return isEmail(value);
      },
      message: 'Введите корректный email',
    },
  },
  password: {
    required: true,
    type: String,
  },
});

module.exports = mongoose.model('user', userSchema);
