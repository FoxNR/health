
async function testGemini() {
  const API_KEY = 'AIzaSyBeMc_iGOeVmNqtqriaq83seKu8pqVTV5s';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  
  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: 'Say hello' }]
      }
    ]
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testGemini();
