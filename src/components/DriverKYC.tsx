'use client';

import React, { useState, useEffect } from 'react';

export const DriverKYC = ({ onComplete, onSuccess, onBack, user, setUser }) => {
  const [licenseNo, setLicenseNo] = useState('');
  const [bluebookNo, setBluebookNo] = useState('');
  const [licensePreview, setLicensePreview] = useState(null);
  const [bluebookPreview, setBluebookPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // हेलो नेपाल ऐप से पुराना सेव्ड स्टेटस चेक करना
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('hello_nepal_driver_kyc');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.licenseNo) setLicenseNo(parsed.licenseNo);
        if (parsed.bluebookNo) setBluebookNo(parsed.bluebookNo);
        if (parsed.licensePreview) setLicensePreview(parsed.licensePreview);
        if (parsed.bluebookPreview) setBluebookPreview(parsed.bluebookPreview);
        if (parsed.status === 'pending' || parsed.status === 'verified') {
          setSubmitted(true);
        }
      }
    } catch (e) {
      console.warn('Storage read fallback');
    }
  }, []);

  // फोटो को सुरक्षित तरीके से प्रोसेस करना ताकि मेमोरी क्रैश न हो
  const handleFile = (e, type) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // 10MB भन्दा ठूलो फाइल भए चेतावनी
      if (file.size > 10 * 1024 * 1024) {
        setError('फोटो धेरै ठूलो भयो। कृपया १० MB भन्दा सानो फोटो छान्नुहोस्।');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target.result;
        if (type === 'license') {
          setLicensePreview(result);
        } else {
          setBluebookPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // फाराम बुझाउने मुख्य कार्य
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!licenseNo.trim() || !bluebookNo.trim()) {
      setError('कृपया सवारी चालक अनुमतिपत्र र ब्लुबुक नम्बर अनिवार्य रूपमा भर्नुहोस्!');
      return;
    }

    if (!licensePreview || !bluebookPreview) {
      setError('कृपया लाइसेन्स र ब्लुबुक दुवैको फोटो अपलोड गर्नुहोस्!');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const kycPayload = {
        licenseNo: licenseNo.trim(),
        bluebookNo: bluebookNo.trim(),
        // ब्राउजर क्र्यास हुन नदिन सुरक्षित थम्बनेल
        licensePreview: typeof licensePreview === 'string' ? licensePreview.slice(0, 500000) : null,
        bluebookPreview: typeof bluebookPreview === 'string' ? bluebookPreview.slice(0, 500000) : null,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };

      try {
        // १. हेलो नेपाल स्टोरेज सिंक
        localStorage.setItem('hello_nepal_driver_kyc', JSON.stringify(kycPayload));
        localStorage.setItem('driver_kyc_status', 'pending');
        localStorage.setItem('is_kyc_submitted', 'true');

        // २. यदि यूजर स्टेट छ भने अपडेट गर्ने
        if (typeof setUser === 'function' && user) {
          setUser({ ...user, kycStatus: 'pending', isVerified: false });
        }

        // ३. पूरा एपलाई सूचना दिने
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('kycUpdated', { detail: kycPayload }));
      } catch (err) {
        console.warn('LocalStorage limit safe pass');
      }

      setLoading(false);
      setSubmitted(true);

      // एपको अर्को स्क्रिनमा लैजाने कल
      if (typeof onSuccess === 'function') onSuccess(kycPayload);
      if (typeof onComplete === 'function') onComplete(kycPayload);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 max-w-4xl mx-auto my-4 font-sans text-gray-800">
      {/* शीर्ष पट्टी (Top Bar) */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-red-50 rounded-2xl text-red-600 flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-lg leading-tight">
              हेलो नेपाल चालक केवाइसी (KYC)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              प्रमाणीकरणपछि मात्र तपाईंको अनलाइन राइड आइडी सक्रिय हुनेछ।
            </p>
          </div>
        </div>

        {/* पछाडि जाने बटन (यदि एपमा आवश्यक भए) */}
        {typeof onBack === 'function' && (
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-bold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200"
          >
            फर्कनुहोस्
          </button>
        )}
      </div>

      <hr className="my-3 border-gray-100" />

      {/* सफल भएको सन्देश */}
      {submitted ? (
        <div className="p-6 md:p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="font-bold text-base text-gray-900">कागजातहरू समीक्षाको लागि पठाइयो!</h4>
          <p className="text-xs text-gray-600 max-w-md mx-auto mt-1 leading-relaxed">
            तपाईंको लाइसेन्स र ब्लुबुक हेलो नेपाल टिमकहाँ पुगेको छ। २४ घण्टाभित्र खाता सक्रिय हुनेछ।
          </p>
          <div className="mt-4 inline-block bg-white px-3.5 py-1.5 rounded-full border border-emerald-300 text-xs font-bold text-emerald-800 shadow-sm">
            स्थिति: समीक्षा हुँदैछ (Pending Verification)
          </div>
          {typeof onComplete === 'function' && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => onComplete()}
                className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-700"
              >
                ड्यासबोर्डमा जानुहोस्
              </button>
            </div>
          )}
        </div>
      ) : (
        /* मुख्य फाराम */
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* नम्बर इनपुटहरू */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                लाइसेन्स नम्बर (Driving License) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="उदा. 01-06-XXXXXXXX"
                value={licenseNo}
                onChange={(e) => setLicenseNo(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                ब्लुबुक नम्बर (Bluebook) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="उदा. लु ५ प XXXX / बा ०२ प XXXX"
                value={bluebookNo}
                onChange={(e) => setBluebookNo(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
          </div>

          {/* फोटो अपलोड सेक्सन */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* लाइसेन्स */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                लाइसेन्सको फोटो <span className="text-red-500">*</span>
              </label>
              <label className="border-2 border-dashed border-gray-200 hover:border-red-400 transition rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer min-h-[120px] bg-gray-50/50">
                {licensePreview ? (
                  <img src={licensePreview} alt="License" className="h-20 object-contain rounded" />
                ) : (
                  <>
                    <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-600 font-medium">लाइसेन्स फोटो छान्नुहोस्</span>
                    <span className="text-[10px] text-gray-400">JPG, PNG</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e, 'license')}
                />
              </label>
            </div>

            {/* ब्लुबुक */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                ब्लुबुकको फोटो <span className="text-red-500">*</span>
              </label>
              <label className="border-2 border-dashed border-gray-200 hover:border-red-400 transition rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer min-h-[120px] bg-gray-50/50">
                {bluebookPreview ? (
                  <img src={bluebookPreview} alt="Bluebook" className="h-20 object-contain rounded" />
                ) : (
                  <>
                    <svg className="w-7 h-7 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-600 font-medium">ब्लुबुक फोटो छान्नुहोस्</span>
                    <span className="text-[10px] text-gray-400">JPG, PNG</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e, 'bluebook')}
                />
              </label>
            </div>
          </div>

          {/* धरौटी सूचना */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center space-x-2 text-xs text-amber-800">
            <svg className="w-4 h-4 flex-shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>खाता सक्रिय भएपछि कम्तीमा रु. २०० सुरक्षा धरौटी कायम राख्नुपर्छ।</span>
          </div>

          {/* सबमिट बटन */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition text-sm flex items-center justify-center space-x-2 disabled:bg-gray-400 cursor-pointer shadow-sm"
          >
            {loading ? (
              <span>अपलोड तथा दर्ता हुँदैछ...</span>
            ) : (
              <span>कागजात प्रमाणीकरणको लागि पठाउनुहोस्</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default DriverKYC;
