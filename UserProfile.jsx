'use client';
import { useState, useEffect } from 'react';

export default function UserProfile() {
  const [profile, setProfile] = useState({
    name: 'राम कुमार धोबी',
    phone: '+977 98XXXXXXXX',
    bio: 'डिजिटल क्रिएटर और पेंटिंग कॉन्ट्रैक्टर',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  // ऐप खुलने पर पुराना सेव किया हुआ डेटा लोड करना
  useEffect(() => {
    const saved = localStorage.getItem('hellonepal_user_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProfile(parsed);
      setTempProfile(parsed);
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setProfile(tempProfile);
    localStorage.setItem('hellonepal_user_profile', JSON.stringify(tempProfile));
    setIsEditing(false);
  };

  return (
    <div className="max-w-md mx-auto mt-6 bg-white rounded-xl shadow-lg overflow-hidden p-6 border border-gray-100">
      <div className="flex items-center space-x-4 border-b pb-4">
        <img 
          src={profile.avatar} 
          alt="Profile" 
          className="w-20 h-20 rounded-full object-cover border-2 border-red-600 shadow"
        />
        <div>
          <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
          <p className="text-sm text-gray-500">{profile.phone}</p>
          <span className="inline-block bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full mt-1 font-medium">
            सक्रिय यूजर
          </span>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-600">बायो (Bio)</h3>
        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1 text-sm">{profile.bio}</p>
      </div>

      {!isEditing ? (
        <button 
          onClick={() => setIsEditing(true)}
          className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 shadow-md"
        >
          प्रोफाइल एडिट करें
        </button>
      ) : (
        <form onSubmit={handleSave} className="mt-6 space-y-4 bg-gray-50 p-4 rounded-xl border">
          <h3 className="font-bold text-gray-700 text-sm">विवरण बदलें</h3>
          <div>
            <label className="text-xs text-gray-500">नाम</label>
            <input 
              type="text" 
              value={tempProfile.name} 
              onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
              className="w-full border rounded-lg p-2 text-sm mt-1 focus:ring-2 focus:ring-red-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">फोन नंबर</label>
            <input 
              type="text" 
              value={tempProfile.phone} 
              onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})}
              className="w-full border rounded-lg p-2 text-sm mt-1 focus:ring-2 focus:ring-red-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">बायो</label>
            <textarea 
              value={tempProfile.bio} 
              onChange={(e) => setTempProfile({...tempProfile, bio: e.target.value})}
              className="w-full border rounded-lg p-2 text-sm mt-1 focus:ring-2 focus:ring-red-500 outline-none"
              rows="2"
            />
          </div>
          <div className="flex space-x-2">
            <button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium shadow"
            >
              सेव करें
            </button>
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg text-sm font-medium"
            >
              रद्द करें
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
