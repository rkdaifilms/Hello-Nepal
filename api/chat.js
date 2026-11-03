export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const OPENAI_API_KEY = "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";

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant for Hello Nepal app, answering in Hindi or English.' },
          { role: 'user', content: message }
        ],
        max_tokens: 300
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      return res.status(500).json({ reply: 'AI से सही जवाब नहीं मिला।' });
    }
  } catch (error) {
    return res.status(500).json({ reply: 'सर्वर या नेटवर्क में दिक्कत आई।' });
  }
}
