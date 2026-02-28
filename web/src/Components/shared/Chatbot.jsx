import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: '🌿 Hello! I\'m PiperSmart Assistant. How can I help with your pepper farming today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call Groq API (works for web + mobile)
      console.log('🤖 Sending to Groq:', GROQ_API_URL);
      
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are PiperSmart Assistant, an expert in black pepper farming and disease detection. 
                      Provide helpful, concise advice about pepper farming, disease prevention, weather considerations, and harvest readiness.
                      Keep responses under 150 words. Be friendly and professional.`
            },
            {
              role: 'user',
              content: input
            }
          ],
          temperature: 0.7,
          max_tokens: 200,
        })
      });

      console.log('📊 Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Response Error:', errorData);
        throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('✅ API Response Received:', data);
      const botText = data.choices?.[0]?.message?.content || '❌ Unable to generate response. Please try again.';

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: botText
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('❌ Chatbot error:', error.message);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: '❌ Error: ' + error.message
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  const quickQuestions = [
    'How do I prevent black pepper diseases?',
    'What\'s the best harvest time?',
    'How to treat footrot disease?',
    'What\'s ideal weather for peppers?'
  ];

  return (
    <>
      {/* Chat Widget */}
      <div className={`chatbot-widget ${isOpen ? 'open' : ''}`}>
        {/* Chat Header */}
        <div className="chatbot-header">
          <div className="chatbot-title">
            <span className="chatbot-icon">🤖</span>
            <h3>PiperSmart Assistant</h3>
          </div>
          <button 
            className="chatbot-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        {/* Messages Container */}
        <div className="chatbot-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message message-${msg.type}`}>
              <div className="message-content">
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message message-bot">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions - Show only when no conversation started */}
        {messages.length <= 1 && !isLoading && (
          <div className="chatbot-quick-questions">
            <p className="quick-label">Quick questions:</p>
            <div className="quick-buttons">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  className="quick-btn"
                  onClick={() => handleQuickQuestion(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form className="chatbot-input-form" onSubmit={sendMessage}>
          <input
            type="text"
            className="chatbot-input"
            placeholder="Ask about pepper farming..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="chatbot-send"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            📤
          </button>
        </form>
      </div>

      {/* Float Button */}
      {!isOpen && (
        <button 
          className="chatbot-float-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
          title="Chat with PiperSmart Assistant"
        >
          💬
        </button>
      )}
    </>
  );
};

export default Chatbot;
