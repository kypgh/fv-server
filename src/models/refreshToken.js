import mongoose from "mongoose";
const { Schema } = mongoose;

const RefreshTokenSchema = new Schema(
  {
    token: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("RefreshToken", RefreshTokenSchema);
