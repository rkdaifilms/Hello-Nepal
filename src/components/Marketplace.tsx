
import React, { useState } from 'react';
import type { ProductItem } from '../types';
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

const Marketplace: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] =
    useState<ProductItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    'All',
    'Medicines',
    'Food',
    'Clothing',
    'Cars',
    'Electronics',
  ];

  const filteredProducts = PRODUCTS.filter((product) => {
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
                      रु {product.markupPrice}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-zinc-400">स्टॉक</span>
                    <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {product.stockCount} पीस
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

      {selectedProduct && (
        <CheckoutModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default Marketplace;
