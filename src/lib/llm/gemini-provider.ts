import { LLMProvider } from './provider';

export class GeminiProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async chat(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `CRITICAL INSTRUCTION: You MUST respond with ONLY a valid JSON object. 
Do NOT include:
- Markdown code blocks (\`\`\`json or \`\`\`)
- Any text before the JSON
- Any text after the JSON
- Any explanations

IMPORTANT: Keep your response CONCISE. Use minimal data.
For tables: Include only 3-4 sample rows, not 10+
For arrays: Keep them short and simple
For text: Be brief

Start your response with { and end with }

${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 8192, // ✅ Increased from 4096
        candidateCount: 1,
      }
    };

    try {
      console.log(`\n🔷 Calling Gemini API: ${this.model}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        console.error('❌ No text in Gemini response:', JSON.stringify(data, null, 2));
        throw new Error('No text response from Gemini API');
      }

      console.log(`📦 Raw response length: ${text.length} chars`);
      
      const cleaned = this.cleanAndFixJSON(text);
      
      console.log(`✨ Cleaned response length: ${cleaned.length} chars`);

      // Validate JSON
      try {
        JSON.parse(cleaned);
        console.log('✅ Valid JSON confirmed');
      } catch (parseError) {
        console.error('❌ INVALID JSON AFTER CLEANING');
        console.error('Error:', parseError instanceof Error ? parseError.message : 'Unknown');
        
        // Try to fix common issues
        const fixed = this.attemptJSONFix(cleaned);
        try {
          JSON.parse(fixed);
          console.log('✅ JSON fixed successfully!');
          return fixed;
        } catch {
          console.error('Full text:', cleaned);
          throw new Error('Gemini returned invalid JSON that cannot be fixed');
        }
      }

      return cleaned;
    } catch (error) {
      console.error('❌ Gemini provider error:', error);
      throw new Error(`Gemini provider failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private cleanAndFixJSON(text: string): string {
    let cleaned = text.trim();

    // Remove markdown code blocks
    cleaned = cleaned.replace(/^```json\s*/gm, '');
    cleaned = cleaned.replace(/^```\s*/gm, '');
    cleaned = cleaned.replace(/```\s*$/gm, '');
    
    // Remove text before first {
    const firstBrace = cleaned.indexOf('{');
    if (firstBrace > 0) {
      cleaned = cleaned.substring(firstBrace);
    }

    // Remove text after last }
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace !== -1 && lastBrace < cleaned.length - 1) {
      cleaned = cleaned.substring(0, lastBrace + 1);
    }

    return cleaned.trim();
  }

  private attemptJSONFix(json: string): string {
    let fixed = json;

    // Count braces
    const openBraces = (fixed.match(/\{/g) || []).length;
    const closeBraces = (fixed.match(/\}/g) || []).length;
    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/\]/g) || []).length;

    console.log(`🔧 Attempting to fix JSON - Braces: ${openBraces} open, ${closeBraces} close`);
    console.log(`🔧 Brackets: ${openBrackets} open, ${closeBrackets} close`);

    // Remove trailing comma if last char before } or ]
    fixed = fixed.replace(/,(\s*[\]}])/g, '$1');

    // If response was truncated, try to close it properly
    if (openBrackets > closeBrackets) {
      const missing = openBrackets - closeBrackets;
      console.log(`🔧 Adding ${missing} missing ]`);
      fixed = fixed + ']'.repeat(missing);
    }

    if (openBraces > closeBraces) {
      const missing = openBraces - closeBraces;
      console.log(`🔧 Adding ${missing} missing }`);
      fixed = fixed + '}'.repeat(missing);
    }

    return fixed;
  }
}
