export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ reply: 'भाई, कृपया कुछ लिखकर पूछें।' });
  }

  const OPENROUTER_KEY = "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";
  const OPENAI_KEY = "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";

  let replyText = null;

  // 1️⃣ OpenRouter से कोशिश
  try {
    const resOr = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }]
      })
    });
    const dataOr = await resOr.json();
    if (dataOr.choices && dataOr.choices[0]?.message?.content) {
      replyText = dataOr.choices[0].message.content;
    }
  } catch (err) {
    console.log("OpenRouter server error");
  }

  // 2️⃣ OpenAI से कोशिश
  if (!replyText) {
    try {
      const resOpenAI = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }]
        })
      });
      const dataOpenAI = await resOpenAI.json();
      if (dataOpenAI.choices && dataOpenAI.choices[0]?.message?.content) {
        replyText = dataOpenAI.choices[0].message.content;
      }
    } catch (err) {
      console.log("OpenAI server error");
    }
  }

  if (replyText) {
    return res.status(200).json({ reply: replyText });
  } else {
    return res.status(500).json({ reply: 'माफ़ करना भाई, एआई सर्वर से अभी रिस्पॉन्स नहीं मिला।' });
  }
}
