import mongoose from "mongoose";
const { Schema } = mongoose;

const CrmUserRoleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    permissions: {
      type: [String],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("CrmUserRole", CrmUserRoleSchema);
