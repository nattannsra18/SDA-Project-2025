// ProfileModal.jsx
import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Wallet, 
  EyeOff, 
  Eye, 
  LogOut 
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const ProfileModal = ({ userData, walletBalance, onClose, onLogout }) => {
  const [activeTab, setActiveTab] = useState('password');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      Swal.fire({
        title: 'Error',
        text: 'New passwords do not match',
        icon: 'error',
        background: '#18181C',
        color: '#ffffff',
        confirmButtonColor: '#D70000'
      });
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:1337/api/auth/change-password",
        {
          currentPassword: passwordData.currentPassword,
          password: passwordData.newPassword,
          passwordConfirmation: passwordData.confirmNewPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Success message
      await Swal.fire({
        title: 'Password Changed',
        text: 'Your password has been successfully updated',
        icon: 'success',
        background: '#18181C',
        color: '#ffffff',
        confirmButtonColor: '#3D9BDC'
      });

      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });

    } catch (error) {
      // Error handling
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to change password',
        icon: 'error',
        background: '#18181C',
        color: '#ffffff',
        confirmButtonColor: '#D70000'
      });
    }
  };

  // Render account details tab
  const renderAccountDetails = () => (
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-neutral-400">
          <span>Username</span>
          <span className="text-neutral-200">{userData?.username || 'N/A'}</span>
        </div>
        <div className="flex justify-between text-neutral-400">
          <span>Email</span>
          <span className="text-neutral-200">{userData?.email || 'N/A'}</span>
        </div>
        <div className="flex justify-between text-neutral-400">
          <span>Member Since</span>
          <span className="text-neutral-200">
            {userData?.createdAt 
              ? new Date(userData.createdAt).toLocaleDateString() 
              : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );

  // Render wallet details tab
  const renderWalletDetails = () => (
    <div className="p-6 space-y-4">
      <div className="bg-neutral-800 rounded-lg p-4 flex justify-between items-center">
        <span className="text-neutral-400">Current Balance</span>
        <span className="text-2xl font-semibold text-blue-500">
          ฿{walletBalance.toFixed(2)}
        </span>
      </div>
      <button 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md transition-colors"
        onClick={() => {/* Top Up Logic */}}
      >
        Top Up Wallet
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-xl shadow-2xl w-96 max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-neutral-200">Your Profile</h2>
          <button 
            onClick={onClose} 
            className="text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800">
          {[
            { icon: User, label: 'Account', value: 'account' },
            { icon: Wallet, label: 'My Wallet', value: 'wallet' },
            { icon: Lock, label: 'Change Password', value: 'password' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 py-3 flex items-center justify-center space-x-2 
                ${activeTab === tab.value 
                  ? 'text-blue-500 border-b-2 border-blue-500' 
                  : 'text-neutral-500 hover:bg-neutral-800'}`}
            >
              <tab.icon size={18} />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'account' && renderAccountDetails()}
        {activeTab === 'wallet' && renderWalletDetails()}
        
        {activeTab === 'password' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-neutral-400 text-sm">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-neutral-800 text-neutral-200 rounded-md py-2 px-3 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-neutral-400 text-sm">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-neutral-800 text-neutral-200 rounded-md py-2 px-3 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-neutral-400 text-sm">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-neutral-800 text-neutral-200 rounded-md py-2 px-3 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md transition-colors"
            >
              Change Password
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 flex justify-end">
          <button 
            onClick={onLogout}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
