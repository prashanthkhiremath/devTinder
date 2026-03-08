const express = require("express");
const authRouter = express.Router();

const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/sendEmail");

authRouter.post("/signup", async (req, res) => {
  try {
    //validation of data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // encrypting password
    const passwordHash = await bcrypt.hash(password, 10);

    // creating nre instance of user model
    const user = new User({
      firstName,
      lastName,
      password: passwordHash,
      emailId,
    });
    const savedUser = await user.save();

    try {
      const welcomeHtml = `
        <div style="font-family: Arial, sans-serif; text-align: center; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h1 style="color: #E94057;">Welcome to the DevTinder Community!</h1>
          <p>Thanks for joining, <b>${user.firstName}</b>.</p>
          <p>You can now connect with thousands of senior engineers in Bengaluru and beyond.</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #777;">Domain: devtinderconnect.in</p>
        </div>
      `;

      await sendEmail(user.emailId, "Welcome to DevTinder!", welcomeHtml);
    } catch (emailErr) {
      console.error(
        "Welcome Email failed to send for:",
        user.emailId,
        "Error:",
        emailErr.message,
      );
    }
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true, // Prevents JavaScript from reading the cookie (XSS protection)
      secure: process.env.NODE_ENV === "production", // Only sends over HTTPS in prod
    });

    res.json({ message: "User Added successfully!", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      throw new Error("Invalid credentails");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send(user);
    } else {
      throw new Error("Invalid credentails");
    }
  } catch (err) {
    res.status(400).send("ERROR :" + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .send("Logout Successful!!");
});

module.exports = authRouter;
