import Layout from "@/components/layout";
import ProductForm from "@/components/ProductForm";

const NewProduct = () => {
  return (
    <Layout>
      <h1 className="text-2xl">New Product</h1>
      <ProductForm />
    </Layout>
  );
};

export default NewProduct;
