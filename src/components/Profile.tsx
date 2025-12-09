import Navbar from './Navbar';
import { User, Calendar, Heart, Pill, AlertTriangle, Edit2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProfileProps {
  onSignOut?: () => void;
  hasUploadedReports?: boolean;
}

interface ProfileType {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age: number | string;
  gender: string;
  bloodType: string;
  height: string;
  weight: string;
  address: string;
  medicalConditions: string[];
  allergies: string[];
  medications: string[];
  unitPreference: string;
}

export default function Profile({ onSignOut, hasUploadedReports }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');

  const [profile, setProfile] = useState<ProfileType>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    bloodType: "",
    height: "",
    weight: "",
    address: "",
    medicalConditions: [],
    allergies: [],
    medications: [],
    unitPreference: "metric",
  });

  // ✅ ✅ ✅ FETCH PROFILE FROM BACKEND
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      console.warn("No email found in localStorage");
      return;
    }

    fetch(`http://127.0.0.1:5000/profile?email=${email}`)
      .then(res => res.json())
      .then(data => {
        console.log("✅ PROFILE FROM BACKEND:", data);
        setProfile(data);
      })
      .catch(err => console.error("❌ Profile fetch error:", err));
  }, []);

  // ✅ ✅ ✅ SAVE PROFILE TO BACKEND (FIXED)
  const handleSave = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile), // ✅ email is included
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Update failed");
        return;
      }

      alert("✅ Profile updated successfully!");
      setIsEditing(false);

    } catch (err) {
      console.error("❌ Save error:", err);
      alert("Backend connection failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSignOut={onSignOut} hasUploadedReports={hasUploadedReports} />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-20">
          <div>
            <h1 className="text-gray-900 mb-4">My Profile</h1>
            <p className="text-lg text-gray-600">Manage your personal and health information</p>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            {isEditing ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm p-12 border border-gray-100">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <User className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-gray-900 mb-3">{profile.name}</h2>
              <p className="text-gray-600 mb-8">{profile.email}</p>
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                <Calendar className="w-4 h-4" />
                <span>{profile.age} years old</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-6 py-3 rounded-xl border border-blue-100">
                <Heart className="w-4 h-4" />
                <span className="font-medium">Pro Member</span>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-12 border border-gray-100">
            <h3 className="text-gray-900 mb-12">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <span className="text-gray-900">{profile.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Email Address</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-gray-600">{profile.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <span className="text-gray-900">{profile.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <span className="text-gray-900">{new Date(profile.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
                {isEditing ? (
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <span className="text-gray-900">{profile.gender}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Blood Type</label>
                {isEditing ? (
                  <select
                    value={profile.bloodType}
                    onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <span className="text-gray-900">{profile.bloodType}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Height (cm)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <span className="text-gray-900">{profile.height} cm</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Weight (kg)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <span className="text-gray-900">{profile.weight} kg</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">Address</label>
              {isEditing ? (
                <textarea
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  rows={3}
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-gray-900">{profile.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm p-12 border border-gray-100">
          <h3 className="text-gray-900 mb-12">Medical Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <Heart className="w-5 h-5 text-red-600" />
                <label className="text-sm font-medium text-gray-700">Medical Conditions</label>
              </div>
              <div className="space-y-4">
                {profile.medicalConditions.map((condition, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                    <span className="text-red-900 font-medium">{condition}</span>
                    {isEditing && (
                      <button className="text-red-600 hover:text-red-800 text-xl leading-none">×</button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={() => {
                        setProfile({ ...profile, medicalConditions: [...profile.medicalConditions, newCondition] });
                        setNewCondition('');
                      }}
                      className="bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-8">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <label className="text-sm font-medium text-gray-700">Allergies</label>
              </div>
              <div className="space-y-4">
                {profile.allergies.map((allergy, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <span className="text-yellow-900 font-medium">{allergy}</span>
                    {isEditing && (
                      <button className="text-yellow-600 hover:text-yellow-800 text-xl leading-none">×</button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={() => {
                        setProfile({ ...profile, allergies: [...profile.allergies, newAllergy] });
                        setNewAllergy('');
                      }}
                      className="bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-8">
                <Pill className="w-5 h-5 text-blue-600" />
                <label className="text-sm font-medium text-gray-700">Current Medications</label>
              </div>
              <div className="space-y-4">
                {profile.medications.map((medication, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="text-blue-900 font-medium">{medication}</span>
                    {isEditing && (
                      <button className="text-blue-600 hover:text-blue-800 text-xl leading-none">×</button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={() => {
                        setProfile({ ...profile, medications: [...profile.medications, newMedication] });
                        setNewMedication('');
                      }}
                      className="bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-4">Unit Preference</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="units"
                  value="metric"
                  checked={profile.unitPreference === 'metric'}
                  onChange={(e) => setProfile({ ...profile, unitPreference: e.target.value })}
                  disabled={!isEditing}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-gray-700">Metric (kg, cm, mg/dL)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="units"
                  value="imperial"
                  checked={profile.unitPreference === 'imperial'}
                  onChange={(e) => setProfile({ ...profile, unitPreference: e.target.value })}
                  disabled={!isEditing}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-gray-700">Imperial (lbs, inches, mmol/L)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}