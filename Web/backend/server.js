import connectDB from './config/db.js';
// import connectDB from './config/testdb.js';
import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js'
import languageRoutes from './routes/languageRoutes.js'
import countryRoutes from './routes/countryRoutes.js'
import cityRoutes from './routes/cityRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import conversationRoutes from './routes/conversationRoutes.js'
import blogRoutes from './routes/blogRoutes.js'
import mongoose from 'mongoose';
import connectDummyDB from './config/testdb.js';

dotenv.config();

console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV == 'testdb') {
    connectDummyDB();
}
if(process.env.NODE_ENV == 'db') {
    connectDB();
}

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json(users);
})

app.use('/api/users', userRoutes);

app.use('/api/languages', languageRoutes);

app.use('/api/countries', countryRoutes);

app.use('/api/cities', cityRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/messages', messageRoutes);

app.use('/api/conversations', conversationRoutes);

app.use('/api/blogs', blogRoutes);

app.listen(5000, console.log('Server'));

export default app;