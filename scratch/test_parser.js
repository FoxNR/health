// Mocking the parser logic from geminiAI.ts
function parse(text) {
  console.log('Testing text:', JSON.stringify(text));
  let cleanedText = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
  const startIdx = cleanedText.indexOf('{');
  const endIdx = cleanedText.lastIndexOf('}');
  
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    return 'FAILED: No JSON found';
  }

  const jsonStr = cleanedText.substring(startIdx, endIdx + 1);
  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    return 'FAILED: JSON Parse error: ' + err.message + ' STR: ' + jsonStr;
  }
}

const tests = [
  "Ось ваша заміна: \n```json\n{\"originalName\": \"Піца\", \"swapName\": \"Цвітна капуста\"}\n```",
  "{\n  \"originalName\": \"Піца\",\n  \"swapName\": \"Цвітна капуста\"\n}",
  "Деякі пояснення... \n\n```\n{\n  \"originalName\": \"Піца\"\n}\n```\nБудь ласка.",
  "На жаль, я не можу знайти хорошу заміну."
];

tests.forEach((t, i) => {
  console.log(`Test ${i + 1}:`, parse(t));
});
