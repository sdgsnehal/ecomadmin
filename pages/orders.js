import Layout from "@/components/layout";
import { fetchFromBackend } from "@/lib/fetchfromBackend";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

const statusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "delivered": return "bg-green-100 text-green-700";
    case "cancelled": return "bg-red-100 text-red-700";
    case "shipped": return "bg-blue-100 text-blue-700";
    case "pending": return "bg-yellow-100 text-yellow-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchFromBackend(`orders/admin/all?page=${currentPage}`).then((res) => {
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    });
  }, [currentPage]);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Order ID</td>
              <td>Customer</td>
              <td>Products</td>
              <td>Shipping Address</td>
              <td>Total</td>
              <td>Status</td>
              <td>Date</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="font-mono text-sm">{order.orderNumber}</td>
                <td>
                  <div className="font-medium">{order.user?.fullName}</div>
                  <div className="text-sm text-gray-500">{order.user?.email}</div>
                </td>
                <td>
                  {order.items?.map((item, index) => (
                    <div key={index} className="text-sm">
                      {item.product?.name} x {item.quantity}
                    </div>
                  ))}
                </td>
                <td>
                  <div className="text-sm">
                    <div>{order.shippingAddress?.name}</div>
                    <div>
                      {order.shippingAddress?.streetAddress},{" "}
                      {order.shippingAddress?.address}
                    </div>
                    <div>
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state} -{" "}
                      {order.shippingAddress?.zip}
                    </div>
                    <div>Ph: {order.shippingAddress?.mobile}</div>
                  </div>
                </td>
                <td>₹{order.totalAmount || 0}</td>
                <td>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass(order.orderStatus)}`}
                  >
                    {order.orderStatus}
                  </span>
                </td>
                <td className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <Link
                    className="btn-default inline-flex items-center gap-1"
                    href={"/orders/view/" + order._id}
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3 mt-2">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-sm text-gray-800">
                  #{order.orderNumber}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass(order.orderStatus)}`}
              >
                {order.orderStatus}
              </span>
            </div>

            <div className="mb-1">
              <span className="text-sm font-medium text-gray-800">
                {order.user?.fullName}
              </span>
              <span className="text-xs text-gray-500 ml-1">
                {order.user?.email}
              </span>
            </div>

            <div className="text-xs text-gray-500 mb-2">
              {order.items?.map((item, i) => (
                <span key={i}>
                  {item.product?.name} x{item.quantity}
                  {i < order.items.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>

            <div className="text-xs text-gray-500 mb-3">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} —{" "}
              Ph: {order.shippingAddress?.mobile}
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">
                ₹{order.totalAmount || 0}
              </span>
              <Link
                href={"/orders/view/" + order._id}
                className="btn-default inline-flex items-center gap-1 text-sm"
              >
                <Eye className="w-4 h-4" />
                View
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-4">
        <div className="text-sm text-gray-600">
          Page {pagination.currentPage} of {pagination.totalPages}
          <span className="ml-2">({pagination.totalOrders} total orders)</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="btn-default disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="btn-default disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
