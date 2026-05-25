import Layout from "@/components/layout";
import { fetchFromBackend } from "@/lib/fetchfromBackend";
import { useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { Upload, X, Loader2 } from "lucide-react";
import { z } from "zod";

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  coverImage: z.string().url("Cover image must be a valid URL").or(z.literal("")).optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
});

const emptyForm = {
  title: "",
  content: "",
  excerpt: "",
  coverImage: "",
  images: [],
  tags: [],
  categories: [],
  isFeatured: false,
};

export default function CreateBlog() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");

  function handleField(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function uploadFile(e, field, setUploading) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of files) formData.append("image", file);
      const res = await fetchFromBackend("products/upload-images", {
        method: "POST",
        body: formData,
      });
      const urls = res.data.map((item) => item.url);
      if (field === "coverImage") {
        setForm((prev) => ({ ...prev, coverImage: urls[0] || "" }));
      } else {
        setForm((prev) => ({ ...prev, images: [...(prev.images || []), ...urls] }));
      }
      e.target.value = "";
    } catch (err) {
      Swal.fire({ title: "Upload failed", text: err.message, icon: "error" });
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  }

  function addTag(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !form.tags.includes(tag)) {
        setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      setTagInput("");
    }
  }

  function removeTag(tag) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  }

  function addCategory(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const cat = categoryInput.trim();
      if (cat && !form.categories.includes(cat)) {
        setForm((prev) => ({ ...prev, categories: [...prev.categories, cat] }));
      }
      setCategoryInput("");
    }
  }

  function removeCategory(cat) {
    setForm((prev) => ({ ...prev, categories: prev.categories.filter((c) => c !== cat) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const result = blogSchema.safeParse(form);
    if (!result.success) {
      const flat = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path.join(".");
        if (!flat[key]) flat[key] = issue.message;
      });
      setErrors(flat);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await fetchFromBackend("blogs/create", {
        method: "POST",
        body: JSON.stringify(result.data),
      });
      Swal.fire({ title: "Success", text: "Blog created successfully.", icon: "success" });
      router.push("/blog/bloglist");
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="!mb-0">Create Blog</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-md shadow-sm p-6 space-y-4">
        {/* Title */}
        <div>
          <label>Title <span className="text-red-500">*</span></label>
          <input
            name="title"
            value={form.title}
            onChange={handleField}
            placeholder="Blog title"
          />
          {errors.title && <p className="text-red-500 text-xs -mt-1 mb-2">{errors.title}</p>}
        </div>

        {/* Excerpt */}
        <div>
          <label>Excerpt <span className="text-red-500">*</span></label>
          <textarea
            name="excerpt"
            value={form.excerpt}
            onChange={handleField}
            rows={2}
            placeholder="Short summary of the blog"
          />
          {errors.excerpt && <p className="text-red-500 text-xs -mt-1 mb-2">{errors.excerpt}</p>}
        </div>

        {/* Content */}
        <div>
          <label>Content <span className="text-red-500">*</span></label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleField}
            rows={8}
            placeholder="Write your blog content here..."
          />
          {errors.content && <p className="text-red-500 text-xs -mt-1 mb-2">{errors.content}</p>}
        </div>

        {/* Cover Image */}
        <div>
          <label>Cover Image</label>
          <div className="flex gap-2 items-center mb-2">
            <input
              name="coverImage"
              value={form.coverImage}
              onChange={handleField}
              placeholder="https://..."
              className="!mb-0"
            />
            <label className="btn-default cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0">
              {uploadingCover ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => uploadFile(e, "coverImage", setUploadingCover)}
              />
            </label>
          </div>
          {form.coverImage && (
            <div className="relative inline-block">
              <img
                src={form.coverImage}
                alt="cover"
                className="h-32 w-48 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, coverImage: "" }))}
                className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow"
              >
                <X className="w-3 h-3 text-red-500" />
              </button>
            </div>
          )}
          {errors.coverImage && <p className="text-red-500 text-xs mt-1">{errors.coverImage}</p>}
        </div>

        {/* Additional Images */}
        <div>
          <label>Additional Images</label>
          <label className="btn-default cursor-pointer flex items-center gap-1 w-fit mb-2">
            {uploadingImages ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload Images
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => uploadFile(e, "images", setUploadingImages)}
            />
          </label>
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.images.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt="" className="h-20 w-28 object-cover rounded border" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow"
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label>Tags</label>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="Type tag and press Enter or comma"
          />
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 -mt-1 mb-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div>
          <label>Categories</label>
          <input
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onKeyDown={addCategory}
            placeholder="Type category and press Enter or comma"
          />
          {form.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 -mt-1 mb-2">
              {form.categories.map((cat) => (
                <span
                  key={cat}
                  className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                >
                  {cat}
                  <button type="button" onClick={() => removeCategory(cat)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center gap-3">
          <label className="!mb-0">Featured</label>
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.isFeatured ? "bg-blue-900" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                form.isFeatured ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm text-gray-500">{form.isFeatured ? "Yes" : "No"}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => router.push("/blog/bloglist")}
            className="btn-default"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Publish Blog
          </button>
        </div>
      </form>
    </Layout>
  );
}
