import Layout from "@/components/layout";
import axios from "axios";
import { useEffect, useState } from "react";

const Categories = () => {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    fetchCategories()
  }, []);
  function fetchCategories() {
    axios.get("/api/categories").then((response) => {
        setCategories(response.data);
      });
  }
  async function saveCategory(e) {
    e.preventDefault();
    await axios.post("/api/categories", { name });
    setName("");
    fetchCategories()
  }
  return (
    <Layout>
      <h1>Categories</h1>
      <label> NewCategory Name</label>
      <form onSubmit={saveCategory} className="flex gap-1">
        <input
          className="!mb-0"
          type="text"
          placeholder={"Category name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Save
        </button>
      </form>
      <table className="basic mt-4">
        <thead>
          <tr>
            <td>Category</td>
          </tr>
        </thead>
        <tbody>
          {categories.length > 0 &&
            categories.map((category) => (
              <tr key={category._id}>
                <td>{category.name}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default Categories;
