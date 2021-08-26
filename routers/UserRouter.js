const router = require("express").Router();
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  try {
    const { email, password, passwordVerify } = req.body;

    //validations
    if (!email || !password || !passwordVerify) {
      return res.status(400).json({
        errorMessage: "Please enter all fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        errorMessage: "Please enter password of atleast 6 characters",
      });
    }

    if (password !== passwordVerify) {
      return res.status(400).json({
        errorMessage: "Password verify must be same aspassword",
      });
    }

    const existingUser = await User.findOne({
      email: email,
    });

    if (existingUser) {
      return res.status(400).json({
        errorMessage: "The user with this email already exists.",
      });
    }

    //password hashing
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    //save new user
    const newUser = new User({
      email: email,
      passwordHash: passwordHash,
    });

    const savedUser = await newUser.save();

    //log in user
    const token = jwt.sign(
      {
        user: savedUser._id,
      },
      process.env.JWT_SECRET
    );

    //send token in HTTP cookie
    res
      .cookie("token", token, {
        httpOnly: true,
      })
      .send();
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

//login

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //validations
    if (!email || !password) {
      return res.status(400).json({
        errorMessage: "Please enter all fields",
      });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({
        errorMessage: "Wrong email or password",
      });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        errorMessage: "Wrong email or password",
      });
    }

    const token = jwt.sign(
      {
        user: existingUser._id,
      },
      process.env.JWT_SECRET
    );

    //send token in HTTP cookie
    res
      .cookie("token", token, {
        httpOnly: true,
      })
      .send();
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

router.get("/logout", (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .send();
});

router.get("/logged-in", (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json(false);
    }
    jwt.verify(token, process.env.JWT_SECRET);
    res.send(true);
  } catch (error) {
    res.json(false);
  }
});

module.exports = router;
