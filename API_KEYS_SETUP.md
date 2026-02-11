# Derek's Personal Model Counsel - API Keys Setup

## Current Status:
✅ **OpenAI:** Already configured (from your .env file)
🟡 **Anthropic:** Using OAuth (need direct API key for Model Counsel)
🔴 **Google/Gemini:** Need API key
🔴 **Groq:** Need API key

## Quick Setup (5 minutes):

### 1. Anthropic API Key
- Go to: https://console.anthropic.com/
- API Keys → Create Key
- Copy the `sk-ant-api03-...` key
- Add to `.env.local`

### 2. Google AI API Key  
- Go to: https://makersuite.google.com/app/apikey
- Create API Key
- Copy the key
- Add to `.env.local`

### 3. Groq API Key
- Go to: https://console.groq.com/keys
- Create API Key  
- Copy the `gsk_...` key
- Add to `.env.local`

## Your Model Counsel Features:

**Once keys are added:**
- ✅ **Claude Opus 4.6** - Deep reasoning and analysis
- ✅ **Claude Sonnet 4.5** - Balanced speed and capability  
- ✅ **GPT-4 Turbo** - Strong at code and structured reasoning
- ✅ **Gemini 2.5 Pro** - Advanced reasoning with huge context
- ✅ **Gemini 2.5 Flash** - Fast responses with good quality
- ✅ **Llama 3.3 70B** - Open source via Groq (very fast)

## How It Works:
1. Select model for different reasoning approaches
2. Ask question once
3. Test different models to compare outputs
4. No need to enter API keys each time - pre-configured for you
5. Response times and model comparison

**Perfect for testing which model gives better reasoning for specific tasks.**

## File to Update:
Edit: `C:\Users\derek\OneDrive\Desktop\MILO\projects\dbtech45\.env.local`

Replace the placeholder keys with your real ones.

**URL:** https://dbtech45.com/model-counsel (once deployed)