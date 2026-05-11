import Layout from "@/components/layout";
import { fetchFromBackend } from "@/lib/fetchfromBackend";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { EllipsisVertical, Upload, X, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { z } from "zod";

const sellerSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  name: z.string().min(1, "Owner name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Enter a valid phone number"),
  GSTNumber: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GSTIN (e.g. 27AAAAA0000A1Z5)",
    )
    .or(z.literal(""))
    .optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  rating: z.coerce.number().min(0, "Min 0").max(5, "Max 5"),
  bankDetails: z.object({
    accountHolderName: z.string().min(1, "Account holder name is required"),
    bankName: z.string().min(1, "Bank name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  }),
  profileImages: z.array(z.string()).optional(),
  productImages: z.array(z.string()).optional(),
});

const emptySeller = {
  name: "",
  email: "",
  phone: "",
  businessName: "",
  GSTNumber: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  bankDetails: {
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  },
  rating: 0,
  profileImages: [],
  productImages: [],
};

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Puducherry",
];

const SellerMenu = ({ seller, confirmDelete }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button className="btn-default p-1.5">
        <EllipsisVertical className="w-4 h-4" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-36 p-1" align="end">
      <Link
        href={`/sellers/${seller._id}`}
        className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm hover:bg-gray-100"
      >
        View
      </Link>
      <button
        onClick={() => confirmDelete(seller)}
        className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </PopoverContent>
  </Popover>
);

const Sellers = () => {
  const [sellers, setSellers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editedSeller, setEditedSeller] = useState(null);
  const [form, setForm] = useState(emptySeller);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingProduct, setUploadingProduct] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, []);

  async function fetchSellers() {
    try {
      const result = await fetchFromBackend("sellers/get-all");
      setSellers(result.data);
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    }
  }

  function openAdd() {
    setEditedSeller(null);
    setForm(emptySeller);
    setErrors({});
    setShowForm(true);
  }

  function handleField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleBankField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [name]: value },
    }));
    setErrors((prev) => ({ ...prev, [`bankDetails.${name}`]: undefined }));
  }

  async function uploadImages(e, field, setUploading) {
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
      setForm((prev) => ({
        ...prev,
        [field]: [...(prev[field] || []), ...urls],
      }));
      e.target.value = "";
    } catch (err) {
      Swal.fire({ title: "Upload failed", text: err.message, icon: "error" });
    } finally {
      setUploading(false);
    }
  }

  function removeImage(field, index) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  }

  async function saveSeller(e) {
    e.preventDefault();

    const result = sellerSchema.safeParse(form);
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
      const body = JSON.stringify(result.data);
      if (editedSeller) {
        await fetchFromBackend(`sellers/${editedSeller._id}`, {
          method: "PUT",
          body,
        });
      } else {
        await fetchFromBackend("sellers/create", {
          method: "POST",
          body,
        });
      }
      await fetchSellers();
      setShowForm(false);
      setEditedSeller(null);
      setForm(emptySeller);
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    } finally {
      setLoading(false);
    }
  }

  function cancel() {
    setShowForm(false);
    setEditedSeller(null);
    setForm(emptySeller);
    setErrors({});
  }

  function confirmDelete(seller) {
    withReactContent(Swal)
      .fire({
        text: `Delete seller "${seller.businessName}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await fetchFromBackend(`sellers/${seller._id}`, {
              method: "DELETE",
            });
            await fetchSellers();
            Swal.fire({ title: "Deleted!", icon: "success" });
          } catch (err) {
            Swal.fire({ title: "Error", text: err.message, icon: "error" });
          }
        }
      });
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="!mb-0">Sellers</h1>
        {!showForm && (
          <button onClick={openAdd} className="btn-primary">
            + Add Seller
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-gray-700 font-semibold text-base mb-4">
            {editedSeller
              ? `Edit — ${editedSeller.businessName}`
              : "New Seller"}
          </h2>
          <form onSubmit={saveSeller}>
            {/* Basic Info */}
            <p className="text-xs font-semibold uppercase text-gray-400 mb-2 tracking-wide">
              Basic Info
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <div>
                <label>Business Name *</label>
                <input
                  name="businessName"
                  value={form.businessName}
                  onChange={handleField}
                  placeholder="e.g. Sharma Traders"
                />
                {errors.businessName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.businessName}
                  </p>
                )}
              </div>
              <div>
                <label>GST Number</label>
                <input
                  name="GSTNumber"
                  value={form.GSTNumber}
                  onChange={handleField}
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  maxLength={15}
                />
                {errors.GSTNumber && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.GSTNumber}
                  </p>
                )}
              </div>
              <div>
                <label>Owner / Contact Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleField}
                  placeholder="Full name"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleField}
                  placeholder="seller@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label>Phone *</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleField}
                  placeholder="+91 98765 43210"
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>
              <div>
                <label>Rating (0–5)</label>
                <input
                  type="number"
                  name="rating"
                  value={form.rating}
                  onChange={handleField}
                  min={0}
                  max={5}
                  step={0.1}
                />
                {errors.rating && (
                  <p className="text-xs text-red-500 mt-1">{errors.rating}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <p className="text-xs font-semibold uppercase text-gray-400 mb-2 mt-4 tracking-wide">
              Address
            </p>
            <div>
              <label>Street Address *</label>
              <input
                name="address"
                value={form.address}
                onChange={handleField}
                placeholder="Building / Street"
              />
              {errors.address && (
                <p className="text-xs text-red-500 mt-1">{errors.address}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
              <div>
                <label>City *</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleField}
                  placeholder="Mumbai"
                />
                {errors.city && (
                  <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <label>State *</label>
                <select name="state" value={form.state} onChange={handleField}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-xs text-red-500 mt-1">{errors.state}</p>
                )}
              </div>
              <div>
                <label>Pincode *</label>
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleField}
                  placeholder="400001"
                  maxLength={6}
                />
                {errors.pincode && (
                  <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>
                )}
              </div>
            </div>

            {/* Bank Details */}
            <p className="text-xs font-semibold uppercase text-gray-400 mb-2 mt-4 tracking-wide">
              Bank Details
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <div>
                <label>Account Holder Name *</label>
                <input
                  name="accountHolderName"
                  value={form.bankDetails.accountHolderName}
                  onChange={handleBankField}
                  placeholder="As per bank records"
                />
                {errors["bankDetails.accountHolderName"] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors["bankDetails.accountHolderName"]}
                  </p>
                )}
              </div>
              <div>
                <label>Bank Name *</label>
                <input
                  name="bankName"
                  value={form.bankDetails.bankName}
                  onChange={handleBankField}
                  placeholder="State Bank of India"
                />
                {errors["bankDetails.bankName"] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors["bankDetails.bankName"]}
                  </p>
                )}
              </div>
              <div>
                <label>Account Number *</label>
                <input
                  name="accountNumber"
                  value={form.bankDetails.accountNumber}
                  onChange={handleBankField}
                  placeholder="1234567890"
                />
                {errors["bankDetails.accountNumber"] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors["bankDetails.accountNumber"]}
                  </p>
                )}
              </div>
              <div>
                <label>IFSC Code *</label>
                <input
                  name="ifscCode"
                  value={form.bankDetails.ifscCode}
                  onChange={handleBankField}
                  placeholder="SBIN0001234"
                  maxLength={11}
                />
                {errors["bankDetails.ifscCode"] && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors["bankDetails.ifscCode"]}
                  </p>
                )}
              </div>
            </div>

            {/* Images */}
            <p className="text-xs font-semibold uppercase text-gray-400 mb-2 mt-4 tracking-wide">
              Images
            </p>
            {[
              {
                label: "Profile Images",
                field: "profileImages",
                uploading: uploadingProfile,
                setUploading: setUploadingProfile,
              },
              {
                label: "Product Images",
                field: "productImages",
                uploading: uploadingProduct,
                setUploading: setUploadingProduct,
              },
            ].map(({ label, field, uploading, setUploading }) => (
              <div key={field} className="mb-4">
                <label className="mb-1 block">{label}</label>
                <div className="flex flex-wrap gap-3">
                  {(form[field] || []).map((url, i) => (
                    <div key={i} className="relative group w-24 h-24">
                      <Image
                        src={url}
                        alt={label}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(field, i)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {uploading && (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  )}
                  <label className="w-24 h-24 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-xs text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
                    <Upload className="w-4 h-4 mb-1" />
                    <span>Upload</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => uploadImages(e, field, setUploading)}
                    />
                  </label>
                </div>
              </div>
            ))}

            <div className="flex gap-2 mt-4">
              <button type="button" onClick={cancel} className="btn-default">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading
                  ? "Saving..."
                  : editedSeller
                    ? "Update Seller"
                    : "Save Seller"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="basic mt-2">
              <thead>
                <tr>
                  <td>Business</td>
                  <td>Owner</td>
                  <td>Contact</td>
                  <td>GST</td>
                  <td>Location</td>
                  <td>Rating</td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {sellers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-400 py-8">
                      No sellers yet. Click &quot;+ Add Seller&quot; to get
                      started.
                    </td>
                  </tr>
                )}
                {sellers.map((seller) => (
                  <tr key={seller._id}>
                    <td className="font-medium">{seller.businessName}</td>
                    <td>{seller.name}</td>
                    <td>
                      <div className="text-sm">{seller.email}</div>
                      <div className="text-xs text-gray-400">
                        {seller.phone}
                      </div>
                    </td>
                    <td className="text-sm font-mono">
                      {seller.GSTNumber || "—"}
                    </td>
                    <td className="text-sm">
                      {[seller.city, seller.state].filter(Boolean).join(", ") ||
                        "—"}
                    </td>
                    <td className="text-sm">
                      {seller.rating > 0 ? (
                        <span className="flex items-center gap-1">
                          &#9733; {Number(seller.rating).toFixed(1)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <SellerMenu
                        seller={seller}
                        confirmDelete={confirmDelete}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3 mt-2">
            {sellers.length === 0 && (
              <p className="text-center text-gray-400 py-8">
                No sellers yet. Click &quot;+ Add Seller&quot; to get started.
              </p>
            )}
            {sellers.map((seller) => (
              <div
                key={seller._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {seller.businessName}
                    </p>
                    <p className="text-xs text-gray-500">{seller.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {seller.rating > 0 && (
                      <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">
                        &#9733; {Number(seller.rating).toFixed(1)}
                      </span>
                    )}
                    <SellerMenu seller={seller} confirmDelete={confirmDelete} />
                  </div>
                </div>

                <div className="text-xs text-gray-600 space-y-0.5">
                  <p>{seller.email}</p>
                  <p>{seller.phone}</p>
                  <p>
                    {[seller.city, seller.state].filter(Boolean).join(", ") ||
                      "—"}
                  </p>
                  {seller.GSTNumber && (
                    <p className="font-mono text-gray-400">
                      {seller.GSTNumber}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
};

export default Sellers;
