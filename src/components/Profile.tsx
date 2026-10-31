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
