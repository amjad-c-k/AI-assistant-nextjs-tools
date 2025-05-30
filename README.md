# 🤖 AI Assistant with Custom Tools

A modern AI assistant built with **Next.js** that uses **Groq AI function calling** and **completely free APIs** to provide intelligent tool integration without requiring expensive subscriptions like OpenAI.

## 🎯 Project Overview

This project demonstrates how to build a production-ready AI assistant that:
- Uses **Next.js** for modern web development
- Implements **real AI function calling** with Groq AI
- Integrates **6 different custom tools** with real-world APIs
- Works with **100% free APIs** (no expensive AI subscriptions needed)
- Features a **professional, responsive UI** built with **Tailwind CSS**

## ✨ Features

### 🛠️ Available Tools

| Tool | Description | API Used | Free Limit |
|------|-------------|----------|------------|
| 🤖 **AI Brain** | Function calling and decision making | Groq.com | 14,400 calls/day |
| 🌤️ **Weather** | Current weather for any city worldwide | WeatherAPI.com | 1M calls/month |
| 📋 **Task Manager** | Add, view, and manage tasks | In-memory storage | Unlimited |
| 📈 **Stock Prices** | Real-time stock market data | Finnhub.io | 60 calls/minute |
| 💱 **Currency Converter** | Live exchange rates | ExchangeRate-API | 1500 calls/month |
| 🔧 **Multi-Tool** | Use multiple tools in one request | Combined APIs | Based on individual limits |

### 🧠 Smart Features

- **Real AI Function Calling**: Groq AI automatically selects appropriate tools based on user input
- **Natural Language Processing**: Understands conversational requests
- **Multi-Tool Operations**: Can use multiple tools simultaneously in one request
- **Error Handling**: Graceful degradation when APIs are unavailable
- **Responsive Design**: Works perfectly on desktop and mobile
- **Real-time Data**: Live weather, stock prices, and currency rates

## 🚀 Quick Start Guide (Windows)

### Prerequisites

1. **Install Node.js**: Download from [nodejs.org](https://nodejs.org) (LTS version)
2. **Install Git** (optional): Download from [git-scm.com](https://git-scm.com)

### Installation Steps

1. **Open Command Prompt or PowerShell**

2. **Create and setup project:**
```cmd
# Create project directory
mkdir ai-assistant-nextjs
cd ai-assistant-nextjs

# Initialize project
npm init -y
```

3. **Install dependencies:**
```cmd
# Install main packages
npm install next@latest react@latest react-dom@latest axios

# Install Tailwind CSS
npm install -D tailwindcss@^3.4.0 postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p
```

4. **Create all project files** (copy content from the repository):
   - `package.json`
   - `next.config.js`
   - `tailwind.config.js`
   - `postcss.config.js`
   - `styles/globals.css`
   - `pages/_app.js`
   - `pages/index.js`
   - `pages/api/chat.js`
   - `.env.local.example`
   - `.gitignore`
   - `README.md`

5. **Setup environment variables:**
```cmd
copy .env.local.example .env.local
```

6. **Edit `.env.local`** with your API keys:
```
GROQ_API_KEY=your_groq_key_here
WEATHER_API_KEY=your_weather_key_here
FINNHUB_API_KEY=your_finnhub_key_here
```

7. **Run the development server:**
```cmd
npm run dev
```

8. **Open your browser** and go to: `http://localhost:3000`

## 🔑 Getting Free API Keys

### Groq AI API (Required)
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Create an API key
4. **Free tier**: 14,400 requests per day

### Weather API (Recommended)
1. Go to [weatherapi.com/signup.aspx](https://www.weatherapi.com/signup.aspx)
2. Sign up for a free account
3. Get your API key from the dashboard
4. **Free tier**: 1 million calls per month

### Stock API (Recommended)
1. Go to [finnhub.io/register](https://finnhub.io/register)
2. Create a free account
3. Copy your API key
4. **Free tier**: 60 calls per minute

**Note**: Currency conversion works without any API key! The app has demo data fallbacks for all tools.

## 🎮 How to Use

### Example Queries

Try these commands with the assistant:

**Weather:**
- "What's the weather in London?"
- "Temperature in New York"
- "Weather in Tokyo"

**Task Management:**
- "Add task: Buy groceries with high priority"
- "Show my tasks"
- "Complete task 1"

**Stock Prices:**
- "What's Apple's stock price?"
- "Tesla stock price"
- "Microsoft stock"

**Currency Conversion:**
- "Convert 100 USD to EUR"
- "Convert 50 EUR to GBP"

**Multi-Tool Examples:**
- "Weather in Paris and add task to visit Eiffel Tower"
- "Apple stock price and convert 1000 USD to EUR"
- "Weather in Tokyo and add task to pack umbrella"

## 📁 Project Structure

```
ai-assistant-nextjs/
├── pages/
│   ├── api/
│   │   └── chat.js          # Main API with Groq AI function calling
│   ├── index.js             # Main chat interface (React)
│   └── _app.js              # Next.js app wrapper
├── styles/
│   └── globals.css          # Global styles with Tailwind CSS
├── public/                  # Static files
├── package.json             # Dependencies and scripts
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── .env.local.example       # Environment variables template
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## 🛠️ How It Works

### Real AI Function Calling

The AI assistant uses **Groq AI** to intelligently select and execute tools:

```javascript
// User: "What's the weather in London and Apple's stock price?"
// Groq AI analyzes the request and decides to call:
const toolCalls = [
    { function: "get_weather", args: { city: "London" } },
    { function: "get_stock_price", args: { symbol: "AAPL" } }
];
```

### Function Execution Flow

1. **User Input** → Natural language message
2. **AI Analysis** → Groq AI determines which tools to use
3. **Tool Execution** → APIs called with extracted parameters  
4. **Response Generation** → Formatted, natural language response
5. **UI Display** → Professional chat interface with tool transparency

### API Integration Architecture

```javascript
// Each tool is implemented as a function:
async function getWeather(city) {
    const response = await axios.get(`weatherapi.com/v1/current.json?q=${city}`);
    return { 
        success: true, 
        temperature: response.data.current.temp_c,
        description: response.data.current.condition.text
    };
}
```
## 🎯 Live Demo

**🔗 Live Application**: https://ai-assistant-nextjs-tools.vercel.app/
**🔗 Source Code**: https://github.com/amjad-c-k/AI-assistant-nextjs-tools

---
