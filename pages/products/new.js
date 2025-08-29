import Layout from "@/components/layout";
import ProductForm from "@/components/ProductForm";

const NewProduct = () => {
  return (
    <Layout>
      <h1 className="text-2xl sticky top-0 bg-white z-10">New Product</h1>
      <ProductForm />
    </Layout>
  );
};

export default NewProduct;
