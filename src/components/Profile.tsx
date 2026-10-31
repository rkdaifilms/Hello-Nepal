import React, { useState, useEffect } from 'react';
import { User, Navigation, Edit3, Share2, Heart, MessageCircle, DollarSign, Bot, Send, Camera } from 'lucide-react';

export default function Profile() {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // प्रोफाइल स्टेट
  const [profile, setProfile] = useState({
    name: 'Ramkumar Dhobi',
    bio: 'नेपाल का अपना डिजिटल क्रिएटर, ड्राइवर और स्वतंत्र सर्विस प्रोवाइडर।',
    phone: '+977 9811522480',
    facebook: 'https://facebook.com/ram.rkd',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    cover: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=600&h=200&q=80'
  });

  const [tempProfile, setTempProfile] = useState(profile);

  // कम्युनिटी फीड / पोस्ट्स स्टेट (रियल पोस्ट जो यूजर करेगा वही दिखेंगी)
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Ramkumar Dhobi',
      time: 'अभी-अभी',
      content: 'भैरहवा से भुजौली तक आज की सबसे बेहतरीन राइड और डिलीवरी सर्विस! सुरक्षित और कम किराए में सफर करें। 🛵',
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=500&h=300&q=80',
      likes: 12,
      isLiked: false,
      comments: [
        { id: 1, user: 'Bishal Thapa', text: 'बहुत बढ़िया भाई! शानदार सर्विस।' }
      ],
      newCommentText: ''
    }
  ]);

  // नया सामान बेचने के लिए पोस्ट करने का स्टेट
  const [showPostModal, setShowPostModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Medicines');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newImage, setNewImage] = useState<string>('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80');

  // रेफरल कमीशन और एडमिन 5% शेयर स्टेट
  const [totalShared, setTotalShared] = useState(12);
  const [referralEarnings, setReferralEarnings] = useState(150);
  const [adminCommissionPool, setAdminCommissionPool] = useState(450);
  const [copiedAffiliate, setCopiedAffiliate] = useState(false);

  // 🤖 सुपर-फास्ट लोकल AI चैटबॉक्स स्टेट
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'नमस्ते! मैं Hello Nepal AI सहायक हूँ। राइड, किराया, या ऐप के बारे में मुझसे कुछ भी पूछिए।' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
  };

  // 📂 गैलरी से फोटो को Base64 में बदलने का पक्का तरीका (Avatar)
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfile(prev => ({ ...prev, avatar: base64String }));
        setTempProfile(prev => ({ ...prev, avatar: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 📂 गैलरी से कवर फोटो को बदलने का तरीका
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfile(prev => ({ ...prev, cover: base64String }));
        setTempProfile(prev => ({ ...prev, cover: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 📂 पोस्ट या प्रोडक्ट के लिए गैलरी से फोटो लेने का तरीका
  const handlePostImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // प्रोफाइल से सामान/पोस्ट पब्लिश करने का फंक्शन (जो मार्केटप्लेस और फीड दोनों में दिखेगा)
  const handleCreateProductPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    const newProduct = {
      id: `prod-${Date.now()}`,
      vendorId: 'ven-my-profile',
      vendorName: profile.name,
      title: newTitle,
      category: newCategory,
      description: newDesc || 'कोई विवरण नहीं दिया गया',
      basePrice: Number(newPrice),
      markupPrice: Number(newPrice),
      imageUrl: newImage,
      stockCount: 10,
    };

    // 1. मार्केटप्लेस के लिए लोकल स्टोरेज में सेव करना
    const existing = localStorage.getItem('hello_nepal_marketplace_products');
    let parsedList = [];
    if (existing) {
      try {
        parsedList = JSON.parse(existing);
      } catch (err) {}
    }
    localStorage.setItem('hello_nepal_marketplace_products', JSON.stringify([newProduct, ...parsedList]));

    // 2. प्रोफाइल की कम्युनिटी फीड में भी नई पोस्ट जोड़ना
    const newFeedPost = {
      id: Date.now(),
      author: profile.name,
      time: 'अभी-अभी',
      content: `🛒 नया सामान लिस्ट किया: ${newTitle} - ${newDesc} (मूल्य: रु ${newPrice})`,
      image: newImage,
      likes: 0,
      isLiked: false,
      comments: [],
      newCommentText: ''
    };
    setPosts([newFeedPost, ...posts]);

    alert('सफलतापूर्वक सामान मार्केटप्लेस और आपकी प्रोफाइल फीड पर पोस्ट कर दिया गया है!');
    setNewTitle('');
    setNewPrice('');
    setNewDesc('');
    setShowPostModal(false);
  };

  const handleSimulateTripActivity = () => {
    const tripFare = 100; 
    const userCommission = tripFare * 0.05; 
    const adminShare = tripFare * 0.05; 

    let newEarnings = referralEarnings;
    if (referralEarnings < 200) {
      newEarnings = Math.min(200, referralEarnings + userCommission);
      setReferralEarnings(newEarnings);
    }

    setAdminCommissionPool(prev => prev + adminShare);

    alert(`ट्रिप पूरी हुई!\n- यूजर को मिला 5% कमीशन: Rs. ${userCommission}\n- डेवलपर/एडमिन को गया 5%: Rs. ${adminShare}`);
  };

  const handleLike = (postId: number) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          isLiked: !p.isLiked
        };
      }
      return p;
    }));
  };

  const handleAddComment = (postId: number, e: React.FormEvent) => {
    e.preventDefault();
    setPosts(posts.map(p => {
      if (p.id === postId && p.newCommentText.trim() !== '') {
        const newC = { id: Date.now(), user: profile.name, text: p.newCommentText };
        return {
          ...p,
          comments: [...p.comments, newC],
          newCommentText: ''
        };
      }
      return p;
    }));
  };

  const handleCopyAffiliateLink = () => {
    navigator.clipboard.writeText(`https://hello-nepal-ride.com/ref/RKD-${profile.name.replace(/\s+/g, '')}`);
    setCopiedAffiliate(true);
    setTotalShared(prev => prev + 1);
    setTimeout(() => setCopiedAffiliate(false), 2000);
  };

  // ⚡ सुपर-फास्ट लोकल स्मार्ट रिस्पॉन्स इंजन
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    const newMsgs = [...chatMessages, { sender: 'user', text: userText }];
    setChatMessages(newMsgs);
    setInputMessage('');

    setTimeout(() => {
      let aiReply = 'हाँ भाई, नेपाल में Hello Nepal ऐप आपकी सेवा के लिए तैयार है। बताइए क्या मदद चाहिए?';
      const lower = userText.toLowerCase();

      if (lower.includes('भाड़ा') || lower.includes('किराया') || lower.includes('fare') || lower.includes('पैसा')) {
        aiReply = 'भुजौली से भैरहवा (5 किमी) का बाइक का किराया सिर्फ Rs. 75 और ऑटो का Rs. 100 है—पठाओ से हमेशा ₹5 कम!';
      } else if (lower.includes('about') || lower.includes('एप') || lower.includes('app') || lower.includes('हैलो नेपाल')) {
        aiReply = 'Hello Nepal ऐप नेपाल का अपना लोकल राइड, डिलीवरी और मार्केटप्लेस है। (और हाँ: लड़के बाप नहीं बन पाएंगे क्योंकि वे दिनभर बाइक चलाते हैं! 🏍️😂)';
      } else if (lower.includes('बाप') || lower.includes('लड़के') || lower.includes('चुटकुला')) {
        aiReply = 'हाहा! "लड़के बाप नहीं बन पाएंगे क्योंकि वो बाइक चलाते हैं" — यह Hello Nepal ऐप की मजेदार कम्युनिटी लाइन है!';
      } else if (lower.includes('कमीशन') || lower.includes('referral') || lower.includes('रेफरल')) {
        aiReply = 'रेफरल सिस्टम में हर ट्रिप पर 5% कमीशन मिलता है जो अधिकतम Rs. 200 तक जुड़ता है, और 5% हिस्सा डेवलपर/एडमिन को जाता है।';
      } else if (lower.includes('राइड') || lower.includes('ride') || lower.includes('बुक')) {
        aiReply = 'राइड बुक करने के लिए ऊपर दिए गए "राइड" टैब पर जाएं, पिकअप और ड्रॉप लोकेशन चुनें!';
      } else if (lower.includes('मार्केट') || lower.includes('market') || lower.includes('सामान')) {
        aiReply = 'लोकल सामान खरीदने और बेचने के लिए "मार्केट" टैब पर जाएं या अपनी प्रोफाइल से नया सामान पोस्ट करें!';
      }

      setChatMessages([...newMsgs, { sender: 'ai', text: aiReply }]);
    }, 150);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-zinc-50 dark:bg-zinc-950 min-h-full pb-20 space-y-4 overflow-y-auto">
      
      {/* कवर और प्रोफाइल हेडर */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 rounded-b-3xl shadow-sm overflow-hidden">
        
        {/* गैलरी से कवर बदलने का ऑप्शन */}
        <label className="relative h-32 bg-zinc-200 dark:bg-zinc-800 cursor-pointer group block">
          <img src={profile.cover} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
            <Camera className="w-4 h-4" /> गैलरी से कवर बदलें
          </div>
          <input type="file" accept="image/*" onChange={handleCoverFileChange} className="hidden" />
        </label>

        <div className="px-5 pb-5 relative">
          <div className="flex justify-between items-end -mt-10 mb-3">
            
            {/* गैलरी से प्रोफाइल फोटो बदलने का ऑप्शन */}
            <label className="relative w-20 h-20 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden bg-white shadow-md cursor-pointer group block">
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                <Camera className="w-6 h-6" />
              </div>
              <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
            </label>
            
            {!isEditing && (
              <button 
                onClick={() => { setTempProfile(profile); setIsEditing(true); }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> प्रोफाइल एडिट करें
              </button>
            )}
          </div>

          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{profile.name}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{profile.bio}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
              <span>📱 {profile.phone}</span>
              <span>📍 सिद्धार्थनगर, नेपाल</span>
            </div>
          </div>
        </div>
      </div>

      {/* एडिट मोड फॉर्म */}
      {isEditing && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3 mx-4">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">प्रोफाइल डिटेल्स अपडेट करें</h3>
          
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 font-bold">पूरा नाम</label>
            <input 
              type="text" 
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

      {/* 🛒 मार्केटप्लेस के लिए सामान पोस्ट करने का बटन */}
      <div className="mx-4">
        <button 
          onClick={() => setShowPostModal(true)}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow flex items-center justify-center gap-2"
        >
          📦 मार्केटप्लेस पर बेचने के लिए नया सामान पोस्ट करें
        </button>
      </div>

      {/* 🤝 रेफरल शेयरिंग और 5% ट्रिप कमीशन सिस्टम */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-5 shadow-md space-y-3 mx-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" /> रेफरल & 5% ट्रिप कमीशन
          </h3>
          <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full font-bold">मैक्स सीमा Rs. 200</span>
        </div>
        
        <p className="text-xs text-amber-100 leading-relaxed">
          जिसे मर्जी शेयर करें! हर ट्रिप/काम पर 5% कमीशन आपके खाते में जुड़ता है (अधिकतम सीमा Rs. 200 तक)। साथ ही 5% हिस्सा एडमिन/डेवलपर को जाता है।
        </p>

        <div className="bg-black/20 p-3 rounded-2xl flex items-center justify-between text-xs">
          <span className="font-mono truncate mr-2">https://hello-nepal-ride.com/ref/RKD-{profile.name.replace(/\s+/g, '')}</span>
          <button 
            onClick={handleCopyAffiliateLink}
            className="px-3 py-1.5 bg-white text-orange-600 rounded-xl font-bold text-[11px] shadow shrink-0"
          >
            {copiedAffiliate ? 'लिंक शेयर/कॉपी हुआ! ✅' : 'लिंक शेयर करें'}
          </button>
        </div>

        <div className="flex justify-between items-center pt-1 text-xs font-semibold text-amber-100">
          <span>कुल शेयर: {totalShared} बार</span>
          <span>कमीशन: Rs. {referralEarnings} / 200 NPR</span>
        </div>

        <div className="flex justify-between items-center pt-1 text-[11px] text-amber-200 border-t border-white/20">
          <span>डेवलपर/एडमिन 5% शेयर पूल:</span>
          <span className="font-bold">Rs. {adminCommissionPool} NPR</span>
        </div>

        <button 
          onClick={handleSimulateTripActivity}
          className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs border border-white/30 transition"
        >
          🔄 टेस्ट करें: ट्रिप पूरी होने पर 5% कमीशन जोड़ें
        </button>
      </div>

      {/* 🤖 सुपर-फास्ट लोकल AI चैटबॉक्स */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-3 mx-4">
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <Bot className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Hello Nepal AI सहायक</h3>
            <p className="text-[10px] text-zinc-400">सुपर-फास्ट लोकल आटोमैटिक चैट सिस्टम</p>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl h-36 overflow-y-auto space-y-2 text-xs">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-2.5 rounded-2xl max-w-[85%] ${msg.sender === 'user' ? 'bg-red-600 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendChat} className="flex gap-2">
          <input 
            type="text" 
            placeholder="कुछ भी पूछें (जैसे: किराया, अबाउट, कमीशन)..." 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-xl outline-none focus:ring-2 focus:ring-red-500"
          />
          <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow">
            <Send className="w-3.5 h-3.5" /> भेजें
          </button>
        </form>
      </div>

      {/* 📱 कम्युनिटी फीड / पोस्ट्स (रियल पोस्ट्स के साथ) */}
      <div className="space-y-4 px-4">
        <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider px-1">मेरी कम्युनिटी पोस्ट्स & अपडेट</h3>
        
        {posts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-3">
            
            <div className="flex items-center gap-3">
              <img src={profile.avatar} alt="Author" className="w-9 h-9 rounded-full object-cover border" />
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{post.author}</p>
                <p className="text-[10px] text-zinc-400">{post.time}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{post.content}</p>

            {post.image && (
              <div className="rounded-2xl overflow-hidden h-48 bg-zinc-100 dark:bg-zinc-800">
                <img src={post.image} alt="Post media" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
              <button 
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-xl transition ${post.isLiked ? 'text-red-600 bg-red-50 dark:bg-red-950/30' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-600' : ''}`} /> {post.likes} लाइक्स
              </button>

              <button className="flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <MessageCircle className="w-4 h-4" /> {post.comments.length} कमेंट्स
              </button>

              <button 
                onClick={() => alert('पोस्ट लिंक शेयर के लिए कॉपी कर लिया गया है!')}
                className="flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-blue-600"
              >
                <Share2 className="w-4 h-4" /> शेयर
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {post.comments.map(c => (
                <div key={c.id} className="bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-2xl text-xs">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 mr-2">{c.user}:</span>
                  <span className="text-zinc-600 dark:text-zinc-300">{c.text}</span>
                </div>
              ))}

              <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex gap-2 pt-1">
                <input 
                  type="text" 
                  placeholder="अपना कमेंट लिखें..." 
                  value={post.newCommentText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPosts(posts.map(p => p.id === post.id ? {...p, newCommentText: val} : p));
                  }}
                  className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                />
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs">
                  भेजें
                </button>
              </form>
            </div>

          </div>
        ))}
      </div>

      {/* सामान और पोस्ट जोड़ने का मॉडल पॉपअप */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">🛒 नया सामान / पोस्ट पब्लिश करें</h3>
              <button onClick={() => setShowPostModal(false)} className="text-zinc-400 font-bold text-base">✕</button>
            </div>

            <form onSubmit={handleCreateProductPost} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-zinc-400 font-bold">शीर्षक / सामान का नाम</label>
                <input 
                  type="text" 
                  placeholder="जैसे: पाल्पाली टोपी, सिलाजीत..." 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  required 
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl outline-none mt-1" 
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-bold">कैटेगरी चुनें</label>
                <select 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)} 
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl outline-none mt-1"
                >
                  <option value="Medicines">Medicines (दवाइयां)</option>
                  <option value="Food">Food (भोजन/मसाले)</option>
                  <option value="Clothing">Clothing (कपड़े)</option>
                  <option value="Cars">Cars (गाड़ियां)</option>
                  <option value="Electronics">Electronics (इलेक्ट्रॉनिक्स)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-bold">कीमत (रु NPR)</label>
                <input 
                  type="number" 
                  placeholder="जैसे: 500" 
                  value={newPrice} 
                  onChange={(e) => setNewPrice(e.target.value)} 
                  required 
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl outline-none mt-1" 
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-bold">विवरण (Description)</label>
                <textarea 
                  placeholder="सामान या पोस्ट के बारे में लिखें..." 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                  rows={2} 
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl outline-none mt-1" 
                />
              </div>

              {/* गैलरी से फोटो चुनने का ऑप्शन */}
              <div>
                <label className="text-[10px] text-zinc-400 font-bold">गैलरी से फोटो चुनें</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePostImageFileChange} 
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl outline-none mt-1 text-[11px]" 
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow transition"
              >
                मार्केट और प्रोफाइल पर पब्लिश करें
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
