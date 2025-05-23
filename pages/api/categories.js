import Category from "@/lib/models/category";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);
  if (method === "GET") {
    res.json(await Category.find().populate("parent"));
  }
  if (method === "POST") {
    const { name, parentCategory, properties } = req.body;
    const categoryDoc = await Category.create({
      name,
      parent: parentCategory || undefined,
      properties,
    });
    res.json(categoryDoc);
  }
  if (method === "PUT") {
    const { name, _id, parentCategory, properties } = req.body;
    await Category.updateOne(
      { _id },
      { name, parent: parentCategory || undefined, properties }
    );
    res.json(true);
  }
  if (method === "DELETE") {
    const { _id } = req.query;
    await Category.deleteOne({ _id });
    res.json(true);
  }
}
