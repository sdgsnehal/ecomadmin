import Product from "@/lib/models/product";
import { mongooseConnect } from "@/lib/mongoose";

export default async function handler(req, res) {
  const { method } = req;
  await mongooseConnect();
  if (method === "GET") {
    res.json(await Product.find());
  }
  if (method === "POST") {
    const { title, description, price } = req.body;
    const productDoc = await Product.create({ title, description, price });
    res.json(productDoc);
  }
}
