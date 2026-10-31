import React, { useState } from 'react';
import { User, Navigation, ShoppingBag, Edit3, Share2, Heart, MessageCircle, Link as LinkIcon, DollarSign, Bot, Send } from 'lucide-react';

export default function Profile() {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // प्रोफाइल स्टेट
  const [profile, setProfile] = useState({
    name: 'Ramkumar Dhobi',
    bio: 'नेपाल का अपना डिजिटल क्रिएटर, ड्राइवर और स्वतंत्र सर्विस प्रोवाइडर।',
    phone: '+977 98XXXXXXXX',
    facebook: 'https://facebook.com/ram.rkd',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    cover: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=600&h=200&q=80'
  });

  const [tempProfile, setTempProfile] = useState(profile);

  // सोशल पोस्ट और फीड स्टेट (लाइक, कमेंट, शेयर के लिए)
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Ramkumar Dhobi',
      time: '2 घंटे पहले',
      content: 'भैरहवा से भुजौली तक आज की सबसे बेहतरीन राइड और डिलीवरी सर्विस! सुरक्षित और कम किराए में सफर करें। 🛵',
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=500&h=300&q=80',
      likes: 24,
      isLiked: false,
      comments: [
        { id: 1, user: 'Bishal Thapa', text: 'बहुत बढ़िया भाई! शानदार सर्विस।' }
      ],
      newCommentText: ''
    }
  ]);

  // एफिलिएट प्रोग्राम स्टेट
  const [affiliateClicks, setAffiliateClicks] = useState(142);
  const [affiliateEarnings, setAffiliateEarnings] = useState(1250); // NPR
  const [copiedAffiliate, setCopiedAffiliate] = useState(false);

  // 🤖 AI चैटबॉक्स स्टेट
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'नमस्ते! मैं Hello Nepal AI हूँ। राइड, किराया, या ऐप के बारे में मुझसे कुछ भी पूछिए।' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
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
    setAffiliateClicks(prev => prev + 1);
    setTimeout(() => setCopiedAffiliate(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    const newMsgs = [...chatMessages, { sender: 'user', text: userText }];
    setChatMessages(newMsgs);
    setInputMessage('');

    setTimeout(() => {
      let aiReply = 'समझा भाई! नेपाल में Hello Nepal ऐप आपकी सेवा के लिए हमेशा तैयार है।';
      const lower = userText.toLowerCase();

      if (lower.includes('भाड़ा') || lower.includes('किराया') || lower.includes('fare')) {
        aiReply = 'भुजौली से भैरहवा (5 किमी) का बाइक का किराया सिर्फ Rs. 75 और ऑटो का Rs. 100 है—पठाओ से हमेशा ₹5 कम!';
      } else if (lower.includes('about') || lower.includes('एप') || lower.includes('app')) {
        aiReply = 'Hello Nepal ऐप नेपाल का अपना लोकल राइड, डिलीवरी और मार्केटप्लेस है। (और हाँ: लड़के बाप नहीं बन पाएंगे क्योंकि वे दिनभर बाइक चलाते हैं! 🏍️😂)';
      } else if (lower.includes('बाप') || lower.includes('लड़के')) {
        aiReply = 'हाहा! "लड़के बाप नहीं बन पाएंगे क्योंकि वो बाइक चलाते हैं" — यह Hello Nepal ऐप की मजेदार कम्युनिटी लाइन है!';
      }

      setChatMessages([...newMsgs, { sender: 'ai', text: aiReply }]);
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-zinc-50 dark:bg-zinc-950 min-h-full pb-20 space-y-4 overflow-y-auto">
      
      {/* कवर और प्रोफाइल हेडर */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 rounded-b-3xl shadow-sm overflow-hidden">
        <div className="relative h-32 bg-zinc-200 dark:bg-zinc-800">
          <img src={profile.cover} alt="Cover" className="w-full h-full object-cover" />
        </div>

        <div className="px-5 pb-5 relative">
          <div className="flex justify-between items-end -mt-10 mb-3">
            <div className="relative w-20 h-20 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden bg-white shadow-md">
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            
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
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">प्रोफाइल अपडेट करें</h3>
          
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

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 font-bold">प्रोफाइल फोटो URL</label>
            <input 
              type="text" 
              value={tempProfile.avatar}
              onChange={(e) => setTempProfile({...tempProfile, avatar: e.target.value})}
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

      {/* 🤖 AI चैटबॉक्स और हेल्प सेंटर सेक्शन */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-3 mx-4">
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <Bot className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Hello Nepal AI सहायक</h3>
            <p className="text-[10px] text-zinc-400">राइड, किराया और ऐप की जानकारी तुरंत पाएं</p>
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
            placeholder="AI से पूछें (जैसे: किराया कितना है?)..." 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-xl outline-none focus:ring-2 focus:ring-red-500"
          />
          <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow">
            <Send className="w-3.5 h-3.5" /> भेजें
          </button>
        </form>
      </div>

      {/* 🔗 एफिलिएट और रेफरल प्रोग्राम सेक्शन */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-5 shadow-md space-y-3 mx-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" /> एफिलिएट & रेफरल प्रोग्राम
          </h3>
          <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full font-bold">कमर्शल</span>
        </div>
        
        <p className="text-xs text-amber-100 leading-relaxed">
          अपना एफिलिएट लिंक शेयर करें और हर राइड या सामान की बिक्री पर कमीशन कमाएं!
        </p>

        <div className="bg-black/20 p-3 rounded-2xl flex items-center justify-between text-xs">
          <span className="font-mono truncate mr-2">https://hello-nepal-ride.com/ref/RKD-{profile.name.replace(/\s+/g, '')}</span>
          <button 
            onClick={handleCopyAffiliateLink}
            className="px-3 py-1.5 bg-white text-orange-600 rounded-xl font-bold text-[11px] shadow shrink-0"
          >
            {copiedAffiliate ? 'कॉपी हो गया! ✅' : 'लिंक कॉपी करें'}
          </button>
        </div>

        <div className="flex justify-between pt-1 text-xs font-semibold text-amber-100">
          <span>कुल क्लिक्स: {affiliateClicks}</span>
          <span>कुल कमाई: Rs. {affiliateEarnings} NPR</span>
        </div>
      </div>

      {/* Quick Role Switcher */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3 mx-4">
        <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">सेवा विकल्प (Services & Roles)</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/40">
            <Navigation className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-xs font-bold">राइडर / डिलीवरी</p>
              <p className="text-[10px] text-zinc-400">सक्रिय पार्टनर</p>
            </div>
          </div>

          <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/40">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs font-bold">मार्केट विक्रेता</p>
              <p className="text-[10px] text-zinc-400">सामान पोस्ट करें</p>
            </div>
          </div>
        </div>
      </div>

      {/* 📱 सोशल फीड / पोस्ट्स (लाइक, कमेंट, शेयर के साथ) */}
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

    </div>
  );
};
