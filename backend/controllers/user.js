import User from "../models/user.js";
import bcrypt from "bcrypt";

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    delete user.password;

    // jfkd

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);

    res.status(500).json({ message: "Server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, profilePicture } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    user.profilePicture = profilePicture;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user profile:", error);

    res.status(500).json({ message: "Server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(403).json({ message: "Invalid old password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);

    res.status(500).json({ message: "Server error" });
  }
};

// ============ GET USER SETTINGS ============
export const getUserSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("settings");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // اگر تنظیمات وجود نداشت، مقدار پیش‌فرض برگردان
    const settings = user.settings || {
      notifications: {
        taskAssignments: true,
        taskUpdates: true,
        projectUpdates: true,
        workspaceInvites: true,
        emailNotifications: true,
      },
      appearance: {
        theme: "system",
        compactView: false,
      },
    };

    res.status(200).json(settings);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============ UPDATE USER SETTINGS ============
export const updateUserSettings = async (req, res) => {
  try {
    const { notifications, appearance } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // اگر تنظیمات وجود نداشت، ایجاد کن
    if (!user.settings) {
      user.settings = {};
    }

    // به‌روزرسانی تنظیمات
    if (notifications) {
      user.settings.notifications = {
        ...user.settings.notifications,
        ...notifications,
      };
    }

    if (appearance) {
      user.settings.appearance = {
        ...user.settings.appearance,
        ...appearance,
      };
    }

    await user.save();

    res.status(200).json({
      message: "Settings updated successfully",
      settings: user.settings,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { getUserProfile, updateUserProfile, changePassword };