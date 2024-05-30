import mongoose from "mongoose";
const { Schema } = mongoose;

const FpTokenSchema = new Schema({
  token: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const expirationTime = 60 * 60; // 1 hour

FpTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: expirationTime });

export default mongoose.model("FpToken", FpTokenSchema);
