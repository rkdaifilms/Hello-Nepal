import React, { useState } from 'react';
import { User, Phone, MapPin, Camera, Link as LinkIcon, Edit3, ShieldCheck, CheckCircle2, ShoppingBag, Navigation } from 'lucide-react';

export const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'राम कुमार धोबी',
    role: 'राइडर & कंटेंट क्रिएटर',
    bio: 'Hello Nepal का स्वतंत्र राइडर और डिजिटल क्रिएटर। भैरहवा और बुटवल क्षेत्र में सेवा उपलब्ध।',
    phone: '+977-9800000000',
    location: 'Siddharthanagar, Bhairahawa, Nepal',
    facebook: 'https://facebook.com/ramrkd',
    tiktok: 'https://tiktok.com/@callpriyance',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
  });

  const [tempProfile, setTempProfile] = useState(profile);

  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 pb-24">
      
      {/* Header Banner / Cover */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center justify-between">
          <h1 className="font-extrabold text-base flex items-center gap-2">
            <User className="w-5 h-5" /> यूजर एवं क्रिएटर प्रोफाइल
          </h1>
          <span className="bg-white/20 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full">
            सक्रिय खाता (Active)
          </span>
        </div>
      </div>

      {/* Profile Card Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Avatar & Basic Info */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="relative group">
            <img 
              src={profile.avatar} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-4 border-red-600 shadow-md"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center justify-center sm:justify-start gap-1.5">
              {profile.name} <ShieldCheck className="w-5 h-5 text-red-600" />
            </h2>
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
              <a href={profile.facebook} target="_blank" rel="noreferrer" className="font-bold text-blue-600 truncate block hover:underline">
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
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold">बायो (Bio)</label>
              <textarea 
                value={tempProfile.bio}
                onChange={(e) => setTempProfile({...tempProfile, bio: e.target.value})}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-xl"
                rows={2}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold">मोबाइल नंबर</label>
              <input 
                type="text" 
                value={tempProfile.phone}
                onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold">फेसबुक / सोशल लिंक</label>
              <input 
                type="text" 
                value={tempProfile.facebook}
                onChange={(e) => setTempProfile({...tempProfile, facebook: e.target.value})}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-xl"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs shadow"
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

      {/* Quick Role Switcher (Rider / Seller Option) */}
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
