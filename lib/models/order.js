import mongoose, { model, Schema, models } from "mongoose";
const OrderSchema = new Schema(
  {
    line_items: Object,
    name: String,
    postalCode: String,
    email: String,
    total: String,
    streetAddress: String,
    country: String,
    paid: Boolean,
  },
  { timestamps: true }
);
const Order = models?.Order || model("Order", OrderSchema);
export default Order;
