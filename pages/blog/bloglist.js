import Layout from "@/components/layout";
import { fetchFromBackend } from "@/lib/fetchfromBackend";
import { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { PlusCircle, EllipsisVertical } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const BlogMenu = ({ blog, onPublish, onDelete }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button className="btn-default p-1.5">
        <EllipsisVertical className="w-4 h-4" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-36 p-1" align="end">
      <Link
        href={`/blog/${blog._id}`}
        className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm hover:bg-gray-100"
      >
        Edit
      </Link>
      <button
        onClick={() => onPublish(blog)}
        className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm hover:bg-gray-100"
      >
        {blog.isPublished ? "Unpublish" : "Publish"}
      </button>
      <button
        onClick={() => onDelete(blog)}
        className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </PopoverContent>
  </Popover>
);

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    setLoading(true);
    try {
      const result = await fetchFromBackend("blogs/admin/get-all");
      setBlogs(result?.data?.blogs || []);
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish(blog) {
    try {
      await fetchFromBackend(`blogs/${blog._id}/publish`, { method: "PATCH" });
      Swal.fire({
        title: blog.isPublished ? "Unpublished" : "Published",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchBlogs();
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    }
  }

  async function confirmDelete(blog) {
    withReactContent(Swal)
      .fire({
        text: `Delete "${blog.title}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1e3a8a",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await fetchFromBackend(`blogs/${blog._id}`, { method: "DELETE" });
            Swal.fire({
              title: "Deleted!",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });
            fetchBlogs();
          } catch (err) {
            Swal.fire({ title: "Error", text: err.message, icon: "error" });
          }
        }
      });
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="!mb-0">Blogs</h1>
        <Link
          href="/blog/create"
          className="btn-primary flex items-center gap-1"
        >
          <PlusCircle className="w-4 h-4" />
          New Blog
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No blogs found. Create your first blog.
        </p>
      ) : (
        <table className="basic mt-2">
          <thead>
            <tr>
              <td>Title</td>
              <td>Categories</td>
              <td>Tags</td>
              <td>Featured</td>
              <td>Status</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog._id}>
                <td>
                  <div className="font-medium text-sm text-gray-800">
                    {blog.title}
                  </div>
                  {blog.excerpt && (
                    <div className="text-xs text-gray-400 truncate max-w-xs">
                      {blog.excerpt}
                    </div>
                  )}
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {(blog.categories || []).map((c) => (
                      <span
                        key={c}
                        className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {(blog.tags || []).map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      blog.isFeatured
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {blog.isFeatured ? "Featured" : "No"}
                  </span>
                </td>
                <td>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      blog.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {blog.status}
                  </span>
                </td>
                <td>
                  <BlogMenu
                    blog={blog}
                    onPublish={handlePublish}
                    onDelete={confirmDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
