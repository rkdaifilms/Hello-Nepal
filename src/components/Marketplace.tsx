import React, { useState, useEffect } from 'react';
import type { ProductItem } from '../types';
import { Search, Share2, ShoppingBag, Check, X, QrCode, CreditCard, Smartphone } from 'lucide-react';

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    vendorId: 'ven-1',
    vendorName: 'Lumbini Ayurvedic Center',
    title: 'शुद्ध मुस्तांग सिलाजीत (50g)',
    category: 'Medicines',
    description: 'नेपाल के मुस्तांग जिले से शुद्ध और लैब-टेस्टेड शिलाजीत।',
    basePrice: 1200,
    markupPrice: 1260,
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80',
    stockCount: 15,
  },
  {
    id: 'prod-2',
    vendorId: 'ven-2',
    vendorName: 'Palpali Special Store',
    title: 'पाल्पाली चुकाउनी एवं बटुक मिक्स',
    category: 'Food',
    description: 'बुटवल का प्रसिद्ध पारंपरिक पाल्पाली मसाला पैक।',
    basePrice: 350,
    markupPrice: 368,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    stockCount: 12,
  },
  {
    id: 'prod-3',
    vendorId: 'ven-3',
    vendorName: 'Nepal Handloom Weavers',
    title: 'हाथ से बुनी असली पाल्पाली ढाका टोपी',
    category: 'Clothing',
    description: '100% शुद्ध कॉटन से तैयार पारंपरिक नेपाली ढाका टोपी।',
    basePrice: 600,
    markupPrice: 630,
    imageUrl: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=400&q=80',
    stockCount: 25,
  },
];

const Marketplace: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>(() => {
    const saved = localStorage.getItem('hello_nepal_marketplace_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...parsed, ...INITIAL_PRODUCTS];
      } catch (e) {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // पेमेंट और चेकआउट स्टेट
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti' | 'imepay' | 'card' | 'qr'>('esewa');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [customQrImage, setCustomQrImage] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const categories = [
    'All',
    'Medicines',
    'Food',
    'Clothing',
    'Cars',
    'Electronics',
  ];

  useEffect(() => {
    const syncProducts = () => {
      const saved = localStorage.getItem('hello_nepal_marketplace_products');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProducts([...parsed, ...INITIAL_PRODUCTS]);
        } catch (e) {}
      }
    };

    syncProducts();
    window.addEventListener('storage', syncProducts);
    return () => window.removeEventListener('storage', syncProducts);
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      product.category === selectedCategory;

    const query = searchQuery.trim().toLowerCase();

    const matchesQuery =
      product.title.toLowerCase().includes(query) ||
      product.vendorName.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  const handleShare = async (product: ProductItem) => {
    const link = `https://hellonepal.app/item/${product.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: link,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        setCopiedId(product.id);
        window.setTimeout(() => setCopiedId(null), 2000);
      } else {
        window.prompt('इस लिंक को कॉपी करें:', link);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        window.prompt('इस लिंक को कॉपी करें:', link);
      }
    }
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomQrImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerPhone || !buyerAddress) {
      alert('कृपया अपना फोन नंबर और डिलीवरी पता दर्ज करें!');
      return;
    }

    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setSelectedProduct(null);
      setBuyerPhone('');
      setBuyerAddress('');
      alert('सफलतापूर्वक ऑर्डर बुक हो गया है! सामान आपके पते पर भेजा जा रहा है।');
    }, 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-red-600" />
            नेपाल लोकल मार्केटप्लेस (पेमेंट लिंक्ड)
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />

            <input
              type="text"
              placeholder="लोकल सामान, दवाई, खाना खोजें..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          कोई सामान नहीं मिला। दूसरा नाम या कैटेगरी खोजें।
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />

                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2.5 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {product.vendorName}
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {product.title}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400">मूल्य</span>
                    <div className="text-base font-extrabold text-red-600">
                      रु {product.markupPrice || product.basePrice}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-zinc-400">स्टॉक</span>
                    <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {product.stockCount || 10} पीस
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    खरीदें (Buy Now)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(product)}
                    className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl transition-colors"
                    title="शेयर करें"
                    aria-label="सामान शेयर करें"
                  >
                    {copiedId === product.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🛒 चेकआउट और पेमेंट मॉडल (ई-सेवा, खल्ती, आईएमई पे, क्यूआर और कार्ड) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 font-bold text-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <img src={selectedProduct.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{selectedProduct.title}</h3>
                <p className="text-xs text-red-600 font-extrabold">मूल्य: रु {selectedProduct.markupPrice || selectedProduct.basePrice}</p>
              </div>
            </div>

            {orderSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">भुगतान सफल रहा!</h4>
                <p className="text-xs text-zinc-500">आपका ऑर्डर कन्फर्म हो गया है और होम डिलीवरी के लिए भेज दिया गया है।</p>
              </div>
            ) : (
              <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-600 dark:text-zinc-400">आपका मोबाइल नंबर (फोन पे / संपर्क)</label>
                  <input 
                    type="text" 
                    placeholder="जैसे: +977 9811522480" 
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-600 dark:text-zinc-400">डिलीवरी का पूरा पता (Address)</label>
                  <textarea 
                    placeholder="जैसे: भुजौली (Ward No. 11), भैरहवा, रूपन्देही" 
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    rows={2}
                    required
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-zinc-600 dark:text-zinc-400">पेमेंट माध्यम चुनें (Payment Gateway)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('esewa')}
                      className={`p-2.5 rounded-xl border font-bold text-[11px] flex flex-col items-center gap-1 transition ${paymentMethod === 'esewa' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-zinc-50 border-zinc-200'}`}
                    >
                      <Smartphone className="w-4 h-4 text-emerald-600" /> eSewa (ई-सेवा)
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('khalti')}
                      className={`p-2.5 rounded-xl border font-bold text-[11px] flex flex-col items-center gap-1 transition ${paymentMethod === 'khalti' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-zinc-50 border-zinc-200'}`}
                    >
                      <Smartphone className="w-4 h-4 text-purple-600" /> Khalti (खल्ती)
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('imepay')}
                      className={`p-2.5 rounded-xl border font-bold text-[11px] flex flex-col items-center gap-1 transition ${paymentMethod === 'imepay' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-zinc-50 border-zinc-200'}`}
                    >
                      <Smartphone className="w-4 h-4 text-blue-600" /> IME Pay
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-2 transition ${paymentMethod === 'card' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-zinc-50 border-zinc-200'}`}
                    >
                      <CreditCard className="w-4 h-4" /> डेबिट / क्रेडिट कार्ड
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('qr')}
                      className={`p-2.5 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-2 transition ${paymentMethod === 'qr' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-zinc-50 border-zinc-200'}`}
                    >
                      <QrCode className="w-4 h-4" /> QR स्कैनर (Scan & Pay)
                    </button>
                  </div>
                </div>

                {/* अगर QR स्कैनर चुना गया हो तो दुकानदार का QR अपलोड करने या देखने का विकल्प */}
                {paymentMethod === 'qr' && (
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-2xl space-y-2 border border-zinc-200 dark:border-zinc-700 text-center">
                    <p className="text-[11px] text-zinc-500 font-medium">दुकानदार का पेमेंट QR कोड यहाँ स्कैन करें या अपलोड करें</p>
                    {customQrImage ? (
                      <img src={customQrImage} alt="Vendor QR" className="w-32 h-32 object-contain mx-auto rounded-xl border" />
                    ) : (
                      <div className="w-32 h-32 bg-zinc-200 dark:bg-zinc-900 rounded-xl flex items-center justify-center mx-auto text-[10px] text-zinc-400 font-bold">
                        QR फोटो नहीं है
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleQrUpload} className="text-[10px] w-full pt-1" />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-extrabold text-xs shadow-md transition"
                >
                  रु {selectedProduct.markupPrice || selectedProduct.basePrice} भुगतान करें और आर्डर कन्फर्म करें
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
