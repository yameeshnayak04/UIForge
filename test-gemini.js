const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('GEMINI_API_KEY is not set. Add it to your environment before running this script.');
  process.exit(1);
}

async function listModels() {
  console.log('Fetching available models...\n');
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok && data.models) {
      console.log('✅ Models available for generateContent:\n');
      
      const geminiModels = data.models.filter(model => {
        const name = model.name.toLowerCase();
        const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent');
        return name.includes('gemini') && supportsGenerate;
      });

      if (geminiModels.length === 0) {
        console.log('❌ No Gemini models found that support generateContent');
        console.log('\nAll available models:');
        data.models.forEach(m => {
          console.log(`  • ${m.name.split('/')[1]}`);
          console.log(`    Methods: ${m.supportedGenerationMethods?.join(', ')}`);
        });
      } else {
        geminiModels.forEach(model => {
          const modelName = model.name.split('/')[1];
          console.log(`  ✓ ${modelName}`);
        });
        
        console.log('\n=== USE THIS MODEL NAME IN YOUR .env ===');
        console.log(`GEMINI_MODEL=${geminiModels[0].name.split('/')[1]}`);
      }
    } else {
      console.error('❌ Error:', data);
    }
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
  }
}

listModels();
