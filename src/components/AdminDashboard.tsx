import React, { useState } from 'react';

export default function AdminDashboard() {
  const [wallet, setWallet] = useState('esewa');
  const [payMethod, setPayMethod] = useState('mobile');
  const [receiverInfo, setReceiverInfo] = useState('');
  const [amount, setAmount] = useState('');
  const [mpin, setMpin] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!receiverInfo || !amount || !mpin) {
      setMsg('कृपया सभी जरूरी जानकारी भरें!');
      return;
    }

    setLoading(true);
    setMsg('पैसे ट्रांसफर हो रहे हैं...');

    setTimeout(() => {
      setMsg(`सफलतापूर्वक ${amount} NPR, ${wallet.toUpperCase()} (${payMethod.toUpperCase()}) के जरिए ट्रांसफर हो गए!`);
      setReceiverInfo('');
      setAmount('');
      setMpin('');
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '420px', margin: 'auto', background: '#fff', borderRadius: '8px', fontFamily: 'Arial', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <h3 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '15px' }}>Admin Advanced Payout System</h3>
      
      <form onSubmit={handlePayout}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Select Wallet:</label>
          <select value={wallet} onChange={(e) => setWallet(e.target.value)} style={{ width: '100%', padding: '10px', fontWeight: 'bold', borderRadius: '4px' }}>
            <option value="esewa">eSewa (ई-सेवा)</option>
            <option value="khalti">Khalti (खल्ती)</option>
            <option value="imepay">IME Pay (आईएमई पे)</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Payout Method:</label>
          <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} style={{ width: '100%', padding: '10px', fontWeight: 'bold', borderRadius: '4px' }}>
            <option value="mobile">Mobile Number / ID</option>
            <option value="qr">QR Scanner</option>
            <option value="card">Debit Card / Bank</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
            {payMethod === 'mobile' && 'Receiver Mobile / ID:'}
            {payMethod === 'qr' && 'Scan QR / Enter QR Data:'}
            {payMethod === 'card' && 'Debit Card Number / Account:'}
          </label>
          <input 
            type="text" 
            value={receiverInfo} 
            onChange={(e) => setReceiverInfo(e.target.value)} 
            placeholder={payMethod === 'mobile' ? 'जैसे: 98XXXXXXXX' : payMethod === 'qr' ? 'स्कैन कोड दर्ज करें' : 'कार्ड नंबर दर्ज करें'} 
            required 
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} 
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Amount (NPR):</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="रकम डालें (जैसे: 1000)" 
            required 
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} 
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Admin MPIN / Password:</label>
          <input 
            type="password" 
            value={mpin} 
            onChange={(e) => setMpin(e.target.value)} 
            placeholder="अपना गुप्त MPIN दर्ज करें" 
            required 
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', background: '#27ae60', color: '#fff', padding: '12px', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
        >
          {loading ? 'Processing...' : `Withdraw via ${wallet.toUpperCase()}`}
        </button>
      </form>

      {msg && <p style={{ textAlign: 'center', fontWeight: 'bold', color: msg.includes('सफलतापूर्वक') ? 'green' : 'blue', marginTop: '15px' }}>{msg}</p>}
    </div>
  );
}
