import Layout from "@/components/layout";
import axios from "axios";
import React, { useState } from "react";

const NewProduct = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const createProduct = async (e) => {
    e.preventDefault();
    const data = { title, description, price };
    await axios.post("/api/products", data);
  };
  return (
    <Layout>
      <h1>New Product</h1>
      <form onSubmit={createProduct}>
        <label>Product Name</label>
        <input
          type="text"
          placeholder="product name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label>Description</label>
        <textarea
          placeholder="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label>Price(in USD)</label>
        <input
          type="number"
          placeholder="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button className="btn-primary" type="submit">
          Save
        </button>
      </form>
    </Layout>
  );
};

export default NewProduct;
