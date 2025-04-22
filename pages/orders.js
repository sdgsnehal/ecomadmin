import Layout from "@/components/layout";
import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    axios.get("/api/order").then((res) => {
      setOrders(res.data);
    });
  }, []);
  return (
    <Layout>
      <h1>Orders</h1>
      <table className="basic">
        <thead>
          <tr>
            <th>ID</th>
            <th>Recipient</th>
            <th>Product</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 &&
            orders.map((order) => (
              <tr key={order.id}>
                <td>{order._id}</td>
                <td></td>
              </tr>
            ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default Orders;
