import Navbar from './Navbar';
import { Bell, Trash2, Globe, Shield } from 'lucide-react';
import { API_BASE } from './config';
import { useState } from 'react';

interface SettingsProps {
  onSignOut: () => void;
}

export default function Settings({ onSignOut }: SettingsProps) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    reportAlerts: true,
    trendAlerts: false,
    newsletter: true,
    language: 'en',
    theme: 'light',
    twoFactorAuth: false,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  const handlePasswordUpdate = async () => {
  const email = localStorage.getItem("userEmail");

  if (!email) {
    alert("User not logged in");
    return;
  }

  // ✅ 1. PASSWORD MATCH VALIDATION
  if (newPassword !== confirmPassword) {
    alert("New password and confirm password do not match");
    return;
  }

  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("Please fill all password fields");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        currentPassword: currentPassword,
        newPassword: newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error);
      return;
    }

    // ✅ 2. SUCCESS RESET + UI CLOSE
    alert("Password updated successfully");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordChange(false);

  } catch (error) {
    console.error("Password update error:", error);
    alert("Backend connection failed");
  }
};




  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSignOut={onSignOut} />

      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        {/* Header */}
        <div className="mb-20">
          <h1 className="text-gray-900 mb-4">Settings</h1>
          <p className="text-lg text-gray-600">Manage your account preferences and security</p>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-2xl shadow-sm p-12 border border-gray-100 mb-10">
          <div className="flex items-center gap-3 mb-10">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Security</h2>
          </div>

          <div className="space-y-8">
            {/* Change Password */}
            <div className="pb-8 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Change Password</h3>
                  <p className="text-gray-600">Update your password to keep your account secure</p>
                </div>
                <button
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  {showPasswordChange ? 'Cancel' : 'Change'}
                </button>
              </div>

              {showPasswordChange && (
                <div className="mt-6 space-y-4 bg-gray-50 p-6 rounded-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    onClick={handlePasswordUpdate}>
                    Update Password
                  </button>
                </div>
              )}
            </div>

            {/* Two-Factor Authentication */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Two-Factor Authentication</h3>
                  <p className="text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl shadow-sm p-12 border border-gray-100 mb-10">
          <div className="flex items-center gap-3 mb-10">
            <Bell className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between pb-8 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Notifications</h3>
                <p className="text-gray-600">Receive email updates about your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pb-8 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Upload Alerts</h3>
                <p className="text-gray-600">Get notified when report analysis is complete</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reportAlerts}
                  onChange={(e) => handleSettingChange('reportAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pb-8 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Trend Alerts</h3>
                <p className="text-gray-600">Receive alerts about significant health trend changes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.trendAlerts}
                  onChange={(e) => handleSettingChange('trendAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Newsletter</h3>
                <p className="text-gray-600">Receive health tips and product updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.newsletter}
                  onChange={(e) => handleSettingChange('newsletter', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl shadow-sm p-12 border border-gray-100 mb-10">
          <div className="flex items-center gap-3 mb-10">
            <Globe className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Preferences</h2>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">Language</label>
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-2xl shadow-sm p-12 border-2 border-red-200">
          <div className="flex items-center gap-3 mb-10">
            <Trash2 className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Danger Zone</h2>
          </div>

          <div className="bg-white rounded-xl p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
            <p className="text-gray-600 mb-6">
              Once you delete your account, there is no going back. All your data will be permanently removed.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-8 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Delete My Account
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <p className="text-red-900 font-medium mb-4">
                    Are you absolutely sure? This action cannot be undone.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => alert('Account deleted (demo)')}
                      className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                    >
                      Yes, Delete Forever
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-6 py-2.5 bg-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
