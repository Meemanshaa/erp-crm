import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

interface Challan {
  id: string;
  challanNumber: string;
  totalQuantity: number;
  status: string;
  createdAt: string;
  customer: { name: string };
}

export default function ChallanList() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get('/challans', { params: { status, limit: 50 } })
      .then(({ data }) => setChallans(data.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, [status]);

  const statusColor: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-600',
    Confirmed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">Sales Challans</h1>
        <Link to="/challans/new" className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700">
          + New Challan
        </Link>
      </div>

      <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-3 py-2 text-sm mb-4">
        <option value="">All statuses</option>
        <option value="Draft">Draft</option>
        <option value="Confirmed">Confirmed</option>
        <option value="Cancelled">Cancelled</option>
      </select>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Challan #</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-400">Loading...</td></tr>
            ) : challans.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-400">No challans found.</td></tr>
            ) : (
              challans.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <Link to={`/challans/${c.id}`} className="text-blue-600 hover:underline">{c.challanNumber}</Link>
                  </td>
                  <td className="p-3">{c.customer.name}</td>
                  <td className="p-3">{c.totalQuantity}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColor[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="p-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
