// Let's try different model names directly
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyC2Fmnm5qzvjSZIdtQlaZ7Ao1uREUbCyOE';
const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTry = [
  'gemini-1.5-flash-002',
  'gemini-1.5-pro-002',
  'gemini-1.5-flash-8b',
  'gemini-exp-1206',
  'gemini-2.0-flash-exp',
];

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say hello');
    console.log(`✓ ${modelName} - WORKS`);
    return true;
  } catch (error) {
    console.log(`✗ ${modelName} - ${error.message.substring(0, 80)}`);
    return false;
  }
}

async function findWorkingModel() {
  console.log('\n=== TESTING MODELS ===\n');
  
  for (const modelName of modelsToTry) {
    await testModel(modelName);
  }
}

findWorkingModel();
