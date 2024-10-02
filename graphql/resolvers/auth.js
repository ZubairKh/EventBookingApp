const bcrypt = require("bcryptjs");
const User = require("../../models/user");
const { transformUser } = require("./merge");
const jwt = require("jsonwebtoken");

module.exports = {
  users: async () => {
    try {
      const allUsers = await User.find();
      return allUsers.map((user) => {
        return transformUser(user);
      });
    } catch (error) {
      throw error;
    }
  },
  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({
        email: args.userInput.email,
      });

      if (existingUser) {
        throw new Error("User exists already");
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const user = new User({
        email: args.userInput.email,
        password: hashedPassword,
      });
      const result = await user.save();
      return { ...result._doc, password: null };
    } catch (error) {
      throw error;
    }
  },
  login: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        throw new Error("Password is incorrect");
      }
      const token = await jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        "mysupersecretkey@232",
        {
          expiresIn: "1h",
        }
      );
      return { userId: user.id, token: token, tokenExpiration: 1 };
    } catch (error) {
      throw error;
    }
  },
};
