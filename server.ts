import app from "./src/app";
import dotenv from "dotenv";
import pool from "./src/config/database";

// LOAD ENV VARIABLES
dotenv.config();

// PORT NUMBER
const PORT = process.env.PORT;

// START SERVER
async function startServer() {
    try {
        await pool.query("SELECT NOW()")
        console.log("Database connected successfully")
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    } catch (error) {
        console.error("Error starting server:", error)  
    }
}

// START THE SERVER
startServer()

// ENDS