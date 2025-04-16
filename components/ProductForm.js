import axios from "axios";
import { set } from "mongoose";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Spinner from "./spinner";

const ProductForm = ({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: existingCategory,
  properties: existingProperties,
}) => {
  const [title, setTitle] = useState(existingTitle || "");
  const [description, setDescription] = useState(existingDescription || "");
  const [price, setPrice] = useState(existingPrice || "");
  const [images, setImages] = useState(existingImages || []);
  const [category, setCategory] = useState(existingCategory || "");
  const [goToProduct, setGoToProduct] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [productProperties, setProductProperties] = useState(
    existingProperties || {}
  );

  const router = useRouter();
  useEffect(() => {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }, []);
  const saveProduct = async (e) => {
    e.preventDefault();
    const data = {
      title,
      description,
      price,
      images,
      category,
      properties: productProperties,
    };
    if (_id) {
      await axios.put("/api/products", { ...data, _id });
    } else {
      await axios.post("/api/products", data);
    }
    setGoToProduct(true);
  };
  if (goToProduct) {
    router.push("/products");
  }
  async function uploadImages(e) {
    const files = e.target?.files;
    if (files.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append("file", file);
      }
      const res = await axios.post("/api/upload", data);
      setImages(() => {
        return [...images, ...res.data.links];
      });
      setIsUploading(false);
    }
  }
  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);

    propertiesToFill.push(...catInfo.properties);
    while (catInfo?.parent?.id) {
      const parentCat = categories.find(
        ({ _id }) => _id === catInfo?.parent?.id
      );
      propertiesToFill.push(...parentCat.properties);
      catInfo = parentCat;
    }
  }
  function setProductProp(propName, value) {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  }
  return (
    <form onSubmit={saveProduct}>
      <label>Product Name</label>
      <input
        type="text"
        placeholder="product name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <label>Category</label>
      <select
        className="!mb-0"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">UnCategorized</option>
        {categories.length > 0 &&
          categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
      </select>
      {propertiesToFill.length > 0 &&
        propertiesToFill.map((p, index) => (
          <div key={index}>
            <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
            <div>
              <select
                value={productProperties[p.name]}
                onChange={(e) => setProductProp(p.name, e.target.value)}
              >
                {p.values.map((v, index) => (
                  <option value={v} key={index}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      <label>Product Image</label>
      <div className="mb-2 flex flex-wrap gap-1">
        {!!images?.length &&
          images.map((link) => (
            <div
              key={link}
              className="inline-block h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200"
            >
              <Image
                src={link}
                alt="product image"
                className="rounded-lg"
                // width={96}
                // height={96}
              />
            </div>
          ))}
        {isUploading && (
          <div className="h-24 bg-gray-200 p-1 flex items-center">
            <Spinner />
          </div>
        )}
        <label className=" w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-blue-500 rounded-lg bg-white shadow-sm border border-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>Add Image</div>
          <input type="file" className="hidden" onChange={uploadImages} />
        </label>
      </div>

      <label>Description</label>
      <textarea
        placeholder="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <label>Price(in USD)</label>
      <input
        type="number"
        placeholder="price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <button className="btn-primary" type="submit">
        Save
      </button>
    </form>
  );
};

export default ProductForm;
