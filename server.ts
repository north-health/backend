import app from "./src/app";
import dotenv from "dotenv";

// LOAD ENV VARIABLES
dotenv.config();

// PORT NUMBER
const PORT = (process.env.PORT);

async function startServer(): Promise<void> {
  try {
    console.log("✅ Firebase initialized successfully");

    // STARTS SERVER
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Error starting server:", (error as Error).message);
    process.exit(1); 
  }
}

// START THE SERVER
startServer();