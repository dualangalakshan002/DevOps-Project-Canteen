import { useEffect, useState, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const StudentDashboard = () => {
  const [todayFood, setTodayFood] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalFood, setModalFood] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalSize, setModalSize] = useState('full');
  const [modalNote, setModalNote] = useState('');
  const [showOrderList, setShowOrderList] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const { logout } = useContext(AuthContext);

  const loadData = async () => {
    try {
      const [foodRes, orderRes] = await Promise.all([
        api.get('/food/today'),
        api.get('/orders/my')
      ]);
      setTodayFood(foodRes.data);
      setOrders(orderRes.data);
    } catch {
      alert('Failed to load data');
    }
  };

  const addItem = (foodId) => {
    // Open modal to choose quantity / size / note
    const food = todayFood.find(f => f._id === foodId) || null;
    setModalFood(food);
    setModalQuantity(1);
    setModalSize('full');
    setModalNote('');
    setShowAddModal(true);
  };

  const confirmAddItem = () => {
    if (!modalFood) return;
    setOrderItems(prev => {
      return [
        ...prev,
        {
          foodId: modalFood._id,
          quantity: Number(modalQuantity) || 1,
          size: modalSize,
          note: modalNote || '',
          name: modalFood.name,
          price: modalFood.price
        }
      ];
    });
    setShowAddModal(false);
  };

  const placeOrder = async () => {
    if (orderItems.length === 0) return alert('No items in your order');
    try {
      // Send only the shape backend expects: [{ foodId, quantity }]
      const payloadItems = orderItems.map(it => ({ foodId: it.foodId, quantity: it.quantity }));
      await api.post('/orders', { items: payloadItems });
      setOrderItems([]);
      await loadData();
      setShowOrderList(true); // show the order list after placing order
      alert('Order placed!');
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to place order');
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 p-5 bg-blue-100 rounded-2xl shadow-md gap-4">
  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-wide">
    Student Dashboard
  </h1>

  <div className="flex gap-3">
    <button
      onClick={() => setShowOrderList(prev => !prev)}
      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-lg font-medium transition duration-200 shadow-sm hover:shadow-md"
    >
      📋 Order List
    </button>

    <button
      onClick={logout}
      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium transition duration-200 shadow-sm hover:shadow-md"
    >
      🚪 Logout
    </button>
  </div>
</div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {todayFood.map(food => (
          <div key={food._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{food.name}</h3>
            <p>{food.description}</p>
            <p className="text-green-600">Rs.{food.price}</p>
            <button
              onClick={() => addItem(food._id)}
              className="bg-green-500 text-white px-4 py-2 rounded mt-2"
            >
              Add
            </button>
          </div>
        ))}
      </div>

      {orderItems.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Current Order</h2>
            <ul className="space-y-1">
              {orderItems.map((it, idx) => (
                <li key={idx} className="flex justify-between">
                  <div>
                    <div className="font-medium">{it.name} {it.size === 'half' ? '(Half)' : ''}</div>
                    <div className="text-sm text-gray-600">Qty: {it.quantity} {it.note && `· Note: ${it.note}`}</div>
                  </div>
                  <div className="text-green-600">${(it.price * it.quantity).toFixed(2)}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2">
            <button
              onClick={placeOrder}
              className="bg-blue-500 text-white px-6 py-2 rounded"
            >
              Place Order
            </button>
            <button
              onClick={() => setOrderItems([])}
              className="px-6 py-2 rounded border"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Orders history modal/section */}
      {showOrderList && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center z-50 pt-24">
          <div className="bg-white p-6 rounded shadow w-full max-w-3xl mx-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">Your Orders</h2>
              <button onClick={() => setShowOrderList(false)} className="px-3 py-1 border rounded">Close</button>
            </div>

            {orders.length === 0 ? (
              <p className="text-gray-500">You have no past orders.</p>
            ) : (
              <ul className="space-y-3 max-h-96 overflow-auto">
                {orders.map((o) => (
                  <li key={o._id} className="border p-3 rounded">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">Order ID: {o._id}</div>
                      <div className="text-sm text-gray-600">{new Date(o.orderDate || o.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="font-medium mt-1">Total: ${Number(o.total || 0).toFixed(2)}</div>
                    <ul className="mt-2">
                      {o.items?.map((it, i) => (
                        <li key={i} className="flex justify-between py-1">
                          <div>
                            <div className="font-medium">{it.foodId?.name || it.name || String(it.foodId)}</div>
                            <div className="text-sm text-gray-600">Qty: {it.quantity} {it.size ? `· ${it.size}` : ''} {it.note ? `· Note: ${it.note}` : ''}</div>
                          </div>
                          <div className="text-green-600">${((it.foodId?.price || it.price || 0) * it.quantity * (it.size === 'half' ? 0.5 : 1)).toFixed(2)}</div>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Add item modal */}
      {showAddModal && modalFood && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Add {modalFood.name}</h2>
            <form onSubmit={(e) => { e.preventDefault(); confirmAddItem(); }}>
              <label className="block mb-2">Quantity</label>
              <input type="number" min="1" value={modalQuantity} onChange={(e) => setModalQuantity(e.target.value)} className="w-full p-2 border mb-3" />

              <label className="block mb-2">Size</label>
              <select value={modalSize} onChange={(e) => setModalSize(e.target.value)} className="w-full p-2 border mb-3">
                <option value="full">Full</option>
                <option value="half">Half</option>
              </select>

              <label className="block mb-2">Note / Description</label>
              <textarea value={modalNote} onChange={(e) => setModalNote(e.target.value)} className="w-full p-2 border mb-3" />

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Add to Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
