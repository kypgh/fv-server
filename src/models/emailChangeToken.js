import mongoose from "mongoose";
const { Schema } = mongoose;

const EmailChangeTokenSchema = new Schema(
  {
    token: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("EmailChangeToken", EmailChangeTokenSchema);
