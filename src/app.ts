import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user';

const app = express()

// MIDDLEWARE
app.use(cors())
app.use(express.json())

// ROUTES
app.use('/api/user', userRoutes);

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("API running")
})


export default app