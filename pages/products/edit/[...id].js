import Layout from "@/components/layout";
import { useRouter } from "next/router";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = router.query;
  return <Layout>Edit product form </Layout>;
}
