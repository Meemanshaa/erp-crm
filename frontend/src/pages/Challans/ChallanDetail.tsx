import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';

interface ChallanItem {
  id: string;
  productNameSnapshot: string;
  productSkuSnapshot: string;
  unitPriceSnapshot: string;
  quantity: number;
}

interface ChallanDetailData {
  id: string;
  challanNumber: string;
  status: string;
  totalQuantity: number;
  createdAt: string;
  customer: { name: string; mobile: string };
  items: ChallanItem[];
}

export default function ChallanDetail() {
  const { id } = useParams();
  const [challan, setChallan] = useState<ChallanDetailData | null>(null);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  function load() {
    api.get(`/challans/${id}`).then(({ data }) => setChallan(data));
  }

  useEffect(load, [id]);

  async function handleConfirm() {
    setWorking(true);
    setError('');
    try {
      await api.patch(`/challans/${id}/confirm`);
      load();
    } catch (err: any) {
      // If stock ran out between draft creation and confirmation, this is where it shows
      setError(err.response?.data?.error || 'Failed to confirm challan');
    } finally {
      setWorking(false);
    }
  }

  async function handleCancel() {
    setWorking(true);
    setError('');
    try {
      await api.patch(`/challans/${id}/cancel`);
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel challan');
    } finally {
      setWorking(false);
    }
  }

  if (!challan) return <div className="text-gray-400">Loading...</div>;

  const total = challan.items.reduce((sum, it) => sum + Number(it.unitPriceSnapshot) * it.quantity, 0);

  return (
    <div className="max-w-2xl">
      <Link to="/challans" className="text-sm text-blue-600 hover:underline">← Back to challans</Link>

      <div className="bg-white border rounded-lg p-6 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold">{challan.challanNumber}</h1>
            <div className="text-sm text-gray-500">{challan.customer.name} — {challan.customer.mobile}</div>
          </div>
          <span className="px-3 py-1 rounded text-sm bg-gray-100">{challan.status}</span>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">{error}</div>}

        <table className="w-full text-sm mb-4">
          <thead className="text-left text-gray-500 border-b">
            <tr>
              <th className="py-2">Product</th>
              <th className="py-2">SKU</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Price</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {challan.items.map((it) => (
              <tr key={it.id} className="border-b">
                <td className="py-2">{it.productNameSnapshot}</td>
                <td className="py-2">{it.productSkuSnapshot}</td>
                <td className="py-2">{it.quantity}</td>
                <td className="py-2">₹{it.unitPriceSnapshot}</td>
                <td className="py-2 text-right">₹{(Number(it.unitPriceSnapshot) * it.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right font-bold mb-4">Total: ₹{total.toFixed(2)}</div>

        {challan.status === 'Draft' && (
          <div className="flex justify-end gap-2">
            <button onClick={handleCancel} disabled={working} className="px-4 py-2 text-sm rounded border disabled:opacity-50">
              Cancel Challan
            </button>
            <button onClick={handleConfirm} disabled={working} className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50">
              {working ? 'Processing...' : 'Confirm & Deduct Stock'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
