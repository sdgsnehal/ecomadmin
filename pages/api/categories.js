import Category from "@/lib/models/category";
import { mongooseConnect } from "@/lib/mongoose";

export default async function handler(req, res) {
  const { method } = req;
  await mongooseConnect();
  if (method === "GET") {
    res.json(await Category.find());
  }
  if (method === "POST") {
    const { name } = req.body;
    const categoryDoc = await Category.create({ name });
    res.json(categoryDoc);
  }
}
