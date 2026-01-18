import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const StaffDashboard = () => {
  const [foods, setFoods] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    date: new Date().toISOString().split('T')[0],
    available: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const controller = new AbortController();

    fetchFoods(controller.signal);

    return () => {
      controller.abort(); // ✅ stop duplicate request in StrictMode
    };
  }, []);

  const fetchFoods = async (signal) => {
    try {
      setLoading(true);
      setError('');

      const res = await api.get('/food', { signal });

      // Backend returns array → safe
      setFoods(Array.isArray(res.data) ? res.data : []);

    } catch (err) {
      // ✅ Ignore aborted requests
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return;
      }

      console.error('Error fetching foods:', err);
      setError(err.response?.data?.msg || 'Failed to fetch menu items');
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (food) => {
    setFormData({
      name: food.name || '',
      description: food.description || '',
      price: food.price || 0,
      date: food.date
        ? new Date(food.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      available: typeof food.available === 'boolean' ? food.available : true,
      _id: food._id,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await api.delete(`/food/${id}`);
      fetchFoods(); // refresh list
    } catch (err) {
      console.error('Delete error', err);
      setError(err.response?.data?.msg || 'Failed to delete item');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Staff Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {loading && <p className="text-blue-500 mb-4">Loading menu...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {foods.map((food) => (
          <li key={food._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{food.name}</h3>
            <p>{food.description}</p>
            <p className="text-green-600">${food.price}</p>
            <p>Date: {new Date(food.date).toLocaleDateString()}</p>
            <p>Available: {food.available ? 'Yes' : 'No'}</p>

            <button
              onClick={() => handleEdit(food)}
              className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(food._id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {foods.length === 0 && !loading && !error && (
        <p className="text-gray-500">No menu items yet. Add some!</p>
      )}
    </div>
  );
};

export default StaffDashboard;
