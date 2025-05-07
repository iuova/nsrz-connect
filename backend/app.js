import express from 'express';
import usersRouter from './src/routes/users.js';
import newsRouter from './src/routes/news.js';

const app = express();

app.use('/uploads', express.static('public/uploads'));
app.use('/users', usersRouter);
app.use('/news', newsRouter);

export default app;