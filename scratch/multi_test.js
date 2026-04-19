
async function testModel(modelName, version = 'v1beta') {
  const API_KEY = 'AIzaSyBeMc_iGOeVmNqtqriaq83seKu8pqVTV5s';
  const url = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${API_KEY}`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }]
      })
    });
    console.log(`Model: ${modelName} (${version}), Status: ${res.status}`);
    if (res.status !== 200) {
      const data = await res.json();
      console.log('Error:', data.error?.message || data);
    }
  } catch (e) {
    console.log(`Model: ${modelName} failed:`, e.message);
  }
}

async function runTests() {
  await testModel('gemini-1.5-flash', 'v1');
  await testModel('gemini-1.5-flash', 'v1beta');
  await testModel('gemini-2.0-flash', 'v1beta');
  await testModel('gemini-2.5-flash', 'v1beta');
}

runTests();
