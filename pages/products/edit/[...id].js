import Layout from "@/components/layout";
import ProductForm from "@/components/ProductForm";
import { fetchFromBackend } from "@/lib/fetchfromBackend";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function EditProductPage() {
  const [productInfo, setProductInfo] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
    fetchFromBackend("products/" + id).then((res) => {
      console.log("Product info:", res.data);
      setProductInfo(res.data);
    });
  }, [id]);
  return (
    <Layout>
      <h1>Edit Product</h1>
      {productInfo && <ProductForm _id={id} initialData={productInfo} />}
    </Layout>
  );
}
