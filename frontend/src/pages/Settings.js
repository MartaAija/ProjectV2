import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser } from "react-icons/fa";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.get('http://127.0.0.1:5000/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.response?.data?.message || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = () => {
    setFormData({
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
      company: user?.company || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://127.0.0.1:5000/api/user/profile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUser(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#00d4ff', marginBottom: '20px' }}>Account Settings</h2>
      
      <div style={{ backgroundColor: '#333', borderRadius: '10px', padding: '20px', marginBottom: '20px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ color: '#00d4ff' }}>Profile Information</h3>
          {!isEditing && <button className="edit-button" onClick={handleEdit}>Edit</button>}
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Profile Information */}
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <div style={{ color: 'white' }}>
                <div className="input-container">
                  <label className="settings-label">Username:</label>
                  <input
                    type="text"
                    name="username"
                    value={user?.username || ''}
                    disabled
                    className="settings-input"
                  />
                </div>
                <div className="input-container">
                  <label className="settings-label">First Name:</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="settings-input"
                  />
                </div>
                <div className="input-container">
                  <label className="settings-label">Last Name:</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="settings-input"
                  />
                </div>
                <div className="input-container">
                  <label className="settings-label">Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="settings-input"
                  />
                </div>
                <div className="input-container">
                  <label className="settings-label">Company:</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="settings-input"
                  />
                </div>
                <div>
                  <button className="save-button" onClick={handleSave}>Save</button>
                  <button className="cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ color: 'white' }}>
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Name:</strong> {user?.first_name} {user?.last_name}</p>
                <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
                <p><strong>Company:</strong> {user?.company || 'Not provided'}</p>
                <p><strong>Account Created:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}</p>
              </div>
            )}
          </div>
          
          {/* Human icon with blue circle */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '130px', 
            height: '130px', 
            borderRadius: '50%', 
            backgroundColor: '#00d4ff', 
            color: '#121212',
            marginRight: '100px',
            marginTop: '30px'
          }}>
            <FaUser style={{ fontSize: '80px' }} />
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#333',
        borderRadius: '10px',
        padding: '20px'
      }}>
        <h3 style={{ color: '#00d4ff', marginBottom: '15px' }}>Account Statistics</h3>
        <div style={{ color: 'white' }}>
          <p><strong>Saved Attacks:</strong> {user?.saved_attacks || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Settings; 