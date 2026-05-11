import Layout from "@/components/layout";
import { fetchFromBackend } from "@/lib/fetchfromBackend";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry",
];

const ViewSeller = () => {
  const router = useRouter();
  const { id } = router.query;
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingProduct, setUploadingProduct] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchFromBackend(`sellers/${id}`)
      .then((res) => {
        setSeller(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  function startEdit() {
    setForm({
      name: seller.name || "",
      email: seller.email || "",
      phone: seller.phone || "",
      businessName: seller.businessName || "",
      GSTNumber: seller.GSTNumber || "",
      address: seller.address || "",
      city: seller.city || "",
      state: seller.state || "",
      pincode: seller.pincode || "",
      bankDetails: {
        accountHolderName: seller.bankDetails?.accountHolderName || "",
        accountNumber: seller.bankDetails?.accountNumber || "",
        ifscCode: seller.bankDetails?.ifscCode || "",
        bankName: seller.bankDetails?.bankName || "",
      },
      profileImages: seller.profileImages || [],
      productImages: seller.productImages || [],
    });
    setEditing(true);
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
      setForm((prev) => ({ ...prev, [field]: [...(prev[field] || []), ...urls] }));
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

  function cancelEdit() {
    setEditing(false);
    setForm(null);
  }

  function handleField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleBankField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [name]: value },
    }));
  }

  async function saveEdit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { name, email, phone, businessName, GSTNumber, address, city, state, pincode, bankDetails, profileImages, productImages } = form;
      const res = await fetchFromBackend(`sellers/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name, email, phone, businessName, GSTNumber, address, city, state, pincode, bankDetails, profileImages, productImages }),
      });
      setSeller(res.data ?? { ...seller, ...form });
      setEditing(false);
      setForm(null);
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-400">Loading...</p>
      </Layout>
    );
  }

  if (!seller) {
    return (
      <Layout>
        <p className="text-gray-500">Seller not found.</p>
        <button onClick={() => router.push("/sellers")} className="btn-default mt-4">
          Back to Sellers
        </button>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="!mb-0">{seller.businessName}</h1>
          <div className="flex gap-2">
            {!editing && (
              <button onClick={startEdit} className="btn-primary">
                Edit
              </button>
            )}
            <button onClick={() => router.push("/sellers")} className="btn-default">
              ← Back
            </button>
          </div>
        </div>

        {editing ? (
          /* ── EDIT FORM ── */
          <form onSubmit={saveEdit}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <p className="text-xs font-semibold uppercase text-gray-400 tracking-wide mb-4">
                Basic Info
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <div>
                  <label>Business Name *</label>
                  <input name="businessName" value={form.businessName} onChange={handleField} required />
                </div>
                <div>
                  <label>GST Number</label>
                  <input name="GSTNumber" value={form.GSTNumber} onChange={handleField} maxLength={15} placeholder="22AAAAA0000A1Z5" />
                </div>
                <div>
                  <label>Owner / Contact Name *</label>
                  <input name="name" value={form.name} onChange={handleField} required />
                </div>
                <div>
                  <label>Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleField} required />
                </div>
                <div>
                  <label>Phone *</label>
                  <input name="phone" value={form.phone} onChange={handleField} required />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <p className="text-xs font-semibold uppercase text-gray-400 tracking-wide mb-4">
                Address
              </p>
              <div>
                <label>Street Address</label>
                <input name="address" value={form.address} onChange={handleField} placeholder="Building / Street" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                <div>
                  <label>City</label>
                  <input name="city" value={form.city} onChange={handleField} placeholder="Mumbai" />
                </div>
                <div>
                  <label>State</label>
                  <select name="state" value={form.state} onChange={handleField}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Pincode</label>
                  <input name="pincode" value={form.pincode} onChange={handleField} maxLength={6} placeholder="400001" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <p className="text-xs font-semibold uppercase text-gray-400 tracking-wide mb-4">
                Bank Details
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <div>
                  <label>Account Holder Name</label>
                  <input name="accountHolderName" value={form.bankDetails.accountHolderName} onChange={handleBankField} placeholder="As per bank records" />
                </div>
                <div>
                  <label>Bank Name</label>
                  <input name="bankName" value={form.bankDetails.bankName} onChange={handleBankField} placeholder="State Bank of India" />
                </div>
                <div>
                  <label>Account Number</label>
                  <input name="accountNumber" value={form.bankDetails.accountNumber} onChange={handleBankField} placeholder="1234567890" />
                </div>
                <div>
                  <label>IFSC Code</label>
                  <input name="ifscCode" value={form.bankDetails.ifscCode} onChange={handleBankField} maxLength={11} placeholder="SBIN0001234" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <p className="text-xs font-semibold uppercase text-gray-400 tracking-wide mb-4">
                Images
              </p>
              {[
                { label: "Profile Images", field: "profileImages", uploading: uploadingProfile, setUploading: setUploadingProfile },
                { label: "Product Images", field: "productImages", uploading: uploadingProduct, setUploading: setUploadingProduct },
              ].map(({ label, field, uploading, setUploading }) => (
                <div key={field} className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">{label}</p>
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
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={cancelEdit} className="btn-default">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          /* ── VIEW MODE ── */
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <h2 className="text-sm font-semibold uppercase text-gray-400 tracking-wide mb-4">
                Basic Info
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <InfoRow label="Owner Name" value={seller.name} />
                <InfoRow label="Email" value={seller.email} />
                <InfoRow label="Phone" value={seller.phone} />
                <InfoRow label="Business Name" value={seller.businessName} />
                <InfoRow
                  label="GST Number"
                  value={seller.GSTNumber ? <span className="font-mono">{seller.GSTNumber}</span> : "—"}
                />
                <InfoRow
                  label="Rating"
                  value={seller.rating > 0 ? `★ ${Number(seller.rating).toFixed(1)} / 5` : "—"}
                />
                <InfoRow
                  label="Member Since"
                  value={
                    seller.createdAt
                      ? new Date(seller.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                      : "—"
                  }
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <h2 className="text-sm font-semibold uppercase text-gray-400 tracking-wide mb-4">
                Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <InfoRow label="Street" value={seller.address || "—"} />
                <InfoRow label="City" value={seller.city || "—"} />
                <InfoRow label="State" value={seller.state || "—"} />
                <InfoRow label="Pincode" value={seller.pincode || "—"} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <h2 className="text-sm font-semibold uppercase text-gray-400 tracking-wide mb-4">
                Bank Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <InfoRow label="Account Holder" value={seller.bankDetails?.accountHolderName || "—"} />
                <InfoRow label="Bank Name" value={seller.bankDetails?.bankName || "—"} />
                <InfoRow
                  label="Account Number"
                  value={seller.bankDetails?.accountNumber ? <span className="font-mono">{seller.bankDetails.accountNumber}</span> : "—"}
                />
                <InfoRow
                  label="IFSC Code"
                  value={seller.bankDetails?.ifscCode ? <span className="font-mono">{seller.bankDetails.ifscCode}</span> : "—"}
                />
              </div>
            </div>

            {(seller.profileImages?.length > 0 || seller.productImages?.length > 0) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-sm font-semibold uppercase text-gray-400 tracking-wide mb-4">
                  Images
                </h2>
                {seller.profileImages?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Profile Images</p>
                    <div className="flex flex-wrap gap-3">
                      {seller.profileImages.map((url, i) => (
                        <Image
                          key={i}
                          src={url}
                          alt="profile"
                          width={96}
                          height={96}
                          className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}
                {seller.productImages?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Product Images</p>
                    <div className="flex flex-wrap gap-3">
                      {seller.productImages.map((url, i) => (
                        <Image
                          key={i}
                          src={url}
                          alt="product"
                          width={96}
                          height={96}
                          className="w-24 h-24 rounded-lg object-cover border border-blue-100"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className="text-gray-800 font-medium">{value}</p>
  </div>
);

export default ViewSeller;
