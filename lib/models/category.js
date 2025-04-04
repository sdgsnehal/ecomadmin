import mongoose, { Schema } from "mongoose";
const CategorySchema = new Schema({
  name: { type: String, required: true },
});
const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
export default Category;
