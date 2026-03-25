import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatMessage, PaymentFormData } from '../types/form';

function getClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  if (!apiKey) throw new Error('Missing VITE_GEMINI_API_KEY in .env file');
  return new GoogleGenerativeAI(apiKey);
}

const EXTRACT_PROMPT = `You are a banking assistant. Extract payment details from user input.
Return ONLY valid JSON with these exact keys (use empty string if not found):
{
  "firstName": "",
  "lastName": "",
  "accountNumber": "",
  "routingNumber": "",
  "amount": "",
  "currency": "USD",
  "memo": "",
  "paymentDate": ""
}
Rules:
- Split full names into firstName and lastName
- Convert written numbers to digits (e.g. "five hundred" -> "500")
- Default currency to "USD" if not mentioned
- Amount should be digits only, no currency symbols
- If a field is not mentioned, return empty string for it`;

export async function parseNaturalLanguage(
  input: string,
  history: ChatMessage[] = []
): Promise<Partial<PaymentFormData>> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  // Sanitize input
  const safeInput = input.replace(/<[^>]*>/g, '').slice(0, 500);

  // Build conversation context from history
  const context = history.length > 0
    ? history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n') + '\n'
    : '';

  const prompt = `${EXTRACT_PROMPT}\n\n${context}User: ${safeInput}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
}

export async function parseDocument(base64Image: string, mimeType: string): Promise<Partial<PaymentFormData>> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = `Extract payment/transfer details from this document.
Return ONLY valid JSON with these exact keys (empty string if not found):
{ "firstName": "", "lastName": "", "accountNumber": "", "routingNumber": "", "amount": "", "currency": "USD", "memo": "", "paymentDate": "" }
Rules: split full name into firstName/lastName, convert written numbers to digits, amount as digits only.`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType, data: base64Image } },
  ]);

  const text = result.response.text();
  return JSON.parse(text);
}

export async function askFieldHelp(question: string, fieldName: string): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const safeQuestion = question.replace(/<[^>]*>/g, '').slice(0, 300);

  const prompt = `You are a helpful banking assistant. Answer questions about banking form fields in 2–3 clear sentences. Be friendly and simple.
Field: "${fieldName}". Question: ${safeQuestion}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function getMissingFieldQuestion(
  filledFields: string[],
  allFields: string[]
): Promise<string | null> {
  const missing = allFields.filter(f => !filledFields.includes(f));
  if (missing.length === 0) return null;

  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are a friendly banking assistant collecting transfer details. Ask for ONE missing field at a time in a natural, conversational way. Be brief.
Already collected: ${filledFields.join(', ')}.
Still need: ${missing.join(', ')}.
Ask for the most important missing field next.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function validateForm(formData: PaymentFormData): Promise<{ valid: boolean; issues: string[] }> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = `You are a banking form validator. Check if the payment form data is valid and makes sense.
Return ONLY valid JSON: { "valid": true/false, "issues": ["issue1", "issue2"] }
Check: account number format (8-17 digits), routing number (exactly 9 digits), amount is positive number, required fields not empty.

Form data: ${JSON.stringify(formData)}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
}
