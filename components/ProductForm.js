import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import Image from "next/image";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Upload, X, Plus } from "lucide-react";

import { fetchFromBackend } from "@/lib/fetchfromBackend";

// Zod schema based on your Product model
const weightOptionSchema = z.object({
  weight: z.string().min(1, "Weight is required"),
  originalPrice: z.string().min(1, "Original price is required"),
  currentPrice: z.string().min(1, "Current price is required"),
});

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  image: z.array(z.string()).min(1, "At least one image is required"),
  tags: z.array(z.string()).default([]),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().min(0).default(0),
  description: z.string().optional(),
  weights: z.array(weightOptionSchema).default([]),
  sku: z.string().min(1, "SKU is required"),
  categories: z.array(z.string()).default([]),
  detailedDescription: z.string().optional(),
  inStock: z.boolean().default(true),
  stockText: z.string().optional(),
  originalPrice: z.number().min(0, "Original price must be positive"),
  currentPrice: z.number().optional(),
  features: z.array(z.string()).default([]),
  salePrice: z.number().optional(),
  currency: z.string().default("$"),
  badge: z
    .object({
      text: z.string().optional(),
      bgColor: z.string().optional(),
      textColor: z.string().optional(),
    })
    .optional(),
  isBestSeller: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  isPromo: z.boolean().default(false),
  ladduTypes: z.string().optional(),
});

const ProductForm = ({ _id, initialData = {} }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTag, setCurrentTag] = useState("");
  const [currentFeature, setCurrentFeature] = useState("");
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      image: initialData?.image || [],
      tags: initialData?.tags || [],
      rating: initialData?.rating || 0,
      reviewCount: initialData?.reviewCount || 0,
      description: initialData?.description || "",
      weights: initialData?.weights || [],
      sku: initialData?.sku || "",
      categories: initialData?.categories || [],
      detailedDescription: initialData?.detailedDescription || "",
      inStock: initialData?.inStock ?? true,
      stockText: initialData?.stockText || "",
      originalPrice: initialData?.originalPrice || 0,
      currentPrice: initialData?.currentPrice,
      features: initialData?.features || [],
      salePrice: initialData?.salePrice,
      currency: initialData?.currency || "$",
      badge: initialData?.badge || { text: "", bgColor: "", textColor: "" },
      isBestSeller: initialData?.isBestSeller || false,
      isOnSale: initialData?.isOnSale || false,
      isPromo: initialData?.isPromo || false,
      ladduTypes: initialData?.ladduTypes || "",
    },
  });

  const { watch, setValue, getValues } = form;
  const watchedImages = watch("image");
  const watchedTags = watch("tags");
  const watchedFeatures = watch("features");
  const watchedWeights = watch("weights");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await axios.get("/api/categories");
        setCategories(result.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const uploadImages = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const data = new FormData();
      for (const file of files) {
        data.append("file", file);
      }
      const res = await axios.post("/api/upload", data);
      const newImages = [...watchedImages, ...res.data.links];
      setValue("image", newImages);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    const newImages = watchedImages.filter(
      (_, index) => index !== indexToRemove
    );
    setValue("image", newImages);
  };

  const addTag = () => {
    if (currentTag.trim() && !watchedTags.includes(currentTag.trim())) {
      setValue("tags", [...watchedTags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const addFeature = () => {
    if (
      currentFeature.trim() &&
      !watchedFeatures.includes(currentFeature.trim())
    ) {
      setValue("features", [...watchedFeatures, currentFeature.trim()]);
      setCurrentFeature("");
    }
  };

  const removeFeature = (featureToRemove) => {
    setValue(
      "features",
      watchedFeatures.filter((feature) => feature !== featureToRemove)
    );
  };

  const addWeightOption = () => {
    setValue("weights", [
      ...watchedWeights,
      { weight: "", originalPrice: "", currentPrice: "" },
    ]);
  };

  const updateWeightOption = (index, field, value) => {
    const newWeights = [...watchedWeights];
    newWeights[index] = { ...newWeights[index], [field]: value };
    setValue("weights", newWeights);
  };

  const removeWeightOption = (index) => {
    setValue(
      "weights",
      watchedWeights.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const endpoint = _id ? `/api/products/${_id}` : "products/create";
      const method = _id ? "PUT" : "POST";

      await fetchFromBackend(endpoint, {
        method,
        body: JSON.stringify(data),
      });

      router.push("/products");
    } catch (error) {
      console.error("Error saving product:", error.message);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter SKU" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter product description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="detailedDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter detailed description"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Product Images</h2>

              <div className="mb-4 flex flex-wrap gap-4">
                {watchedImages.map((link, index) => (
                  <div key={link} className="relative group">
                    <div className="w-24 h-24 bg-white p-2 shadow-sm rounded-lg border border-gray-200">
                      <Image
                        src={link}
                        alt="product image"
                        width={80}
                        height={80}
                        className="rounded-md object-cover w-full h-full"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                {isUploading && (
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}

                <Label className="w-24 h-24 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-sm text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors">
                  <Upload className="w-5 h-5 mb-1" />
                  <span>Add Image</span>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={uploadImages}
                  />
                </Label>
              </div>

              {form.formState.errors.image && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.image.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Categories and Tags */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Categories & Tags</h2>

              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value?.[0] || ""}
                        onValueChange={(value) =>
                          field.onChange(value ? [value] : [])
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Enter tag"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchedTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto w-auto ml-1"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Weight Options */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Pricing & Options</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <FormField
                  control={form.control}
                  name="originalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Price (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              parseFloat(e.target.value) || undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Price (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              parseFloat(e.target.value) || undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Weight Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Weight Options</Label>
                  <Button
                    type="button"
                    onClick={addWeightOption}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Weight Option
                  </Button>
                </div>

                {watchedWeights.map((weight, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-end p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <Label>Weight</Label>
                      <Input
                        value={weight.weight}
                        onChange={(e) =>
                          updateWeightOption(index, "weight", e.target.value)
                        }
                        placeholder="e.g., 500g, 1kg"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Original Price</Label>
                      <Input
                        value={weight.originalPrice}
                        onChange={(e) =>
                          updateWeightOption(
                            index,
                            "originalPrice",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Current Price</Label>
                      <Input
                        value={weight.currentPrice}
                        onChange={(e) =>
                          updateWeightOption(
                            index,
                            "currentPrice",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeWeightOption(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Features</h2>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={currentFeature}
                    onChange={(e) => setCurrentFeature(e.target.value)}
                    placeholder="Enter feature"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addFeature())
                    }
                  />
                  <Button type="button" onClick={addFeature} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {watchedFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span>{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(feature)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock & Status */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Stock & Status</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="inStock"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>In Stock</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stockText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Text</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Only 5 left in stock"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="isBestSeller"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Best Seller</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isOnSale"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>On Sale</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPromo"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Promotion</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ladduTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Laddu Types</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter laddu types" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Badge Configuration */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Badge Configuration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="badge.text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Badge Text</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., NEW, SALE" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="badge.bgColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Color</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., #ff0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="badge.textColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text Color</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., #ffffff" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Product"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProductForm;
