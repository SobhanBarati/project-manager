import User from "../models/user.js";
import Verification from "../models/verification.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../libs/email.js";
import aj from "../libs/arcjet.js";

const registerUser = async (req, res) => {
    try {
        const { email, name, password } = req.body;

        // ✅ Arcjet Decision با requested: 1
        const decision = await aj.protect(req, { email, requested: 1 });
        console.log("Arcjet decision - isDenied:", decision.isDenied());
        // در کنترلر خود، بعد از دریافت decision
        const disposableDomains = ['copawoke.com', 'tempmail.com' , 'davopa.com']; // لیست دامنه‌های خودتان
        const emailDomain = email.split('@')[1];
        if (disposableDomains.includes(emailDomain)) {
          return res.status(400).json({ message: "Disposable email addresses are not allowed." });
        }

        // ✅ هندل کردن خطاهای Arcjet
        if (decision.isDenied()) {
            // اگر ایمیل نامعتبر بود
            if (decision.reason?.isEmail()) {
                let errorMessage = "Invalid email address.";
                
                // تشخیص دقیق نوع خطا
                if (decision.reason?.email?.isDisposable) {
                    errorMessage = "Disposable email addresses are not allowed. Please use a permanent email.";
                } else if (decision.reason?.email?.isInvalid) {
                    errorMessage = "Invalid email address format. Please enter a valid email.";
                } else if (decision.reason?.email?.hasNoMXRecords) {
                    errorMessage = "This email domain does not exist or cannot receive emails.";
                }
                
                return res.status(400).json({ message: errorMessage });
            }
            
            // اگر Rate Limit بود
            if (decision.reason?.isRateLimit()) {
                return res.status(429).json({
                    message: "Too many requests. Please try again later.",
                });
            }
            
            // اگر Bot بود
            if (decision.reason?.isBot()) {
                return res.status(403).json({
                    message: "Automated requests are not allowed.",
                });
            }
            
            // سایر خطاها
            return res.status(403).json({
                message: "Access denied. Please try again.",
            });
        }

        // ✅ اگر Arcjet خطا داشت (مثل ERROR)
        if (decision.conclusion === 'ERROR') {
            console.warn('⚠️ Arcjet error (continuing):', decision.reason);
            // ادامه می‌دیم چون Arcjet مشکل داره
        }

        // 1. چک کردن کاربر تکراری
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email address already in use",
            });
        }

        // 2. هش کردن رمز
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. ایجاد کاربر جدید
        const newUser = await User.create({
            email,
            password: hashedPassword,
            name,
            isEmailVerified: false, // ✅ اصلاح: isVerified → isEmailVerified
        });

        // 4. ساخت توکن تایید ایمیل
        const verificationToken = jwt.sign(
            { 
                email: newUser.email, 
                userId: newUser._id 
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // ✅ ذخیره توکن در دیتابیس
        await Verification.create({
            userId: newUser._id,
            token: verificationToken,
            expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 ساعت
        });

        // 5. ارسال ایمیل تایید
        try {
            await sendVerificationEmail(email, verificationToken);
            console.log(`✅ Verification email sent to ${email}`);
        } catch (emailError) {
            console.error('⚠️ User registered but email failed:', emailError);
            return res.status(201).json({
                message: "Account created! However, we couldn't send the verification email. Please contact support.",
                user: { 
                    id: newUser._id, 
                    email: newUser.email, 
                    name: newUser.name 
                }
            });
        }

        res.status(201).json({
            message: "Verification email sent to your email. Please check and verify your account.",
            user: { 
                id: newUser._id, 
                email: newUser.email, 
                name: newUser.name 
            }
        });

    } catch (error) {
        console.log('❌ Register error:', error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. پیدا کردن کاربر
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // ✅ اصلاح: isVerified → isEmailVerified
        if(!user.isEmailVerified) {
            const existingVerification = await Verification.findOne({ userId: user._id });
            
            // ✅ اصلاح: بررسی وجود توکن قبل از استفاده
            if(existingVerification && existingVerification.expiresAt > new Date()) {
                return res.status(400).json({
                    message: "Email not verified. Please check your email for the verification link.",
                });
            } else {
                // ✅ اصلاح: فقط در صورتی که توکن وجود داشته باشه حذف کن
                if(existingVerification) {
                    await Verification.findByIdAndDelete(existingVerification._id);
                }

                const verificationToken = jwt.sign(
                    { userId: user._id, purpose: 'email_verification' },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' },
                );

                await Verification.create({
                    userId: user._id,
                    token: verificationToken,
                    expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 ساعت
                });

                const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
                const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`;
                const emailSubject = "Verify your email";

                // ✅ اصلاح: استفاده از try/catch به جای شرط
                try {
                    await sendVerificationEmail(email, verificationToken);
                } catch (emailError) {
                    return res.status(500).json({
                        message: "Failed to send verification email",
                    });
                }

                return res.status(200).json({
                    message: "Verification email sent your email. Please check and verify your account.",
                });
            }
        }

        // ✅ اصلاح: isVerified → isEmailVerified
        /*if (!user.isEmailVerified) {
            return res.status(403).json({
                message: "Please verify your email before logging in.",
            });
        }*/

        // 3. بررسی رمز
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // 4. ساخت توکن JWT
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email ,
                purpose: 'login',
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        user.lastLogin = new Date();
        await user.save();

        const userData = user.toObject();
        delete userData.password; // حذف فیلد رمز عبور از پاسخ

        res.status(200).json({
            message: "Login successful",
            token,
            user: userData,
        });

    } catch (error) {
        console.log('❌ Login error:', error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// ✅ تابع تایید ایمیل
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        // 1. تایید JWT
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(400).json({
                    message: "Verification link has expired.",
                });
            }
            return res.status(400).json({
                message: "Invalid verification token.",
            });
        }

        // 2. چک کردن در دیتابیس (امنیت بیشتر)
        const verification = await Verification.findOne({
            userId: decoded.userId,
            token: token,
        });

        if (!verification) {
            return res.status(400).json({
                message: "Invalid or already used token.",
            });
        }

        if (verification.expiresAt < new Date()) {
            return res.status(400).json({
                message: "Token has expired.",
            });
        }

        // 3. پیدا کردن کاربر
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // ✅ اصلاح: isVerified → isEmailVerified
        if (user.isEmailVerified) {
            return res.status(400).json({
                message: "Email already verified",
            });
        }

        // 4. تایید ایمیل
        user.isEmailVerified = true; // ✅ اصلاح: isVerified → isEmailVerified
        user.verifiedAt = new Date();
        await user.save();

        // 5. حذف توکن (یکبار مصرف)
        await Verification.findByIdAndDelete(verification._id);

        res.status(200).json({
            message: "Email verified successfully!",
        });

    } catch (error) {
        console.error('❌ Verify email error:', error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// ✅ تابع درخواست مجدد ایمیل تایید
const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        // 1. پیدا کردن کاربر
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // 2. چک کردن اینکه قبلاً تایید نشده
        // ✅ اصلاح: isVerified → isEmailVerified
        if (user.isEmailVerified) {
            return res.status(400).json({
                message: "Email already verified",
            });
        }

        // 3. ساخت توکن جدید
        const verificationToken = jwt.sign(
            { 
                email: user.email, 
                userId: user._id 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 4. ارسال ایمیل
        await sendVerificationEmail(email, verificationToken);

        res.status(200).json({
            message: "Verification email resent successfully. Please check your email.",
        });

    } catch (error) {
        console.error('❌ Resend verification error:', error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const resetPasswordRequest = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (!user.isEmailVerified) {
            return res.status(400).json({
                message: "Please verify your email first",
            });
        }

        const existingVerification = await Verification.findOne({ userId: user._id });

        if (existingVerification && existingVerification.expiresAt > new Date()) {
            return res.status(400).json({
                message: "Reset password request already sent",
            });
        }

        if (existingVerification && existingVerification.expiresAt <= new Date()) {
            await Verification.findByIdAndDelete(existingVerification._id);
        }

        const resetPasswordToken = jwt.sign(
            { userId: user._id, purpose: 'reset_password' },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        await Verification.create({
            userId: user._id,
            token: resetPasswordToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        });

        // ✅ ارسال ایمیل با type: 'reset'
        try {
            await sendVerificationEmail(email, resetPasswordToken, 'reset');
        } catch (emailError) {
            console.error('Email error:', emailError);
            return res.status(500).json({
                message: "Failed to send reset password email",
            });
        }

        res.status(200).json({
            message: "Reset password email sent successfully",
        });

    } catch (error) {
        console.error('❌ Reset password request error:', error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const verifyResetPasswordTokenAndResetPassword = async (req, res) => {
    try {
        const { token, newPassword , confirmPassword } = req.body;

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if(payload.purpose !== 'reset_password') {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const { userId , purpose } = payload;

        if(purpose !== 'reset_password') {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const verification = await Verification.findOne({ userId, token });

        if(!verification) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const isExpired = verification.expiresAt < new Date();

        if(isExpired) {
            return res.status(401).json({
                message: "Token expired",
            });
        }

        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();

        await Verification.findByIdAndDelete(verification._id);

        res.status(200).json({
            message: "Password reset successful",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

export {
    registerUser,
    loginUser,
    verifyEmail,
    resendVerificationEmail,
    resetPasswordRequest,
    verifyResetPasswordTokenAndResetPassword,
};