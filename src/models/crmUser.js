import mongoose from "mongoose";
const { Schema } = mongoose;
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const CrmuserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

CrmuserSchema.plugin(paginate);
CrmuserSchema.plugin(aggregatePaginate);

export default mongoose.model("CrmUser", CrmuserSchema);
