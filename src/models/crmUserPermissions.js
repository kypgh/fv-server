import mongoose from "mongoose";
const { Schema } = mongoose;

const CrmUserPermissionsSchema = new Schema(
  {
    permissions: {
      type: [String],
      required: true,
      default: [],
    },
    isSuspened: {
      type: Boolean,
      required: true,
      default: false,
    },
    crmUser: {
      type: Schema.Types.ObjectId,
      ref: "CrmUser",
      required: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "CrmUserRole",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("CrmUserPermissions", CrmUserPermissionsSchema);
