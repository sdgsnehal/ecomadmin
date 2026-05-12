import Layout from "@/components/layout";
import { fetchFromBackend } from "@/lib/fetchfromBackend";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const ViewOrder = () => {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    if (!id) return;

    fetchFromBackend(`orders/admin/${id}`)
      .then((res) => {
        setOrder(res.data);
        setSelectedStatus(res.data.orderStatus);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching order:", error);
        setLoading(false);
      });
  }, [id]);

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.orderStatus) return;
    setStatusUpdating(true);
    setStatusError("");
    try {
      await fetchFromBackend(`orders/${id}/update-status`, {
        method: "PUT",
        body: { orderStatus: selectedStatus },
      });
      setOrder((prev) => ({ ...prev, orderStatus: selectedStatus }));
    } catch (err) {
      setStatusError(err.message || "Failed to update status");
      setSelectedStatus(order.orderStatus);
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div>Order not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Order Details</h1>

        {/* Order Info */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Order Number</p>
              <p className="font-medium">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">Order Date</p>
              <p className="font-medium">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Order Status</p>
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border rounded px-2 py-1 capitalize text-sm"
                  disabled={statusUpdating}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={statusUpdating || selectedStatus === order.orderStatus}
                  className="btn-default text-sm py-1 px-3 disabled:opacity-50"
                >
                  {statusUpdating ? "Saving..." : "Update"}
                </button>
              </div>
              {statusError && (
                <p className="text-red-500 text-sm mt-1">{statusError}</p>
              )}
            </div>
            <div>
              <p className="text-gray-600">Payment Status</p>
              <p className="font-medium capitalize">{order.paymentStatus}</p>
            </div>
            <div>
              <p className="text-gray-600">Payment Method</p>
              <p className="font-medium capitalize">
                {order.paymentMethod.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total Amount</p>
              <p className="font-medium">₹{order.totalAmount}</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{order.user?.fullName}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{order.user?.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-medium">{order.user?.phone}</p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <div className="text-gray-700">
            <p className="font-medium">{order.shippingAddress?.name}</p>
            <p>{order.shippingAddress?.streetAddress}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
              {order.shippingAddress?.zip}
            </p>
            <p>Phone: {order.shippingAddress?.mobile}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">Product</th>
                <th className="text-left py-2">Weight</th>
                <th className="text-left py-2">Quantity</th>
                <th className="text-left py-2">Price</th>
                <th className="text-left py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {item.product?.image?.[0] && (
                        <img
                          src={item.product.image[0]}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-sm text-gray-500">
                          SKU: {item.product?.sku}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">{item.weight}</td>
                  <td className="py-3">{item.quantity}</td>
                  <td className="py-3">₹{item.price}</td>
                  <td className="py-3">₹{item.totalPrice}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="text-right py-3 font-semibold">
                  Total:
                </td>
                <td className="py-3 font-semibold">₹{order.totalAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Back Button */}
        <button onClick={() => router.push("/orders")} className="btn-default">
          Back to Orders
        </button>
      </div>
    </Layout>
  );
};

export default ViewOrder;
