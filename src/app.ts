import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user';
import careerRoutes from './routes/career';
import learningRoutes from './routes/learning';

const app = express()

// MIDDLEWARE
app.use(cors())
app.use(express.json())

// ROUTES
app.use('/api/user', userRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/learning', learningRoutes);

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("API running")
})

export default app