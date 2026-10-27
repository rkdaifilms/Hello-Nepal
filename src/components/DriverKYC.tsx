import React, { useState } from 'react';
import { FileCheck, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ENV } from '../config/env';

export const DriverKYC: React.FC = () => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [licenseNo, setLicenseNo] = useState<string>('');
  const [bluebookNo, setBluebookNo] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseNo || !bluebookNo) {
      alert('कृपया सवारी चालक अनुमतिपत्र र ब्लुबुक नम्बर अनिवार्य रूपमा भर्नुहोस्!');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 max-w-4xl mx-auto my-4">
      <div className="flex items-center space-x-2 mb-2">
        <FileCheck className="w-5 h-5 text-red-600" />
        <h3 className="font-black text-gray-900 text-lg">चालक तथा डेलिभरी केवाइसी (KYC) प्रमाणीकरण</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        सवारी चालक अनुमतिपत्र (Driving License) र ब्लुबुक अपलोड गरेपछि मात्र तपाईंको राइड आइडी सक्रिय हुनेछ।
      </p>

      {submitted ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h4 className="font-bold text-sm text-gray-900">कागजातहरू समीक्षाको लागि पठाइयो!</h4>
          <p className="text-xs text-gray-600 mt-1">
            हाम्रो टिमले २४ घण्टाभित्र प्रमाणीकरण पूरा गर्नेछ। समस्या परेमा <strong>{ENV.support.phone}</strong> मा सम्पर्क गर्नुहोस्।
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">लाइसेन्स नम्बर (Driving License)</label>
              <input
                type="text"
                placeholder="01-06-XXXXXXXX"
                value={licenseNo}
                onChange={(e) => setLicenseNo(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">ब्लुबुक नम्बर (Bluebook)</label>
              <input
                type="text"
                placeholder="लु ५ प XXXX"
                value={bluebookNo}
                onChange={(e) => setBluebookNo(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center space-x-2 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>खाता सक्रिय भएपछि कम्तीमा रु. २०० सुरक्षा धरौटी कायम राख्नुपर्छ।</span>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition text-sm flex items-center justify-center space-x-1"
          >
            <Upload className="w-4 h-4" />
            <span>कागजात प्रमाणीकरणको लागि पठाउनुहोस्</span>
          </button>
        </form>
      )}
    </div>
  );
};
