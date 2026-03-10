import express from 'express';
import cors from 'cors';

const app = express()

// MIDDLEWARE
app.use(cors())
app.use(express.json())

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("API running")
})


export default app