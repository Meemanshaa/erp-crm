import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

interface Customer { id: string; name: string; }
interface Product { id: string; name: string; sku: string; unitPrice: string; currentStock: number; }
interface LineItem { productId: string; quantity: number; }

export default function ChallanCreate() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ productId: '', quantity: 1 }]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Pull enough customers/products to populate the dropdowns.
    // For a bigger dataset you'd add a searchable select instead of a plain <select>.
    api.get('/customers', { params: { limit: 100 } }).then(({ data }) => setCustomers(data.data));
    api.get('/products', { params: { limit: 100 } }).then(({ data }) => setProducts(data.data));
  }, []);

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { productId: '', quantity: 1 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function productFor(id: string) {
    return products.find((p) => p.id === id);
  }

  const runningTotal = items.reduce((sum, it) => {
    const p = productFor(it.productId);
    return sum + (p ? Number(p.unitPrice) * it.quantity : 0);
  }, 0);

  async function handleSubmit(status: 'Draft' | 'Confirmed') {
    setError('');
    if (!customerId) return setError('Please select a customer');
    if (items.some((it) => !it.productId)) return setError('Please select a product for every line');

    setSaving(true);
    try {
      const { data } = await api.post('/challans', {
        customerId,
        items: items.map((it) => ({ productId: it.productId, quantity: Number(it.quantity) })),
        status,
      });
      navigate(`/challans/${data.id}`);
    } catch (err: any) {
      // This is where the 409 "not enough stock" error from the backend surfaces
      setError(err.response?.data?.error || 'Failed to create challan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold mb-4">New Sales Challan</h1>

      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">{error}</div>}

      <div className="bg-white border rounded-lg p-6">
        <label className="block text-sm font-medium mb-1">Customer</label>
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm mb-4">
          <option value="">Select a customer</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <label className="block text-sm font-medium mb-2">Products</label>
        {items.map((item, index) => {
          const product = productFor(item.productId);
          return (
            <div key={index} className="flex items-center gap-2 mb-2">
              <select
                value={item.productId}
                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                className="flex-1 border rounded px-3 py-2 text-sm"
              >
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) — {p.currentStock} in stock
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                className="w-24 border rounded px-3 py-2 text-sm"
              />
              <div className="w-20 text-sm text-gray-500 text-right">
                {product ? `₹${(Number(product.unitPrice) * item.quantity).toFixed(2)}` : '-'}
              </div>
              <button type="button" onClick={() => removeItem(index)} className="text-red-500 text-sm px-2">✕</button>
            </div>
          );
        })}

        <button type="button" onClick={addItem} className="text-blue-600 text-sm mt-2 hover:underline">
          + Add another product
        </button>

        <div className="border-t mt-4 pt-4 flex items-center justify-between">
          <div className="font-bold">Total: ₹{runningTotal.toFixed(2)}</div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSubmit('Draft')}
              disabled={saving}
              className="px-4 py-2 text-sm rounded border disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit('Confirmed')}
              disabled={saving}
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Confirm & Deduct Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
