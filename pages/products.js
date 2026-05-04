import Layout from "@/components/layout";
import { fetchFromBackend } from "@/lib/fetchfromBackend";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MoreVertical, Eye, Trash2, Plus } from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    fetchFromBackend("products/get-all").then((res) => {
      setProducts(res.data);
    });
  }, []);

  useEffect(() => {
    if (openMenuId === null) return;
    function handleClick() {
      setOpenMenuId(null);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openMenuId]);

  const ActionMenu = ({ product }) => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId(openMenuId === product._id ? null : product._id);
        }}
        className="p-1 rounded hover:bg-gray-100"
      >
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>

      {openMenuId === product._id && (
        <div className="absolute right-0 top-8 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-20">
          <Link
            href={"/products/edit/" + product._id}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpenMenuId(null)}
          >
            <Eye className="w-4 h-4" />
            View
          </Link>
          <Link
            href={"/products/delete/" + product._id}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={() => setOpenMenuId(null)}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="mb-0">Products</h1>
        <Link href={"/products/new"} className="btn-primary flex items-center gap-1">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add new product</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <table className="basic">
          <thead>
            <tr>
              <td>Product Name</td>
              <td>SKU</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td className="text-gray-500 text-sm">{product.sku}</td>
                <td className="relative w-10">
                  <ActionMenu product={product} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden flex flex-col gap-3">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-3 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-gray-800 text-sm">{product.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{product.sku}</p>
            </div>
            <ActionMenu product={product} />
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Products;
