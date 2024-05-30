import mongoose from "mongoose";
import bcrypt from "bcrypt";
const { Schema } = mongoose;
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const UsersSchema = new Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    userName: { type: String },
    avatar: { type: String },
    description: { type: String },
    socialMediaLinks: { type: [{ name: String, link: String }] },
    isVerified: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      default: new Date(),
    },
  },
  {
    timestamps: true,
  }
);

UsersSchema.methods.comparePassword = async function (password) {
  try {
    const isMatch = await bcrypt.compare(password, this.password);
    return isMatch;
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

UsersSchema.plugin(paginate);
UsersSchema.plugin(aggregatePaginate);

export default mongoose.model("Users", UsersSchema);
