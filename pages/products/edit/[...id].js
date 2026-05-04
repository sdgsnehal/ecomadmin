import Layout from "@/components/layout";
import ProductForm from "@/components/ProductForm";
import { fetchFromBackend } from "@/lib/fetchfromBackend";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";

export default function EditProductPage() {
  const [productInfo, setProductInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
    fetchFromBackend("products/" + id).then((res) => {
      setProductInfo(res.data);
    });
  }, [id]);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-2">
        <h1 className="mb-0">{isEditing ? "Edit Product" : "View Product"}</h1>
        {isEditing ? (
          <button
            onClick={() => setIsEditing(false)}
            className="btn-default flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      <div className={!isEditing ? "pointer-events-none opacity-60 select-none" : ""}>
        {productInfo && (
          <ProductForm _id={id} initialData={productInfo} readOnly={!isEditing} />
        )}
      </div>
    </Layout>
  );
}
