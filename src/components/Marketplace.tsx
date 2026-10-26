import React, { useState } from 'react';
import { ProductItem } from '../types';
import { CheckoutModal } from './CheckoutModal';
import { Search, Share2, ShoppingBag, Check } from 'lucide-react';

const PRODUCTS: ProductItem[] = [
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

export const Marketplace: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'Medicines', 'Food', 'Clothing', 'Cars', 'Electronics'];

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesQuery =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleShare = (prod: ProductItem) => {
    const link = `https://hellonepal.app/item/${prod.id}?ref=USER_AFFILIATE`;
    navigator.clipboard.writeText(link);
    setCopiedId(prod.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-red-600" />
            नेपाल लोकल मार्केटप्लेस
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="लोकल सामान, दवाई, खाना खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <img
                src={prod.imageUrl}
                alt={prod.title}
                className="w-full h-44 object-cover"
                loading="lazy"
              />
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-red-600">{prod.vendorName}</span>
                  <span className="text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    {prod.category}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                  {prod.title}
                </h3>
                <p className="text-xs text-zinc-500 line-clamp-2">{prod.description}</p>
              </div>
            </div>

            <div className="p-4 pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-zinc-400">कुल मूल्य</p>
                  <p className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                    Rs. {prod.markupPrice} NPR
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleShare(prod)}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs flex items-center gap-1"
                  title="एफिलिएट शेयर लिंक"
                >
                  {copiedId === prod.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProduct(prod)}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
              >
                तुरंत खरीदें (eSewa / Khalti)
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <CheckoutModal
          isOpen={!!selectedProduct}
          title={selectedProduct.title}
          amount={selectedProduct.markupPrice}
          onClose={() => setSelectedProduct(null)}
          onSuccess={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
