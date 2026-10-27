import React, { useState } from 'react';
import { FileCheck, Upload, AlertTriangle, CheckCircle2, Image as ImageIcon, Loader2 } from 'lucide-react';
// यदि ब्याकइन्डको URL चाहियो भने यसलाई अनकमेन्ट गर्न सक्नुहुन्छ:
// import { ENV } from '../config/env';

export const DriverKYC = () => {
  const [licenseNo, setLicenseNo] = useState('');
  const [bluebookNo, setBluebookNo] = useState('');
  const [licenseFile, setLicenseFile] = useState(null);
  const [bluebookFile, setBluebookFile] = useState(null);

  const [previews, setPreviews] = useState({ license: null, bluebook: null });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // फोटो छानेपछि पूर्वावलोकन (Preview) देखाउने फङ्सन
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'license') {
        setLicenseFile(file);
        setPreviews((prev) => ({ ...prev, license: URL.createObjectURL(file) }));
      } else {
        setBluebookFile(file);
        setPreviews((prev) => ({ ...prev, bluebook: URL.createObjectURL(file) }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // १. भ्यालिडेसन (खाली छ कि छैन जाँच)
    if (!licenseNo.trim() || !bluebookNo.trim()) {
      setError('कृपया लाइसेन्स नम्बर र ब्लुबुक नम्बर अनिवार्य रूपमा भर्नुहोस्!');
      return;
    }

    if (!licenseFile || !bluebookFile) {
      setError('कृपया लाइसेन्स र ब्लुबुक दुवैको फोटो अपलोड गर्नुहोस्!');
      return;
    }

    setLoading(true);

    try {
      // ब्याकइन्डमा पठाउन FormData तयार गरिन्छ:
      const formData = new FormData();
      formData.append('licenseNo', licenseNo);
      formData.append('bluebookNo', bluebookNo);
      formData.append('licenseFile', licenseFile);
      formData.append('bluebookFile', bluebookFile);

      // कृत्रिम लोड टाइम (नेटवर्क कल जस्तै देखाउन १.५ सेकेन्ड)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitted(true);
    } catch (err) {
      setError('कागजात पठाउँदा समस्या आयो। कृपया पुनः प्रयास गर्नुहोस्।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 max-w-4xl mx-auto my-4">
      {/* हेडर */}
      <div className="flex items-center space-x-2.5 mb-2">
        <div className="p-2 bg-red-50 rounded-xl text-red-600">
          <FileCheck className="w-5 h-5" />
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

      {/* फाराम पठाइसकेपछिको मेसेज */}
      {submitted ? (
        <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h4 className="font-bold text-base text-gray-900">कागजातहरू समीक्षाको लागि पठाइयो!</h4>
          <p className="text-xs text-gray-600 max-w-md mx-auto mt-1 leading-relaxed">
            हाम्रो टिमले २४ घण्टाभित्र प्रमाणीकरण पूरा गर्नेछ। समस्या परेमा सपोर्ट टिममा सम्पर्क गर्नुहोस्।
          </p>
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
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500"
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
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* फोटो अपलोड बक्सहरू */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* लाइसेन्स अपलोड */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                लाइसेन्सको फोटो <span className="text-red-500">*</span>
              </label>
              <label className="border-2 border-dashed border-gray-200 hover:border-red-400 transition rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer min-h-[120px] bg-gray-50/50">
                {previews.license ? (
                  <img src={previews.license} alt="License" className="h-20 object-contain rounded" />
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
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

            {/* ब्लुबुक अपलोड */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                ब्लुबुकको फोटो <span className="text-red-500">*</span>
              </label>
              <label className="border-2 border-dashed border-gray-200 hover:border-red-400 transition rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer min-h-[120px] bg-gray-50/50">
                {previews.bluebook ? (
                  <img src={previews.bluebook} alt="Bluebook" className="h-20 object-contain rounded" />
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
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
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>खाता सक्रिय भएपछि कम्तीमा रु. २०० सुरक्षा धरौटी कायम राख्नुपर्छ।</span>
          </div>

          {/* सबमिट बटन */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition text-sm flex items-center justify-center space-x-2 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>अपलोड हुँदैछ...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>कागजात प्रमाणीकरणको लागि पठाउनुहोस्</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
