import { useEffect, useState } from 'react';
import { api } from '../../api/client';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: string;
  currentStock: number;
  minStockAlert: number;
  isLowStock: boolean;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);

  function load() {
    setLoading(true);
    api
      .get('/products', { params: { search, limit: 50 } })
      .then(({ data }) => setProducts(data.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, [search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">Products</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      <input
        placeholder="Search by name or SKU..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded px-3 py-2 text-sm w-full mb-4"
      />

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">Loading...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">No products found.</td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">{p.sku}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">₹{p.unitPrice}</td>
                  <td className="p-3">
                    <span className={p.isLowStock ? 'text-red-600 font-semibold' : ''}>
                      {p.currentStock}
                    </span>
                    {p.isLowStock && (
                      <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                        Low stock
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setStockModalProduct(p)}
                      className="text-blue-600 text-xs hover:underline"
                    >
                      Adjust stock
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && <ProductFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
      {stockModalProduct && (
        <StockAdjustModal
          product={stockModalProduct}
          onClose={() => setStockModalProduct(null)}
          onSaved={() => { setStockModalProduct(null); load(); }}
        />
      )}
    </div>
  );
}

function ProductFormModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', sku: '', category: '', unitPrice: '', minStockAlert: '0' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/products', {
        ...form,
        unitPrice: Number(form.unitPrice),
        minStockAlert: Number(form.minStockAlert),
      });
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="font-bold mb-4">Add Product</h2>
        {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded mb-3">{error}</div>}
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2 text-sm mb-3" />
        <input required placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full border rounded px-3 py-2 text-sm mb-3" />
        <input required placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border rounded px-3 py-2 text-sm mb-3" />
        <input required type="number" step="0.01" placeholder="Unit price" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} className="w-full border rounded px-3 py-2 text-sm mb-3" />
        <input type="number" placeholder="Minimum stock alert" value={form.minStockAlert} onChange={(e) => setForm({ ...form, minStockAlert: e.target.value })} className="w-full border rounded px-3 py-2 text-sm mb-4" />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded border">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

function StockAdjustModal({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const [quantity, setQuantity] = useState('');
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post(`/products/${product.id}/stock`, { quantity: Number(quantity), type, reason });
      onSaved();
    } catch (err: any) {
      // This is where you'll see the "not enough stock" 409 error surface, if you try to remove more than available
      setError(err.response?.data?.error || 'Failed to adjust stock');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="font-bold mb-1">Adjust Stock</h2>
        <p className="text-sm text-gray-500 mb-4">{product.name} — currently {product.currentStock} in stock</p>
        {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded mb-3">{error}</div>}

        <select value={type} onChange={(e) => setType(e.target.value as 'IN' | 'OUT')} className="w-full border rounded px-3 py-2 text-sm mb-3">
          <option value="IN">Stock IN (received)</option>
          <option value="OUT">Stock OUT (removed)</option>
        </select>
        <input required type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full border rounded px-3 py-2 text-sm mb-3" />
        <input required placeholder="Reason (e.g. New purchase, Damaged goods)" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border rounded px-3 py-2 text-sm mb-4" />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded border">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50">
            {saving ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </form>
    </div>
  );
}
