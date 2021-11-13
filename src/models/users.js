const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Tasks = require("./tasks");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email not valid");
        }
      },
    },
    password: {
      type: String,
      trim: true,
      required: true,
      validate(value) {
        if (value === "password") {
          throw new Error("password as a password is not allowed");
        }
        if (value.length < 7) {
          throw new Error("passowrd should be greater than 6 digit");
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age needs to be greater than 0");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          require: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.virtual("task", {
  ref: "tasks",
  localField: "_id",
  foreignField: "owner",
});
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  // console.log(token);
  user.tokens = user.tokens.concat({ token });
  // user.t = token;
  await user.save();
  return token;
};

userSchema.statics.findByCredintials = async ({ email, password }) => {
  const user = await users.findOne({ email });
  if (!user) {
    throw new Error("Unable to Login");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  // console.log(password, user.password, isMatch);
  if (!isMatch) {
    throw new Error("Unable to Login");
  }
  return user;
};
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  console.log("Befor Save");
  next();
});
userSchema.pre("remove", async function (next) {
  await Tasks.deleteMany({ owner: this._id });
  next();
});

const users = mongoose.model("users", userSchema);

module.exports = users;
