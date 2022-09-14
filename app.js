const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const {login, createUser} = require('./controllers/users');

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.user = {
    _id: '631ae6a4e08ad0c2f524d2b6',
  };

  next();
});

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));
app.post('/signin', login);
app.post('/signup', createUser);

app.all('/*', (req, res) => {
  res.status(404).send({ message: 'Неверный URL для запроса.' });
});

app.listen(PORT);
