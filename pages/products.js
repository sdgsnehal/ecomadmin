import Layout from "@/components/layout";
import Link from "next/link";
import React from "react";

const products = () => {
  return <Layout>
    <Link href={"/products/new"} className="bg-blue-900 text-black py-2 px-2 rounded-md"> Add new products</Link>
  </Layout>;
};

export default products;
