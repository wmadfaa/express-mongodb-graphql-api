import mongoose from "mongoose";

import User from "./user";
import Message, { IMessageDocument } from "./message";
import { IUserDocument } from "./user";

export interface IModels {
  User: mongoose.Model<IUserDocument, {}>;
  Message: mongoose.Model<IMessageDocument, {}>;
}

const connectDb = () => {
  if (process.env.TEST_DATABASE_URL) {
    return mongoose.connect(process.env.TEST_DATABASE_URL, {
      useNewUrlParser: true
    });
  }

  if (process.env.DATABASE_URL) {
    return mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true
    });
  }
};

const models: IModels = { User, Message };

export { connectDb };

export default models;
