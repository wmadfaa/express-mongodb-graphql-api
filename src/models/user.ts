import mongoose from "mongoose";

import bcrypt from "bcrypt";
import isEmail from "validator/lib/isEmail";

export interface IUserDocument extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  role: string;
  generatePasswordHash: () => Promise<string>;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: [isEmail, "No valid email address provided."]
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    maxlength: 42
  },
  role: {
    type: String
  }
});

userSchema.statics.findByLogin = async function(login: string) {
  let user = await this.findOne({
    username: login
  });

  if (!user) {
    user = await this.findOne({ email: login });
  }

  return user;
};

userSchema.pre("remove", function(next) {
  this.model("Message").deleteMany({ userId: this._id }, next);
});

userSchema.pre("save", async function() {
  const user = this as IUserDocument;
  user.password = await user.generatePasswordHash();
});

userSchema.methods.generatePasswordHash = async function() {
  const saltRounds = 10;
  return await bcrypt.hash(this.password, saltRounds);
};

userSchema.methods.validatePassword = async function(password: string) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUserDocument>("User", userSchema);

export default User;
