// pages/index.js - Main chat interface
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `👋 Welcome to AI Assistant!

I can help you with:
• 🌤️ Weather - "What's the weather in Attock?"
• 📋 Tasks - "Add task: Buy groceries" or "Show my tasks"
• 📈 Stocks - "What's Apple's stock price?"
• 💱 Currency - "Convert 100 USD to Euro"
• 💭 Quotes - "Give me an inspirational quote"

Try asking me anything!`,
            timestamp: new Date().toISOString()
        }
    ]);
    
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Example queries for quick testing
    const exampleQueries = [
        "What's the weather in New York?",
        "Add task: Prepare for interview with high priority",
        "Show my tasks",
        "What's Tesla's stock price?",
        "Convert 50 USD to EUR",
        "Give me an inspirational quote"
    ];

    // Send message to API
    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setIsLoading(true);

        // Add user message to chat
        const newMessages = [...messages, {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
        }];
        setMessages(newMessages);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Add assistant response
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response,
                toolsUsed: data.toolsUsed,
                timestamp: new Date().toISOString()
            }]);

        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Use example query
    const useExampleQuery = (query) => {
        setInputMessage(query);
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            <Head>
                <title>AI Assistant with Custom Tools</title>
                <meta name="description" content="AI Agent" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="container mx-auto max-w-4xl px-4 py-8">
                    
                    {/* Header */}
                    <div className="bg-white rounded-t-3xl shadow-lg p-8 text-center">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">
                            🤖 AI Assistant
                        </h1>
                       
                    </div>

                    {/* Tools Info */}
                    <div className="bg-gray-50 border-x border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            🛠️ Tools AI Agent can work with
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { icon: '🌤️', title: 'Weather', desc: 'Current weather for any city' },
                                { icon: '📋', title: 'Tasks', desc: 'Manage your to-do list' },
                                { icon: '📈', title: 'Stocks', desc: 'Real-time stock prices' },
                                { icon: '💱', title: 'Currency', desc: 'Convert currencies' },
                                { icon: '💭', title: 'Quotes', desc: 'Inspirational quotes' },
                                { icon: '🔧', title: 'Multi-tool', desc: 'Use multiple tools together' }
                            ].map((tool, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{tool.icon}</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{tool.title}</h3>
                                            <p className="text-sm text-gray-600">{tool.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Container */}
                    <div className="bg-white border-x border-gray-200 h-96 flex flex-col">
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((message, index) => (
                                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex items-start space-x-3 max-w-3xl ${
                                        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                                    }`}>
                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                            message.role === 'user' 
                                                ? 'bg-blue-500' 
                                                : 'bg-gray-500'
                                        }`}>
                                            {message.role === 'user' ? '👤' : '🤖'}
                                        </div>
                                        
                                        {/* Message Content */}
                                        <div className={`p-4 rounded-2xl ${
                                            message.role === 'user'
                                                ? 'bg-blue-500 text-white rounded-br-sm'
                                                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                        }`}>
                                            <div className="whitespace-pre-wrap">{message.content}</div>
                                            
                                            {/* Tools Used */}
                                            {message.toolsUsed && message.toolsUsed.length > 0 && (
                                                <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                                    <h4 className="text-sm font-semibold text-blue-800 mb-2">
                                                        🛠️ Tools Used:
                                                    </h4>
                                                    <ul className="text-sm text-blue-700 space-y-1">
                                                        {message.toolsUsed.map((tool, idx) => (
                                                            <li key={idx}>
                                                                <strong>{tool.tool}:</strong> {JSON.stringify(tool.args)}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Loading indicator */}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
                                            🤖
                                        </div>
                                        <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-sm">
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                                <span className="text-gray-600">AI is working with tools...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="border-t border-gray-200 p-4">
                            <div className="flex space-x-4">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask me anything... (e.g., 'What's the weather in London?')"
                                    className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isLoading}
                                    maxLength={500}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={isLoading || !inputMessage.trim()}
                                    className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Example Queries */}
                    <div className="bg-gray-50 rounded-b-3xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            💡 Try these examples:
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {exampleQueries.map((query, index) => (
                                <button
                                    key={index}
                                    onClick={() => useExampleQuery(query)}
                                    className="p-3 bg-white rounded-full text-left hover:bg-blue-50 hover:text-blue-700 transition-colors border border-gray-200 hover:border-blue-300 text-sm"
                                    disabled={isLoading}
                                >
                                    {query}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                 
                </div>
            </div>
        </>
    );
}