import { useEffect, useState, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const StudentDashboard = () => {
  const [todayFood, setTodayFood] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

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
    setOrderItems(prev => {
      const existing = prev.find(i => i.foodId === foodId);
      if (existing) {
        return prev.map(i =>
          i.foodId === foodId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { foodId, quantity: 1 }];
    });
  };

  const placeOrder = async () => {
    await api.post('/orders', { items: orderItems });
    setOrderItems([]);
    loadData();
    alert('Order placed!');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {todayFood.map(food => (
          <div key={food._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{food.name}</h3>
            <p>{food.description}</p>
            <p className="text-green-600">${food.price}</p>
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
        <button
          onClick={placeOrder}
          className="bg-blue-500 text-white px-6 py-2 rounded mt-6"
        >
          Place Order
        </button>
      )}
    </div>
  );
};

export default StudentDashboard;
