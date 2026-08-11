import React, { useEffect, useState } from "react";
import { api } from "../../api/client";

interface ChallanItem {
  productId: string;
  quantity: number;
}

export const Challans: React.FC = () => {
  const [challans, setChallans] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [customerId, setCustomerId] = useState("");

  const [items, setItems] = useState<ChallanItem[]>([
    {
      productId: "",
      quantity: 1,
    },
  ]);

  const fetchData = async () => {
    try {
      const [challanRes, customerRes, productRes] =
        await Promise.all([
          api.get("/challans"),
          api.get("/customers"),
          api.get("/products"),
        ]);

      setChallans(challanRes.data);
      setCustomers(customerRes.data);
      setProducts(productRes.data);
    } catch (error) {
      console.error("Failed to load challan data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        quantity: 1,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof ChallanItem,
    value: string
  ) => {
    const updated = [...items];

    if (field === "quantity") {
      updated[index].quantity = Number(value);
    } else {
      updated[index].productId = value;
    }

    setItems(updated);
  };

  const createChallan = async (
    confirmImmediately: boolean
  ) => {
    if (!customerId) {
      alert("Please select a customer");
      return;
    }

    if (
      items.length === 0 ||
      items.some(
        (item) => !item.productId || item.quantity <= 0
      )
    ) {
      alert("Please add valid products and quantities");
      return;
    }

    try {
      // Create Challan with status
      const res = await api.post("/challans", {
        customerId,
        status: "Draft",
        items,
      });

      const createdChallan = res.data;

      // Confirm immediately if requested
      if (confirmImmediately) {
        await api.patch(
          `/challans/${createdChallan.id}/status`,
          {
            status: "Confirmed",
          }
        );
      }

      alert(
        confirmImmediately
          ? "Challan confirmed and stock deducted!"
          : "Challan saved as Draft!"
      );

      setShowModal(false);
      setCustomerId("");

      setItems([
        {
          productId: "",
          quantity: 1,
        },
      ]);

      fetchData();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.error ||
          "Failed to create challan"
      );
    }
  };

  const confirmChallan = async (id: string) => {
    try {
      await api.patch(`/challans/${id}/status`, {
        status: "Confirmed",
      });

      alert("Challan confirmed and stock deducted!");

      fetchData();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.error ||
          "Unable to confirm challan"
      );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Sales Challans
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create Challan
        </button>
      </div>

      {/* Challan Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">
                Challan #
              </th>

              <th className="p-4 font-semibold text-gray-600">
                Customer
              </th>

              <th className="p-4 font-semibold text-gray-600">
                Total Qty
              </th>

              <th className="p-4 font-semibold text-gray-600">
                Status
              </th>

              <th className="p-4 font-semibold text-gray-600">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {challans.map((ch) => (
              <tr
                key={ch.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-4 font-mono font-medium">
                  {ch.challanNumber}
                </td>

                <td className="p-4">
                  {ch.customer?.name}
                </td>

                <td className="p-4">
                  {ch.totalQuantity}
                </td>

                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded font-semibold ${
                      ch.status === "Confirmed"
                        ? "bg-green-100 text-green-800"
                        : ch.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {ch.status}
                  </span>
                </td>

                <td className="p-4">
                  {ch.status === "Draft" && (
                    <button
                      onClick={() =>
                        confirmChallan(ch.id)
                      }
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"
                    >
                      Confirm
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Challan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">
                Create Sales Challan
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Customer */}
            <div className="mb-6">
              <label className="block font-semibold mb-2">
                Customer
              </label>

              <select
                value={customerId}
                onChange={(e) =>
                  setCustomerId(e.target.value)
                }
                className="w-full border rounded-lg p-3"
              >
                <option value="">
                  Select Customer
                </option>

                {customers.map((customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.name}
                    {customer.businessName
                      ? ` - ${customer.businessName}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Products */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">
                  Products
                </h3>

                <button
                  type="button"
                  onClick={addItem}
                  className="text-blue-600 font-semibold"
                >
                  + Add Product
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-center"
                  >
                    <select
                      value={item.productId}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "productId",
                          e.target.value
                        )
                      }
                      className="flex-1 border rounded-lg p-3"
                    >
                      <option value="">
                        Select Product
                      </option>

                      {products.map((product) => (
                        <option
                          key={product.id}
                          value={product.id}
                        >
                          {product.name} — Stock:{" "}
                          {product.currentStock}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                      className="w-28 border rounded-lg p-3"
                    />

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(index)
                        }
                        className="text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => createChallan(false)}
                className="px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => createChallan(true)}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirm & Deduct Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};