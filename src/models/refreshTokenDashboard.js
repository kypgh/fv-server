import mongoose from "mongoose";
const { Schema } = mongoose;

const RefreshTokenDashboardSchema = new Schema(
  {
    token: String,
    crmUser: { type: mongoose.Schema.Types.ObjectId, ref: "CrmUser" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "DashboardRefreshToken",
  RefreshTokenDashboardSchema
);
