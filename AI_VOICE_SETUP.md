# AI Voice Control Setup Guide

This guide will help you set up the AI-powered voice control features for your RongCham restaurant system.

## Prerequisites

1. **Supabase Account**: Your database should already be configured
2. **Google AI Studio Account**: Required for Gemini AI integration
3. **Modern Browser**: Chrome, Firefox, or Safari with Web Speech API support

## Step 1: Get Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Create a new API key:
   - Click "Get API key"
   - Choose "Create API key in new project" or select existing project
   - Copy the generated API key

## Step 2: Environment Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Gemini API key to `.env.local`:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Step 3: Browser Permissions

When you first use voice control:

1. Your browser will ask for microphone permission
2. Click "Allow" to enable voice recognition
3. The voice control panel will show "🎤 Ready" when activated

## Step 4: Using AI Voice Control

### Activation
- Click "Start Listening" in the AI Voice Control panel
- Say "Hey restaurant" to activate voice commands
- The system will respond with "Voice control activated"

### Natural Language Commands

The AI understands natural speech patterns. You can say:

#### Order Management
- "Mark order 123 as done"
- "Please set order 456 to preparing"
- "Cancel order 789"
- "Complete order 234"

#### Order Queries
- "How many pending orders do we have?"
- "Show me the preparing orders"
- "What's our order status right now?"

#### Menu Analytics
- "What are our most popular dishes?"
- "Show me the best selling items"
- "Which menu items are available?"

#### Help
- "What can you do?"
- "Help me with commands"

### Voice Responses

The system will:
- ✅ Speak confirmations back to you
- 🎯 Show confidence levels for each command
- 📊 Display real-time data updates
- 🔄 Auto-refresh the dashboard

## Features

### 🤖 AI-Powered Understanding
- **Natural Language**: Speak normally, no rigid commands
- **Context Awareness**: AI understands your restaurant's current state
- **Smart Responses**: Contextual confirmations and information

### 🎤 Voice Recognition
- **Keyword Activation**: "Hey restaurant" to start
- **Continuous Listening**: Stays active for 30 seconds
- **Auto-Deactivation**: Saves battery and privacy

### 🔊 Speech Synthesis
- **Voice Confirmations**: Hear responses spoken back
- **Toggle Audio**: Mute/unmute voice responses
- **Pleasant Voice**: Uses optimal speech synthesis settings

### 📊 Real-time Integration
- **Live Updates**: Changes reflect immediately in dashboard
- **Database Sync**: All voice commands update the database
- **Multi-user**: Works alongside manual dashboard updates

## Troubleshooting

### "API key not found" Error
- Check that `NEXT_PUBLIC_GEMINI_API_KEY` is set in `.env.local`
- Restart your development server after adding the key
- Verify the API key is valid in Google AI Studio

### Voice Recognition Not Working
- Ensure you're using Chrome, Firefox, or Safari
- Check microphone permissions in browser settings
- Try speaking more clearly or closer to the microphone

### AI Not Understanding Commands
- Speak clearly and at normal pace
- Include context like order numbers or specific actions
- Check the confidence level - low confidence may need rephrasing

### No Voice Responses
- Click the 🔊 button to enable speech synthesis
- Check browser audio settings
- Some browsers require user interaction before playing audio

## API Usage and Costs

### Gemini API Pricing
- Free tier: 15 requests per minute
- Paid tier: Higher rate limits available
- Voice commands typically use 1-2 API calls each

### Rate Limiting
- The system includes fallback processing if API limits are reached
- Basic keyword matching works without AI as backup

## Security Notes

### API Key Protection
- Never commit `.env.local` to version control
- Use `NEXT_PUBLIC_` prefix for client-side access only
- Consider server-side API calls for production

### Voice Data
- Voice processing happens in browser (not sent to our servers)
- Only transcribed text is sent to Gemini AI
- No audio recordings are stored

## Production Deployment

### Environment Variables
Set these in your production environment:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_production_api_key
```

### HTTPS Required
- Voice recognition requires HTTPS in production
- Ensure your hosting platform supports SSL

### Browser Compatibility
- Test voice features across target browsers
- Provide fallback UI for unsupported browsers

---

## Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify environment variables are set correctly
3. Test with simple commands first ("help")
4. Ensure microphone permissions are granted

The AI voice control system enhances your restaurant management with hands-free operation, perfect for busy kitchen environments!