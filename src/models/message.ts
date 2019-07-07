import mongoose from "mongoose";

export interface IMessageDocument extends mongoose.Document {
  text: string;
  userId: string;
};

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true
  }
);

const Message = mongoose.model<IMessageDocument>("Message", messageSchema);

export default Message;
