// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/auth/user') // Fetch user data from the backend
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error('Error fetching user:', err));
  }, []);

  const handleLogout = () => {
    fetch('/logout')
      .then(res => {
        if (res.redirected) {
          window.location.href = res.url; // Redirect to login after logout
        }
      });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {user ? (
        <>
          <h2>Welcome, {user.username}</h2>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <h2>Loading...</h2>
      )}
    </div>
  );
};

export default Dashboard;
