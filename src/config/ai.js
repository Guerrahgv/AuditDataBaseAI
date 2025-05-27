import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'http://localhost:1234/v1',
  apiKey: 'lm-studio',
});

export async function sendPrompt(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'llama-3-sqlcoder-8b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error:', error);
  }
}
