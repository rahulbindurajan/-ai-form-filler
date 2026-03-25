import OpenAI from 'openai';
import type { ChatMessage, PaymentFormData } from '../types/form';

function getClient() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string;
  if (!apiKey) throw new Error('Missing VITE_OPENAI_API_KEY in .env file');
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

const EXTRACT_SYSTEM = `You are a banking assistant. Extract payment details from user input.
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
  const client = getClient();

  // Sanitize input to prevent prompt injection
  const safeInput = input.replace(/<[^>]*>/g, '').slice(0, 500);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: EXTRACT_SYSTEM },
    ...history.map(m => ({ role: m.role, content: m.content } as OpenAI.Chat.ChatCompletionMessageParam)),
    { role: 'user', content: safeInput },
  ];

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content ?? '{}');
}

export async function parseDocument(base64Image: string, mimeType: string): Promise<Partial<PaymentFormData>> {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Extract payment/transfer details from this document.
Return ONLY valid JSON with these exact keys (empty string if not found):
{ "firstName": "", "lastName": "", "accountNumber": "", "routingNumber": "", "amount": "", "currency": "USD", "memo": "", "paymentDate": "" }
Rules: split full name into firstName/lastName, convert written numbers to digits, amount as digits only.`
        },
        {
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${base64Image}` }
        }
      ]
    }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content ?? '{}');
}

export async function askFieldHelp(question: string, fieldName: string): Promise<string> {
  const client = getClient();
  const safeQuestion = question.replace(/<[^>]*>/g, '').slice(0, 300);

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful banking assistant. Answer questions about banking form fields in 2–3 clear sentences. Be friendly and simple.'
      },
      {
        role: 'user',
        content: `Field: "${fieldName}". Question: ${safeQuestion}`
      }
    ],
  });

  return response.choices[0].message.content ?? 'Sorry, I could not answer that.';
}

export async function getMissingFieldQuestion(
  filledFields: string[],
  allFields: string[]
): Promise<string | null> {
  const missing = allFields.filter(f => !filledFields.includes(f));
  if (missing.length === 0) return null;

  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a friendly banking assistant collecting transfer details. Ask for ONE missing field at a time in a natural, conversational way. Be brief.'
      },
      {
        role: 'user',
        content: `Already collected: ${filledFields.join(', ')}. Still need: ${missing.join(', ')}. Ask for the most important missing field next.`
      }
    ],
  });

  return response.choices[0].message.content ?? null;
}

export async function validateForm(formData: PaymentFormData): Promise<{ valid: boolean; issues: string[] }> {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a banking form validator. Check if the payment form data is valid and makes sense.
Return ONLY valid JSON: { "valid": true/false, "issues": ["issue1", "issue2"] }
Check: account number format (8-17 digits), routing number (exactly 9 digits), amount is positive number, required fields not empty.`
      },
      {
        role: 'user',
        content: JSON.stringify(formData)
      }
    ],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content ?? '{"valid":false,"issues":["Validation failed"]}');
}
