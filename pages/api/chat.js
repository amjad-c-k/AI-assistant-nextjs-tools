// pages/api/chat.js - Simple working version with Groq API
import axios from 'axios';

// Simple in-memory storage for tasks
let tasks = [];
let taskIdCounter = 1;

// Tool Functions
async function getWeather(city) {
    try {
        const API_KEY = process.env.WEATHER_API_KEY;
        
        // Add these debug lines
        console.log('🌤️ Weather API Key exists:', !!API_KEY);
        console.log('🌤️ Weather API Key starts with:', API_KEY?.substring(0, 10));
        console.log('🌤️ Is placeholder?', API_KEY === 'your_weather_api_key_here');
        
        if (!API_KEY || API_KEY === 'your_weather_api_key_here') {
            console.log('🌤️ Using demo weather data for:', city);
            // Return demo data
            return {
                success: true,
                city: city,
                temperature: Math.floor(Math.random() * 30) + 10,
                description: ["Sunny", "Cloudy", "Partly cloudy", "Light rain"][Math.floor(Math.random() * 4)],
                humidity: Math.floor(Math.random() * 40) + 40,
                wind: Math.floor(Math.random() * 20) + 5
            };
        }

        console.log('🌤️ Making real API call for:', city);
        const response = await axios.get(
            `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`
        );
        
        console.log('🌤️ Real weather data received:', response.data.location.name);
        
        return {
            success: true,
            city: response.data.location.name,
            country: response.data.location.country,
            temperature: Math.round(response.data.current.temp_c),
            description: response.data.current.condition.text,
            humidity: response.data.current.humidity,
            wind: response.data.current.wind_kph
        };
    } catch (error) {
        console.log('🌤️ Weather API Error:', error.message);
        return { success: false, error: `Weather unavailable for ${city}` };
    }
}

function addTask(title, priority = 'medium') {
    const task = {
        id: taskIdCounter++,
        title: title,
        priority: priority,
        completed: false,
        createdAt: new Date().toISOString()
    };
    tasks.push(task);
    
    return {
        success: true,
        task: task,
        message: `Task "${title}" added with ${priority} priority`
    };
}

function getTasks(filter = 'all') {
    let filteredTasks = tasks;
    
    if (filter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (filter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    }
    
    return {
        success: true,
        tasks: filteredTasks,
        count: filteredTasks.length
    };
}

function completeTask(taskId) {
    const task = tasks.find(t => t.id === parseInt(taskId));
    if (!task) {
        return { success: false, error: `Task ${taskId} not found` };
    }
    task.completed = true;
    task.completedAt = new Date().toISOString();
    return { success: true, task: task, message: `Task "${task.title}" completed` };
}

async function getStockPrice(symbol) {
    try {
        const API_KEY = process.env.FINNHUB_API_KEY;
        if (!API_KEY || API_KEY === 'your_finnhub_api_key_here') {
            // Demo stock data
            const demoStocks = {
                'AAPL': { price: '175.43', change: '2.31', changePercent: '1.34' },
                'GOOGL': { price: '125.67', change: '-1.24', changePercent: '-0.98' },
                'MSFT': { price: '378.85', change: '5.12', changePercent: '1.37' },
                'TSLA': { price: '245.67', change: '8.23', changePercent: '3.46' },
                'AMZN': { price: '142.33', change: '1.87', changePercent: '1.33' }
            };
            
            const demo = demoStocks[symbol.toUpperCase()] || { 
                price: (Math.random() * 200 + 50).toFixed(2), 
                change: (Math.random() * 10 - 5).toFixed(2), 
                changePercent: (Math.random() * 4 - 2).toFixed(2) 
            };
            
            return {
                success: true,
                symbol: symbol.toUpperCase(),
                price: demo.price,
                change: demo.change,
                changePercent: demo.changePercent
            };
        }

        const response = await axios.get(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
        );
        
        if (!response.data.c) {
            throw new Error('No data available');
        }
        
        return {
            success: true,
            symbol: symbol.toUpperCase(),
            price: parseFloat(response.data.c).toFixed(2),
            change: parseFloat(response.data.d || 0).toFixed(2),
            changePercent: parseFloat(response.data.dp || 0).toFixed(2)
        };
    } catch (error) {
        return { success: false, error: `Stock data unavailable for ${symbol}` };
    }
}

async function convertCurrency(amount, from, to) {
    try {
        const response = await axios.get(
            `https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`
        );
        
        const rate = response.data.rates[to.toUpperCase()];
        if (!rate) {
            throw new Error(`Currency ${to.toUpperCase()} not found`);
        }
        
        const convertedAmount = (amount * rate).toFixed(2);
        
        return {
            success: true,
            originalAmount: amount,
            fromCurrency: from.toUpperCase(),
            toCurrency: to.toUpperCase(),
            convertedAmount: parseFloat(convertedAmount),
            exchangeRate: rate
        };
    } catch (error) {
        return { success: false, error: `Could not convert ${from} to ${to}` };
    }
}

// Available tools for the AI
const availableTools = [
    {
        type: "function",
        function: {
            name: "get_weather",
            description: "Get current weather information for a city",
            parameters: {
                type: "object",
                properties: {
                    city: {
                        type: "string",
                        description: "The city name to get weather for"
                    }
                },
                required: ["city"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "add_task",
            description: "Add a new task to the task list",
            parameters: {
                type: "object",
                properties: {
                    title: {
                        type: "string",
                        description: "The task title/description"
                    },
                    priority: {
                        type: "string",
                        enum: ["low", "medium", "high"],
                        description: "Task priority level"
                    }
                },
                required: ["title"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_tasks",
            description: "Get list of tasks with optional filtering",
            parameters: {
                type: "object",
                properties: {
                    filter: {
                        type: "string",
                        enum: ["all", "completed", "pending"],
                        description: "Filter tasks by status"
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "complete_task",
            description: "Mark a task as completed by its ID",
            parameters: {
                type: "object",
                properties: {
                    taskId: {
                        type: "string",
                        description: "The ID of the task to complete"
                    }
                },
                required: ["taskId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_stock_price",
            description: "Get current stock price for a stock symbol",
            parameters: {
                type: "object",
                properties: {
                    symbol: {
                        type: "string",
                        description: "Stock symbol like AAPL, GOOGL, MSFT, TSLA"
                    }
                },
                required: ["symbol"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "convert_currency",
            description: "Convert money from one currency to another",
            parameters: {
                type: "object",
                properties: {
                    amount: {
                        type: "number",
                        description: "Amount to convert"
                    },
                    from: {
                        type: "string",
                        description: "Source currency code like USD, EUR, GBP"
                    },
                    to: {
                        type: "string",
                        description: "Target currency code like USD, EUR, GBP"
                    }
                },
                required: ["amount", "from", "to"]
            }
        }
    },
     {
        type: "function",
        function: {
            name: "get_random_quote",
            description: "Get a random inspirational quote to motivate and inspire the user",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    }
];

// Function to execute tools
async function executeTool(toolName, args) {
    switch (toolName) {
        case 'get_weather':
            return await getWeather(args.city);
        case 'add_task':
            return addTask(args.title, args.priority);
        case 'get_tasks':
            return getTasks(args.filter);
        case 'complete_task':
            return completeTask(args.taskId);
        case 'get_stock_price':
            return await getStockPrice(args.symbol);
        case 'convert_currency':
            return await convertCurrency(args.amount, args.from, args.to);
        case 'get_random_quote': 
            return await getRandomQuote();  
        default:
            return { success: false, error: `Unknown tool: ${toolName}` };
    }
}

// Call Groq AI with function calling
async function callGroqAI(userMessage) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    // Log for debugging
    console.log('🔑 API Key exists:', !!GROQ_API_KEY);
    
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
        console.log('⚠️ No valid Groq API key found, using basic responses');
        return {
            response: "I'm ready to help! I can assist with weather, tasks, stocks, and currency conversion. What would you like to do?",
            toolsUsed: []
        };
    }

    try {
        console.log('🤖 Calling Groq API for:', userMessage);

        // Call Groq API with tools
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant with access to tools for weather, task management, stock prices, and currency conversion. When a user asks for something that requires a tool, call the appropriate function. You can call multiple functions if needed."
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            tools: availableTools,
            tool_choice: "auto"
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            }
        });

        const aiMessage = response.data.choices[0].message;
        let toolResults = [];

        // Execute any tool calls the AI requested
        if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
            console.log('🛠️ AI wants to use tools:', aiMessage.tool_calls.map(tc => tc.function.name));

            for (const toolCall of aiMessage.tool_calls) {
                const toolName = toolCall.function.name;
                const toolArgs = JSON.parse(toolCall.function.arguments);
                
                console.log(`🔧 Executing ${toolName} with:`, toolArgs);
                
                const result = await executeTool(toolName, toolArgs);
                toolResults.push({
                    tool: toolName,
                    args: toolArgs,
                    result: result
                });
            }

            // FIXED: Generate a proper response based on the tool results
            const formattedResponse = generateFormattedResponse(userMessage, toolResults);
            
            return {
                response: formattedResponse,
                toolsUsed: toolResults
            };
        } else {
            // No tools needed, just return AI response
            return {
                response: aiMessage.content || "I'm here to help! What would you like to know?",
                toolsUsed: []
            };
        }

    } catch (error) {
        console.error('🚨 Groq API Error:', error.response?.data || error.message);
        
        // Fallback response
        return {
            response: "I'm having trouble connecting to my AI service right now, but I can still help you with basic tasks. Try asking about weather, tasks, stocks, or currency conversion!",
            toolsUsed: []
        };
    }
}
async function getRandomQuote() {
    try {
        const response = await axios.get('https://api.quotable.io/random');
        return {
            success: true,
            quote: response.data.content,
            author: response.data.author,
            category: response.data.tags?.join(', ') || 'General'
        };
    } catch (error) {
        // Fallback quotes if API fails
        const fallbackQuotes = [
            { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { quote: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
            { quote: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
            { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
            { quote: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" }
        ];
        
        const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        return {
            success: true,
            quote: randomQuote.quote,
            author: randomQuote.author,
            category: 'Inspirational'
        };
    }
}
// NEW: Better response formatting function
function generateFormattedResponse(userMessage, toolResults) {
    if (toolResults.length === 0) {
        return "I'm here to help! What would you like to know?";
    }
    
    let response = "";
    
    toolResults.forEach((result, index) => {
        if (result.tool === 'get_weather' && result.result.success) {
            const weather = result.result;
            response += `🌤️ **Weather in ${weather.city}${weather.country ? ', ' + weather.country : ''}:**\n\n`;
            response += `🌡️ **Temperature:** ${weather.temperature}°C\n`;
            response += `☁️ **Condition:** ${weather.description}\n`;
            response += `💧 **Humidity:** ${weather.humidity}%\n`;
            response += `💨 **Wind:** ${weather.wind} km/h\n\n`;
        }
        
        else if (result.tool === 'add_task' && result.result.success) {
            response += `✅ **Task Added Successfully!**\n\n`;
            response += `📝 **Title:** ${result.result.task.title}\n`;
            response += `⭐ **Priority:** ${result.result.task.priority}\n`;
            response += `📅 **Created:** ${new Date(result.result.task.createdAt).toLocaleString()}\n\n`;
        }
        else if (result.tool === 'get_random_quote' && result.result.success) {
            const quote = result.result;
            response += `💭 **Inspirational Quote:**\n\n`;
            response += `"${quote.quote}"\n\n`;
            response += `— **${quote.author}**\n`;
            if (quote.category) response += `📂 Category: ${quote.category}\n`;
            response += '\n';
        }
        
        else if (result.tool === 'get_tasks' && result.result.success) {
            const tasks = result.result;
            response += `📋 **Your Tasks (${tasks.count} total):**\n\n`;
            if (tasks.tasks.length === 0) {
                response += "No tasks found. Add some tasks to get started!\n\n";
            } else {
                tasks.tasks.forEach((task, idx) => {
                    const status = task.completed ? '✅' : '⏳';
                    response += `${idx + 1}. ${status} **${task.title}** (${task.priority} priority)\n`;
                });
                response += '\n';
            }
        }
        
        else if (result.tool === 'complete_task' && result.result.success) {
            response += `✅ **Task Completed!**\n\n`;
            response += `📝 **Task:** ${result.result.task.title}\n`;
            response += `🎉 **Completed:** ${new Date(result.result.task.completedAt).toLocaleString()}\n\n`;
        }
        
        else if (result.tool === 'get_stock_price' && result.result.success) {
            const stock = result.result;
            const changeIcon = parseFloat(stock.change) >= 0 ? '📈' : '📉';
            const changeColor = parseFloat(stock.change) >= 0 ? '+' : '';
            response += `${changeIcon} **${stock.symbol} Stock Price:**\n\n`;
            response += `💰 **Current Price:** $${stock.price}\n`;
            response += `📊 **Change:** ${changeColor}${stock.change} (${stock.changePercent}%)\n`;
            if (stock.note) response += `ℹ️ **Note:** ${stock.note}\n`;
            response += '\n';
        }
        
        else if (result.tool === 'convert_currency' && result.result.success) {
            const conv = result.result;
            response += `💱 **Currency Conversion:**\n\n`;
            response += `💸 **${conv.originalAmount} ${conv.fromCurrency}** = **${conv.convertedAmount} ${conv.toCurrency}**\n`;
            response += `📊 **Exchange Rate:** 1 ${conv.fromCurrency} = ${conv.exchangeRate} ${conv.toCurrency}\n`;
            response += `🕒 **Updated:** ${new Date().toLocaleString()}\n\n`;
        }
        
        else if (!result.result.success) {
            response += `❌ **Error:** ${result.result.error}\n\n`;
        }
    });
    
    return response.trim();
}


// Main API handler
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        console.log('📝 User message:', message);
        
        // Call Groq AI with function calling
        const result = await callGroqAI(message);
        
        console.log('✅ Response ready');
        
        res.json({
            response: result.response,
            toolsUsed: result.toolsUsed,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('🚨 API Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}