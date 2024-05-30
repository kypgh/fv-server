import mongoose from "mongoose";
const { Schema } = mongoose;
import { SYMBOL_TAGS_CATEGORIES } from "config/enums";

const SymbolTagsSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, enum: SYMBOL_TAGS_CATEGORIES },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SymbolTags", SymbolTagsSchema);
