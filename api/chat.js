export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  // 🔑 तेरी तीनों असली और पक्की API Keys यहाँ सेट कर दी गई हैं
  const GEMINI_API_KEY = "AQ.Ab8RN6IhziSgyS5G0EQRP7-Qya_FPtGZyJsj1p6ud5nFFJ9SZg";
  const OPENROUTER_API_KEY = "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";
  const OPENAI_API_KEY = "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";

  let replyText = null;

  // 1️⃣ सबसे पहले Gemini AI से कोशिश करते हैं
  if (GEMINI_API_KEY && !replyText) {
    try {
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }]
        })
      });
      const geminiData = await geminiRes.json();
      if (geminiData.candidates && geminiData.candidates[0].content && geminiData.candidates[0].content.parts[0].text) {
        replyText = geminiData.candidates[0].content.parts[0].text;
      }
    } catch (err) {
      console.log("Gemini failed, moving to OpenRouter...");
    }
  }

  // 2️⃣ अगर Gemini से जवाब न मिले, तो OpenRouter AI से कोशिश करते हैं
  if (OPENROUTER_API_KEY && !replyText) {
    try {
      const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://hello-nepal.app',
          'X-Title': 'Hello Nepal'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }]
        })
      });
      const orData = await orRes.json();
      if (orData.choices && orData.choices[0].message && orData.choices[0].message.content) {
        replyText = orData.choices[0].message.content;
      }
    } catch (err) {
      console.log("OpenRouter failed, moving to OpenAI...");
    }
  }

  // 3️⃣ आखिर में OpenAI से कोशिश करते हैं
  if (OPENAI_API_KEY && !replyText) {
    try {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }],
          max_tokens: 300
        })
      });
      const openaiData = await openaiRes.json();
      if (openaiData.choices && openaiData.choices[0].message && openaiData.choices[0].message.content) {
        replyText = openaiData.choices[0].message.content;
      }
    } catch (err) {
      console.log("OpenAI also failed.");
    }
  }

  if (replyText) {
    return res.status(200).json({ reply: replyText });
  } else {
    return res.status(500).json({ reply: 'माफ़ करना भाई, तीनों एआई सर्वर में से अभी रिस्पॉन्स नहीं मिला।' });
  }
}
