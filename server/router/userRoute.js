import { Router } from "express";
import {
    signInController,
    signUpController,
    refreshAccessToken, 
    logoutController 
} from "../controller/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// User sign-up route
router.post(`/sign-up`, signUpController);

// User sign-in route
router.post(`/sign-in`, signInController); 

// Refresh access token route
router.post(`/refresh-token`, refreshAccessToken); 

// Logout route
router.post(`/logout`, authMiddleware, logoutController); 

export default router;
