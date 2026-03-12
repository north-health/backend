// USER ROUTES
import { Router } from "express";
import { wakeUpServer } from "../controllers/helpers/wakeUpServer";
// ENDS

const router = Router();

// WAKEUP ROUTE

router.get("/wakeup/server", wakeUpServer);
// ENDS

// ENDS
    
export default router;