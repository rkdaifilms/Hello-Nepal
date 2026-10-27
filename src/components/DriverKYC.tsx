import React, { useState, useEffect } from 'react';

export default function DriverKYC() {
  const [fullName, setFullName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    const savedStatus = localStorage.getItem('kyc_status');
    if (savedStatus) setStatus(savedStatus);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('kyc_status', 'submitted');
    localStorage.setItem('driver_license', licenseNo);
    setStatus('submitted');
    alert('केवाइसी विवरण सफलतापूर्वक सबमिट भयो!');
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-4">
      <div className="border-b pb-3">
        <h3 className="text-lg font-black text-gray-900">चालक केवाइसी (KYC) प्रमाणीकरण</h3>
        <p className="text-xs text-gray-500">कृपया आफ्नो सहि विवरण भर्नुहोस्।</p>
      </div>

      {status === 'submitted' ? (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-2">
          <h4 className="text-emerald-800 font-bold text-sm">केवाइसी पेन्डिङ / सबमिट भइसकेको छ!</h4>
          <p className="text-xs text-emerald-600">तपाईंको विवरण प्रशासक (Admin) द्वारा जाँच हुँदैछ।</p>
          <button 
            onClick={() => { setStatus('pending'); localStorage.removeItem('kyc_status'); }}
            className="mt-2 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg"
          >
            फेरी फारम भर्नुहोस्
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">पूरा नाम (Full Name)</label>
            <input 
              type="text" 
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="तपाईंको नाम"
              className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">ड्राइभर लाइसेन्स नम्बर (License No.)</label>
            <input 
              type="text" 
              required
              value={licenseNo}
              onChange={(e) => setLicenseNo(e.target.value)}
              placeholder="उदा: 01-12345678"
              className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">सम्पर्क नम्बर (Phone Number)</label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98xxxxxxxx"
              className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-md"
          >
            प्रमाणित गर्न पेस गर्नुहोस् (Submit KYC)
          </button>
        </form>
      )}
    </div>
  );
}

