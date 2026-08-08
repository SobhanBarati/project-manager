import express from "express";
import { validateRequest } from "zod-express-middleware";
import { 
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    resetPasswordRequestSchema,
    resetPasswordSchema, // ✅ این رو اضافه کنید
} from "../libs/validate-schema.js";
import { 
    registerUser,
    loginUser, 
    verifyEmail,
    resetPasswordRequest,
    verifyResetPasswordTokenAndResetPassword,
} from "../controllers/auth-controller.js";

const router = express.Router();

router.post("/register",
    validateRequest({ body: registerSchema }),
    registerUser
);

router.post("/login",
    validateRequest({ body: loginSchema }),
    loginUser
);

router.get("/verify-email",
    validateRequest({ query: verifyEmailSchema }),
    verifyEmail
);

router.post("/reset-password-request", 
    validateRequest({ body: resetPasswordRequestSchema }),
    resetPasswordRequest
);

// ✅ اصلاح: استفاده از resetPasswordSchema
router.post("/reset-password", 
    validateRequest({ body: resetPasswordSchema }), // ✅ اینجا باید resetPasswordSchema باشه!
    verifyResetPasswordTokenAndResetPassword
);

export default router;