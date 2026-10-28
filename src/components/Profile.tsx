import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Link as LinkIcon, Edit3, Navigation, ShoppingBag } from 'lucide-react';

export const Profile = () => {
  const [profile, setProfile] = useState({
    name: 'राम कुमार धोबी',
    role: 'डिजिटल क्रिएटर और पेंटिंग कॉन्ट्रैक्टर',
    location: 'सिद्धार्थनगर (भैरहवा), नेपाल',
    bio: 'डिजिटल कंटेंट क्रिएटर, वीडियो एडिटिंग और पेंटिंग वर्क का अनुभव।',
    phone: '+977 98XXXXXXXX',
    facebook: 'facebook.com/RamRkdReels'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  // ऐप खुलने पर लोकल स्टोरेज से डेटा लोड करना
  useEffect(() => {
    const saved = localStorage.getItem('hellonepal_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setTempProfile(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSave = () => {
    setProfile(tempProfile);
    localStorage.setItem('hellonepal_user_profile', JSON.stringify(tempProfile));
    setIsEditing(false);
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-xl mx-auto pb-10">
      
      {/* Main Profile Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
        
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80" 
              alt="Profile Avatar" 
              className="w-20 h-20 rounded-full object-cover border-2 border-red-600 shadow-md"
            />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">{profile.name}</h2>
            <p className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 px-2.5 py-0.5 rounded-full inline-block">
              {profile.role}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center sm:justify-start gap-1 pt-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" /> {profile.location}
            </p>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">बायो (Bio)</span>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {profile.bio}
          </p>
        </div>

        {/* Contact & Social Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <Phone className="w-4 h-4 text-red-600 shrink-0" />
            <div>
              <p className="text-[10px] text-zinc-400">मोबाइल नंबर</p>
              <p className="font-bold text-zinc-800 dark:text-zinc-200">{profile.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <LinkIcon className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-[10px] text-zinc-400">सोशल मीडिया (Facebook / TikTok)</p>
              <a href={`https://${profile.facebook}`} target="_blank" rel="noreferrer" className="font-bold text-blue-600 truncate block hover:underline">
                {profile.facebook}
              </a>
            </div>
          </div>
        </div>

        {/* Edit / Save Toggle Button */}
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 rounded-xl font-bold text-xs shadow transition-colors flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" /> प्रोफाइल एडिट करें (Edit Profile)
          </button>
        ) : (
          <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 animate-fade-in">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">प्रोफाइल विवरण अपडेट करें</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold">पूरा नाम</label>
              <input 
                type="text" 
                value={tempProfile.name}
                onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-xl outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold">बायो (Bio)</label>
              <textarea 
                value={tempProfile.bio}
                onChange={(e) => setTempProfile({...tempProfile, bio: e.target.value})}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                rows={2}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold">मोबाइल नंबर</label>
              <input 
                type="text" 
                value={tempProfile.phone}
                onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-xl outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold">फेसबुक / सोशल लिंक</label>
              <input 
                type="text" 
                value={tempProfile.facebook}
                onChange={(e) => setTempProfile({...tempProfile, facebook: e.target.value})}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-xl outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow"
              >
                बदलाव सेव करें
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold text-xs"
              >
                रद्द करें
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Quick Role Switcher */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">सेवा विकल्प (Services & Roles)</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/40">
            <Navigation className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-xs font-bold">राइडर / डिलीवरी</p>
              <p className="text-[10px] text-zinc-400">सक्रिय पार्टनर</p>
            </div>
          </div>

          <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/40">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs font-bold">मार्केट विक्रेता</p>
              <p className="text-[10px] text-zinc-400">सामान पोस्ट करें</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;
