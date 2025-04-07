import Layout from "@/components/layout";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const Categories = () => {
  const [editedCategory, setEditedCategory] = useState(null);
  const [name, setName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [inputValue, setInputValue] = useState("");
  useEffect(() => {
    fetchCategories();
  }, []);
  function fetchCategories() {
    axios.get("/api/categories").then((response) => {
      setCategories(response.data);
    });
  }
  async function saveCategory(e) {
    e.preventDefault();
    const data = { name, parentCategory };
    if (editedCategory) {
      axios.put("/api/categories", {
        ...data,
        _id: editedCategory._id,
      });
      setEditedCategory(null);
    } else {
      await axios.post("/api/categories", { data });
    }
    setName("");
    fetchCategories();
  }
  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id || "");
  }
  const showSwal = async (category) => {
    withReactContent(Swal)
      .fire({
        text: `Are you sure you want to delete ${category.name}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const { _id } = category;
          Swal.fire({
            title: "Deleted!",
            text: "Category has been deleted.",
            icon: "success",
          });
          await axios.delete("/api/categories?_id=" + _id);
          fetchCategories();
        }
      });
  };
  return (
    <Layout>
      <h1>Categories</h1>
      <label>
        {editedCategory
          ? `Edit category ${editedCategory.name}`
          : "Create New Category"}
      </label>
      <form onSubmit={saveCategory} className="flex gap-1">
        <input
          className="!mb-0"
          type="text"
          placeholder={"Category name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="!mb-0"
          value={parentCategory}
          onChange={(e) => setParentCategory(e.target.value)}
        >
          <option value="0">No Parent Category</option>
          {categories.length > 0 &&
            categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
        </select>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </form>
      <table className="basic mt-4">
        <thead>
          <tr>
            <td>Category</td>
            <td>Parent Category</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {categories.length > 0 &&
            categories.map((category) => (
              <tr key={category._id}>
                <td>{category.name}</td>
                <td>{category?.parent?.name}</td>
                <td>
                  <button
                    onClick={() => {
                      editCategory(category);
                    }}
                    className="btn-primary mr-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      showSwal(category);
                    }}
                    className="btn-primary"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default Categories;
