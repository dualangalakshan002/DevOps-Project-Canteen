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
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setShowModal(true);
  };

  const handleAddClick = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      date: new Date().toISOString().split('T')[0],
      available: true,
    });
    setShowModal(true);
  };

  const handleSubmitFood = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        date: new Date(formData.date),
        available: !!formData.available,
      };

      if (formData._id) {
        await api.put(`/food/${formData._id}`, payload);
      } else {
        await api.post('/food', payload);
      }

      setShowModal(false);
      fetchFoods();
    } catch (err) {
      console.error('Submit food error', err);
      setError(err.response?.data?.msg || 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 p-5 bg-blue-100 rounded-2xl shadow-md gap-4">
  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-wide">
    Staff Dashboard
  </h1>

  <div className="flex gap-3">
    <button
      onClick={handleAddClick}
      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium transition duration-200 shadow-sm hover:shadow-md"
    >
      ➕ Add Food
    </button>

    <button
      onClick={logout}
      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium transition duration-200 shadow-sm hover:shadow-md"
    >
      🚪 Logout
    </button>
  </div>
</div>


      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{formData._id ? 'Edit Food' : 'Add Food'}</h2>
            <form onSubmit={handleSubmitFood}>
              <input
                className="w-full p-2 border mb-3"
                placeholder="Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <textarea
                className="w-full p-2 border mb-3"
                placeholder="Description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <input
                type="number"
                className="w-full p-2 border mb-3"
                placeholder="Price"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
              <input
                type="date"
                className="w-full p-2 border mb-3"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={!!formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                />
                Available
              </label>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && <p className="text-blue-500 mb-4">Loading menu...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {foods.map((food) => (
          <li key={food._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{food.name}</h3>
            <p>{food.description}</p>
            <p className="text-green-600">Rs.{food.price}</p>
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
