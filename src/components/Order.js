import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Order.css';

function Order() {
  const [selectedItems, setSelectedItems] = useState(new Set()); // New state for tracking selected items
  const [availableItems, setAvailableItems] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [householdSize, setHouseholdSize] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [notes, setNotes] = useState('');
  const [showMonthly, setShowMonthly] = useState(false); // New state to toggle between daily and monthly lists

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = showMonthly ? '/monthlyItems' : '/dailyItems';
        const res = await axios.get(`http://localhost:3000${endpoint}`);
        setFoodItems(res.data);
        setLoading(false);
      } catch (err) {
        setError('An error occurred while fetching data.');
        setLoading(false);
      }
    };
    fetchData();
  }, [showMonthly]);

  const toggleListType = () => {
    setShowMonthly(!showMonthly);
  };

  // Organize food items by category
  const categorizedItems = foodItems.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleItemClick = itemId => {
    setSelectedItems(prevSelectedItems => {
      const newSelectedItems = new Set(prevSelectedItems);
      if (newSelectedItems.has(itemId)) {
        newSelectedItems.delete(itemId);
      } else {
        newSelectedItems.add(itemId);
      }
      return newSelectedItems;
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const placeOrder = async () => {
    // Send the selected items to the server to place the order
    try {
      await axios.post('/orders', { items: Array.from(selectedItems) }); // Replace with your endpoint
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  return (
    <div>
      <header className="header">
        <nav className="nav">
          <Link to="/admin" className="nav-link">Admin</Link>
          <Link to="/" className="nav-link">Home</Link>
        </nav>
      </header>

      <form>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isAnonymous}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isAnonymous}
            />
            <div className="anonymous-checkbox">
            <label>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                id='.anonymous-checkbox'
              />
              Anonymous
            </label>
            </div>
            <input
              type="number"
              placeholder="Size of Household"
              value={householdSize}
              onChange={(e) => setHouseholdSize(e.target.value)}
            />
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
              <option value="" disabled selected>State</option>
              <option value="Vermont">Vermont</option>
              <option value="New Hampshire">New Hampshire</option>
            </select>
            <textarea
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
      </form>

      <button className="button toggle-button" onClick={toggleListType}>
        {showMonthly ? 'Show Daily List' : 'Show Monthly List'}
      </button>

      <h2>{showMonthly ? 'Monthly List:' : 'Daily List:'}</h2>
      <div className="list-container">
        {Object.keys(categorizedItems).map((category) => (
          <div key={category}>
            <h3>{category}</h3>
            {categorizedItems[category].map((item) => (
              <div 
                key={item.id} 
                className={`food-item-order ${selectedItems.has(item.id) ? 'selected' : ''}`}
                onClick={() => handleItemClick(item.id)}
              >
                <div>{item.name}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <button type="button" onClick={placeOrder}>Place Order</button>
    </div>
  );
}

export default Order;
