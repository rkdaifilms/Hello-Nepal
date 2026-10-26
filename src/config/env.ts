export interface AppConfig {
  appName: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  mapboxToken: string;
  supportEmail: string;
  supportPhone: string;
  supportWhatsApp: string;
  officeLocation: string;
  rules: {
    adminCommissionPercent: number;
    driverMinimumBalanceNPR: number;
    referralLifetimeCapNPR: number;
    referralCommissionPercent: number;
  };
}

// सुरक्षित रूप से API Keys लोड करना ताकि ऐप क्रैश न हो
export const CONFIG: AppConfig = {
  appName: import.meta.env.VITE_APP_NAME || 'Hello Nepal',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://cbbmitfgayvcxzblkcpy.supabase.co',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__B6S4tetLFBGAcUHQR6UOw_h_amFyfy',
  mapboxToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoicmtkYWlmaWxtcyIsImEiOiJjbXZveDdtOHUweGIyMnpxeGtxemJjODV5In0.2BCQn8iiApvGhcXV-ez8Vg',
  supportEmail: 'Rkdaifilms@gmail.com',
  supportPhone: '+9779811522480',
  supportWhatsApp: '+9779811522480',
  officeLocation: 'Siddharthanagar-11, Bhairahawa, Rupandehi, Nepal',
  rules: {
    adminCommissionPercent: 5.0,        // अनिवार्य 5% एडमिन/डेवलपर कमीशन
    driverMinimumBalanceNPR: 200.0,     // ड्राइवर का 200 NPR अनिवार्य सिक्योरिटी लॉक
    referralLifetimeCapNPR: 200.0,      // प्रति रेफरल अधिकतम 200 NPR की कमाई
    referralCommissionPercent: 5.0,     // प्रति ट्रिप 5% रेफरल कट (0 अपफ्रंट)
  },
};
