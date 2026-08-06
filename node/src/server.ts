import express from 'express';
import morgan from 'morgan';
import { cors } from './middleware/cors';
import { User, Message } from './models';

const app = express();

app.set('port', process.env.PORT || 3001);
app.use(cors);
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));

app.get('/admin_api/users', async (_req, res) => {
  const users = await User.findAll({ attributes: ['id', 'email'] });
  res.json(users);
});

app.post('/admin_api/messages', async (req, res) => {
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const message = await Message.create({
    user_id: user.id,
    content: req.body.content,
  });
  res.json({ message });
});

app.post('/customer_api/ping', async (req, res) => {
  const [user] = await User.findOrCreate({ where: { email: req.body.email } });
  const unreadMessages = await Message.findAll({
    where: { user_id: user.id, read: false },
    attributes: ['id', 'content'],
  });
  res.json(unreadMessages);
});

app.post('/customer_api/read', async (req, res) => {
  await Message.update(
    { read: true },
    { where: { id: parseInt(req.body.message_id, 10) } }
  );
  res.json(null);
});

export default app;
