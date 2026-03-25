# AI Banking Form Filler

An AI-powered web app that fills banking payment forms automatically — from a plain English sentence or an uploaded invoice image.

Built with **React + TypeScript + Vite** and powered by **OpenAI GPT-4o**.

---

## What This App Does

Instead of manually typing into every form field, users can:

1. **Type a sentence** — `"Pay $500 to John Doe, account 9876543210, routing 021000021"` → AI fills all fields instantly
2. **Upload an invoice or image** → AI reads it and extracts payment details into the form
3. **Use the chat assistant** → Floating chat bubble guides users conversationally to fill the form
4. **Ask inline help** → Click the `?` icon on any field to ask the AI what it means
5. **Validate with AI** → AI checks if all fields are consistent and correct before submission
6. **Export as PDF** → Download the filled form as a PDF

---

## Features

| Feature | Description |
|---------|-------------|
| Natural Language Fill | Type what you want, AI fills the entire form |
| Document Upload | Upload invoice/image, AI extracts all details |
| Floating Chat Bar | Conversational turn-by-turn form filling |
| Inline AI Help | Ask questions about any field while filling |
| AI Validation | Checks field values for errors before submit |
| AI-Fill Highlights | Blue highlighted fields = auto-filled by AI |
| PDF Export | Download completed form as PDF |
| Auto-save | Form state saved in browser localStorage |

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 + TypeScript | Frontend framework |
| Vite | Dev server and build tool |
| Material UI (MUI) | UI components |
| OpenAI SDK (`openai`) | AI integration |
| React Dropzone | File/image upload |
| html2pdf.js | Export form to PDF |

---

## API Integrated

### OpenAI API

This app uses the **OpenAI Chat Completions API** with two models:

| Model | Used For |
|-------|---------|
| `gpt-4o-mini` | Natural language parsing, inline help, validation, chat assistant |
| `gpt-4o` | Document/image reading (vision) |

**Endpoints used:**
- `POST https://api.openai.com/v1/chat/completions`

---

## API Keys Required

| Key | Where to get it | Where it goes |
|-----|----------------|---------------|
| `VITE_OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | `.env` file |

### Setup

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your key:
   ```
   VITE_OPENAI_API_KEY=sk-your-real-key-here
   ```

> **Important:** Never commit the `.env` file. It is already listed in `.gitignore`.

---

## Getting Started

### Prerequisites

- Node.js 18+
- An OpenAI API key (ask your team lead)

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
```

---

## Project Structure

```
src/
├── components/
│   ├── FormPanel.tsx        # Banking form UI with AI-fill highlights
│   ├── NLPInput.tsx         # Type-a-sentence natural language input
│   ├── DocumentUpload.tsx   # Drag & drop invoice/image upload
│   ├── FloatingChatBar.tsx  # Floating conversational AI chat
│   └── ExportButton.tsx     # PDF export
├── context/
│   └── FormContext.tsx      # Global form state (React Context)
├── services/
│   └── openai.ts            # All OpenAI API calls
├── types/
│   └── form.ts              # TypeScript types and field definitions
└── App.tsx                  # Main layout
```

---

## How It Works

```
User types a sentence
        ↓
NLPInput → openai.ts (GPT-4o-mini) → JSON fields
        ↓
FormContext.fillForm() → updates all fields at once
        ↓
FormPanel highlights AI-filled fields in blue
        ↓
User reviews → clicks Submit (AI never submits)
```

```
User uploads image/invoice
        ↓
DocumentUpload → FileReader (base64) → openai.ts (GPT-4o vision)
        ↓
Same flow as above ↑
```

---

## Security Notes

- API key is used **client-side** (browser) — suitable for internal/demo use
- For production, move the API key to a **backend proxy** to prevent exposure
- `.env` is in `.gitignore` — the real key is never committed
- All user input is sanitized before sending to OpenAI to prevent prompt injection

---

## Future Enhancements

- Voice input (speak instead of type)
- Support more form types (account opening, loans, forex)
- Bulk processing via Excel upload
- Backend proxy for production API key security
- SSO / login integration
- Audit logs for compliance

---

## License

MIT
