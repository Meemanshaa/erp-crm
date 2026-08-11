import React, { useEffect, useState } from "react";
import { api } from "../../api/client";

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    businessName: "",
    gstNumber: "",
    type: "Retail",
    address: "",
    status: "Active",
  });

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("/customers", {
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        businessName: form.businessName,
        gstNumber: form.gstNumber || undefined,
        type: form.type,
        address: form.address,
        status: form.status,
      });

      alert("Customer added successfully!");

      setForm({
        name: "",
        mobile: "",
        email: "",
        businessName: "",
        gstNumber: "",
        type: "Retail",
        address: "",
        status: "Active",
      });

      setShowModal(false);
      fetchCustomers();
    } catch (error: any) {
      console.error(error);
      alert(
        error?.response?.data?.error || "Failed to add customer"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Customers
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Customer
        </button>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Name</th>
              <th className="p-4 font-semibold text-gray-600">Mobile</th>
              <th className="p-4 font-semibold text-gray-600">Email</th>
              <th className="p-4 font-semibold text-gray-600">
                Business
              </th>
              <th className="p-4 font-semibold text-gray-600">Type</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-4 font-medium">
                  {customer.name}
                </td>

                <td className="p-4">
                  {customer.mobile}
                </td>

                <td className="p-4 text-gray-500">
                  {customer.email}
                </td>

                <td className="p-4">
                  {customer.businessName}
                </td>

                <td className="p-4">
                  {customer.type}
                </td>

                <td className="p-4">
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                    {customer.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">
                Add Customer
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 text-xl"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-2 gap-4"
            >
              <input
                name="name"
                placeholder="Customer Name"
                value={form.name}
                onChange={handleChange}
                required
                className="border rounded-lg p-3"
              />

              <input
                name="mobile"
                placeholder="Mobile"
                value={form.mobile}
                onChange={handleChange}
                required
                className="border rounded-lg p-3"
              />

              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="border rounded-lg p-3"
              />

              <input
                name="businessName"
                placeholder="Business Name"
                value={form.businessName}
                onChange={handleChange}
                required
                className="border rounded-lg p-3"
              />

              <input
                name="gstNumber"
                placeholder="GST Number"
                value={form.gstNumber}
                onChange={handleChange}
                className="border rounded-lg p-3"
              />

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="border rounded-lg p-3"
              >
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Distributor">Distributor</option>
              </select>

              <input
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                required
                className="border rounded-lg p-3 col-span-2"
              />

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="border rounded-lg p-3"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Lead">Lead</option>
              </select>

              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {loading ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};