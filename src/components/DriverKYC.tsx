'use client';

import React, { useState, useEffect } from 'react';

export const DriverKYC = ({ onComplete, onSuccess, onVerify }) => {
  const [licenseNo, setLicenseNo] = useState('');
  const [bluebookNo, setBluebookNo] = useState('');
  const [licenseFile, setLicenseFile] = useState(null);
  const [bluebookFile, setBluebookFile] = useState(null);
  const [previews, setPreviews] = useState({ license: null, bluebook: null });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // पहले से अगर कोई डेटा सेव है तो उसे लोड कर लो ताकि ऐप मैच कर सके
  useEffect(() => {
    try {
      const savedKYC = localStorage.getItem('driver_kyc_data');
      const savedStatus = localStorage.getItem('driver_kyc_status');
      if (savedKYC) {
        const parsed = JSON.parse(savedKYC);
        setLicenseNo(parsed.licenseNo || '');
        setBluebookNo(parsed.bluebookNo || '');
      }
      if (savedStatus === 'pending' || savedStatus === 'verified') {
        setSubmitted(true);
      }
    } catch (e) {
      console.log('Storage read error', e);
    }
  }, []);

  // फोटो हैंडलर
  const handleFileChange = (e, type) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'license') {
          setLicenseFile(file);
          setPreviews((prev) => ({ ...prev, license: reader.result }));
        } else {
          setBluebookFile(file);
          setPreviews((prev) => ({ ...prev, bluebook: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // सबमिट और ऐप के साथ सिंक (Sync)
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!licenseNo.trim() || !bluebookNo.trim()) {
      setError('कृपया लाइसेन्स नम्बर र ब्लुबुक नम्बर अनिवार्य रूपमा भर्नुहोस्!');
      return;
    }

    if (!licenseFile && !previews.license) {
      setError('कृपया लाइसेन्सको फोटो अपलोड गर्नुहोस्!');
      return;
    }

    if (!bluebookFile && !previews.bluebook) {
      setError('कृपया ब्लुबुकको फोटो अपलोड गर्नुहोस्!');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const kycData = {
        licenseNo: licenseNo.trim(),
        bluebookNo: bluebookNo.trim(),
        licenseImage: previews.license,
        bluebookImage: previews.bluebook,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };

      try {
        // ऐप के लोकल स्टोरेज में सेव ताकि बैकएंड और बाकी पेज पर डेटा मैच करे
        localStorage.setItem('driver_kyc_data', JSON.stringify(kycData));
        localStorage.setItem('driver_kyc_status', 'pending');
        localStorage.setItem('is_kyc_submitted', 'true');

        // पूरे ऐप में अपडेट का सिग्नल भेजो
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('kycSubmitted', { detail: kycData }));
      } catch (err) {
        console.error('Save error', err);
      }

      setLoading(false);
      setSubmitted(true);

      // अगर ऐप के मुख्य पेज ने कोई फंक्शन पास किया है तो उसे कॉल करो
      if (typeof onSuccess === 'function') onSuccess(kycData);
      if (typeof onComplete === 'function') onComplete(kycData);
      if (typeof onVerify === 'function') onVerify(kycData);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 max-w-4xl mx-auto my-6 font-sans">
      {/* हेडर */}
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2.5 bg-red-50 rounded-2xl text-red-600 flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="font-black text-gray-900 text-lg leading-tight">
            चालक तथा डेलिभरी केवाइसी (KYC) प्रमाणीकरण
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            सवारी चालक अनुमतिपत्र (Driving License) र ब्लुबुक अपलोड गरेपछि मात्र तपाईंको राइड आइडी सक्रिय हुनेछ।
          </p>
        </div>
      </div>

      <hr className="my-4 border-gray-100" />

      {submitted ? (
        <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="font-bold text-base text-gray-900">कागजातहरू समीक्षाको लागि पठाइयो!</h4>
          <p className="text-xs text-gray-600 max-w-md mx-auto mt-1 leading-relaxed">
            तपाईंको विवरण सुरक्षित रूपमा पठाइएको छ। हाम्रो टिमले २४ घण्टाभित्र प्रमाणीकरण पूरा गर्नेछ।
          </p>
          <div className="mt-4 inline-block bg-white px-3 py-1.5 rounded-full border border-emerald-300 text-[11px] font-bold text-emerald-800">
            स्थिति: प्रमाणीकरण प्रक्रियामा (Pending Verification)
          </div>
        </div>
      ) : (
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
                className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                ब्लुबुक नम्बर (Bluebook) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="उदा. बागमती प्रदेश ०२-०३० प XXXX"
                value={bluebookNo}
                onChange={(e) => setBluebookNo(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* फोटो अपलोड */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                लाइसेन्सको फोटो <span className="text-red-500">*</span>
              </label>
              <label className="border-2 border-dashed border-gray-200 hover:border-red-400 transition rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer min-h-[120px] bg-gray-50/50">
                {previews.license ? (
                  <img src={previews.license} alt="License" className="h-20 object-contain rounded" />
                ) : (
                  <>
                    <svg className="w-7 h-7 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-600 font-medium">लाइसेन्स फोटो अपलोड गर्नुहोस्</span>
                    <span className="text-[10px] text-gray-400">JPG, PNG</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'license')}
                />
              </label>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                ब्लुबुकको फोटो <span className="text-red-500">*</span>
              </label>
              <label className="border-2 border-dashed border-gray-200 hover:border-red-400 transition rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer min-h-[120px] bg-gray-50/50">
                {previews.bluebook ? (
                  <img src={previews.bluebook} alt="Bluebook" className="h-20 object-contain rounded" />
                ) : (
                  <>
                    <svg className="w-7 h-7 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-600 font-medium">ब्लुबुक फोटो अपलोड गर्नुहोस्</span>
                    <span className="text-[10px] text-gray-400">JPG, PNG</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'bluebook')}
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
            className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition text-sm flex items-center justify-center space-x-2 disabled:bg-gray-400 cursor-pointer"
          >
            {loading ? (
              <span>अपलोड तथा प्रमाणीकरण हुँदैछ...</span>
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
