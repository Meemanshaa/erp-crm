import React, { useEffect, useState } from "react";
import { api } from "../../api/client";

export const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    category: "",
    unitPrice: "",
    currentStock: "",
    minStockAlert: "",
    location: "",
  });

  const [stockForm, setStockForm] = useState({
    quantityChanged: "",
    type: "IN",
    reason: "",
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleStockChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setStockForm({
      ...stockForm,
      [e.target.name]: e.target.value,
    });
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/products", {
        name: productForm.name,
        sku: productForm.sku,
        category: productForm.category,
        unitPrice: Number(productForm.unitPrice),
        currentStock: Number(productForm.currentStock),
        minStockAlert: Number(productForm.minStockAlert),
        location: productForm.location,
      });

      alert("Product added successfully!");

      setShowAddModal(false);

      setProductForm({
        name: "",
        sku: "",
        category: "",
        unitPrice: "",
        currentStock: "",
        minStockAlert: "",
        location: "",
      });

      fetchProducts();
    } catch (error: any) {
      console.error(error);
      alert(
        error?.response?.data?.error ||
          "Failed to add product"
      );
    }
  };

  const adjustStock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) return;

    try {
      await api.post(
        `/products/${selectedProduct.id}/stock`,
        {
          quantityChanged: Number(
            stockForm.quantityChanged
          ),
          type: stockForm.type,
          reason: stockForm.reason,
        }
      );

      alert("Stock adjusted successfully!");

      setShowStockModal(false);
      setSelectedProduct(null);

      setStockForm({
        quantityChanged: "",
        type: "IN",
        reason: "",
      });

      fetchProducts();
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.error ||
          "Failed to adjust stock"
      );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Products & Inventory
        </h1>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">
                Name
              </th>

              <th className="p-4 font-semibold text-gray-600">
                SKU
              </th>

              <th className="p-4 font-semibold text-gray-600">
                Category
              </th>

              <th className="p-4 font-semibold text-gray-600">
                Unit Price
              </th>

              <th className="p-4 font-semibold text-gray-600">
                Stock
              </th>

              <th className="p-4 font-semibold text-gray-600">
                Location
              </th>

              <th className="p-4 font-semibold text-gray-600">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-4 font-medium">
                  {p.name}
                </td>

                <td className="p-4 text-gray-500">
                  {p.sku}
                </td>

                <td className="p-4">
                  {p.category}
                </td>

                <td className="p-4">
                  ₹{p.unitPrice}
                </td>

                <td className="p-4 font-bold">
                  {p.currentStock}
                </td>

                <td className="p-4">
                  {p.location}
                </td>

                <td className="p-4">
                  <button
                    onClick={() => {
                      setSelectedProduct(p);
                      setShowStockModal(true);
                    }}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"
                  >
                    Adjust Stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between mb-5">
              <h2 className="text-xl font-bold">
                Add Product
              </h2>

              <button
                onClick={() => setShowAddModal(false)}
                className="text-xl text-gray-500"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={addProduct}
              className="grid grid-cols-2 gap-4"
            >
              <input
                name="name"
                placeholder="Product Name"
                value={productForm.name}
                onChange={handleProductChange}
                required
                className="border rounded-lg p-3"
              />

              <input
                name="sku"
                placeholder="SKU"
                value={productForm.sku}
                onChange={handleProductChange}
                required
                className="border rounded-lg p-3"
              />

              <input
                name="category"
                placeholder="Category"
                value={productForm.category}
                onChange={handleProductChange}
                required
                className="border rounded-lg p-3"
              />

              <input
                name="unitPrice"
                type="number"
                placeholder="Unit Price"
                value={productForm.unitPrice}
                onChange={handleProductChange}
                required
                className="border rounded-lg p-3"
              />

              <input
                name="currentStock"
                type="number"
                placeholder="Current Stock"
                value={productForm.currentStock}
                onChange={handleProductChange}
                required
                className="border rounded-lg p-3"
              />

              <input
                name="minStockAlert"
                type="number"
                placeholder="Minimum Stock Alert"
                value={productForm.minStockAlert}
                onChange={handleProductChange}
                required
                className="border rounded-lg p-3"
              />

              <input
                name="location"
                placeholder="Location"
                value={productForm.location}
                onChange={handleProductChange}
                required
                className="border rounded-lg p-3"
              />

              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-2">
              Adjust Stock
            </h2>

            <p className="text-gray-500 mb-5">
              Product:{" "}
              <strong>{selectedProduct.name}</strong>
              <br />
              Current Stock:{" "}
              <strong>{selectedProduct.currentStock}</strong>
            </p>

            <form onSubmit={adjustStock} className="space-y-4">
              <input
                name="quantityChanged"
                type="number"
                min="1"
                placeholder="Quantity"
                value={stockForm.quantityChanged}
                onChange={handleStockChange}
                required
                className="w-full border rounded-lg p-3"
              />

              <select
                name="type"
                value={stockForm.type}
                onChange={handleStockChange}
                className="w-full border rounded-lg p-3"
              >
                <option value="IN">
                  IN - Add Stock
                </option>

                <option value="OUT">
                  OUT - Remove Stock
                </option>
              </select>

              <input
                name="reason"
                placeholder="Reason"
                value={stockForm.reason}
                onChange={handleStockChange}
                required
                className="w-full border rounded-lg p-3"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-green-600 text-white rounded-lg"
                >
                  Adjust Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};