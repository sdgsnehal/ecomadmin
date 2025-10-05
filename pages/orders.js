import Layout from "@/components/layout";
import { fetchFromBackend } from "@/lib/fetchfromBackend";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  console.log(orders);
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <table className="basic mt-4">
        <thead>
          <tr>
            <td>Order ID</td>
            <td>Customer</td>
            <td>Products</td>
            <td>Shipping Address</td>
            <td>Total Amount</td>
            <td>Status</td>
            <td>Date</td>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.orderNumber}</td>
              <td>
                <div>{order.user?.fullName}</div>
                <div className="text-sm text-gray-500">{order.user?.email}</div>
              </td>
              <td>
                {order.items?.map((item, index) => (
                  <div key={index}>
                    {item.product?.name} x {item.quantity}
                  </div>
                ))}
              </td>
              <td>
                <div className="text-sm">
                  <div>{order.shippingAddress?.name}</div>
                  <div>{order.shippingAddress?.streetAddress}, {order.shippingAddress?.address}</div>
                  <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zip}</div>
                  <div>Ph: {order.shippingAddress?.mobile}</div>
                </div>
              </td>
              <td>₹{order.totalAmount || 0}</td>
              <td>{order.orderStatus}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>
                <Link
                  className="btn-default"
                  href={"/orders/view/" + order._id}
                >
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
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
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
