import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';

const ChatbotComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: '🌿 Hello! I\'m PiperSmart Assistant. How can I help with your pepper farming today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
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
      console.log('🤖 Sending to Groq from Mobile:', GROQ_API_URL);
      
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

      console.log('📊 Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Response Error:', errorData);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Response Received');
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
      {/* Float Button */}
      {!isOpen && (
        <TouchableOpacity
          style={styles.floatButton}
          onPress={() => setIsOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.floatButtonText}>💬</Text>
        </TouchableOpacity>
      )}

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.container}>
          {/* Chat Header */}
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Text style={styles.headerIcon}>🤖</Text>
              <Text style={styles.headerText}>PiperSmart Assistant</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Messages Container */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollToBottom()}
          >
            {messages.map(msg => (
              <View
                key={msg.id}
                style={[
                  styles.messageWrapper,
                  msg.type === 'user' ? styles.userWrapper : styles.botWrapper
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    msg.type === 'user' ? styles.userBubble : styles.botBubble
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.type === 'user' ? styles.userText : styles.botText
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              </View>
            ))}

            {isLoading && (
              <View style={[styles.messageWrapper, styles.botWrapper]}>
                <View style={[styles.messageBubble, styles.botBubble]}>
                  <ActivityIndicator color="#1B4D3E" size="small" />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick Questions */}
          {messages.length <= 1 && !isLoading && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={styles.quickLabel}>Quick questions:</Text>
              {quickQuestions.map((q, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickButton}
                  onPress={() => handleQuickQuestion(q)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickButtonText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Input Form */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask about pepper farming..."
              placeholderTextColor="#5A7A73"
              value={input}
              onChangeText={setInput}
              editable={!isLoading}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (isLoading || !input.trim()) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={isLoading || !input.trim()}
              activeOpacity={0.7}
            >
              <Text style={styles.sendButtonText}>📤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Float Button
  floatButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 999,
  },
  floatButtonText: {
    fontSize: 28,
  },

  // Container
  container: {
    flex: 1,
    backgroundColor: '#F8FAF7',
  },

  // Header
  header: {
    backgroundColor: '#1B4D3E',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27, 77, 62, 0.2)',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Messages
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  messageWrapper: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  botWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: '#27AE60',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4E5DD',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: '#1B4D3E',
  },

  // Quick Questions
  quickQuestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#D4E5DD',
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5A7A73',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickButton: {
    backgroundColor: '#F0F5F3',
    borderWidth: 1,
    borderColor: '#D4E5DD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  quickButtonText: {
    fontSize: 12,
    color: '#1B4D3E',
    fontWeight: '500',
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#D4E5DD',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D4E5DD',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1B4D3E',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.84,
    elevation: 3,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 18,
  },
});

export default ChatbotComponent;
