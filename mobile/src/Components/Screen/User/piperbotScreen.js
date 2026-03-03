import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Clipboard,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BACKEND_URL } from 'react-native-dotenv';
import MobileHeader from '../../shared/MobileHeader';
import Notepad from '../../shared/Notepad';

const PiperbotScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: '🌿 Hello! I\'m PiperSmart Assistant. How can I help with your pepper farming today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY;
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  const colors = {
    primary: '#1B4D3E',
    background: '#F8FAF7',
    text: '#1B4D3E',
    border: '#D4E5DD',
    textLight: '#5A7A73',
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied!', 'Answer copied to clipboard', [{ text: 'OK' }]);
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
    Keyboard.dismiss();

    try {
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]}>
      <MobileHeader 
        navigation={navigation}
      />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={[styles.messagesContainer, { backgroundColor: colors.background }]}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map(msg => (
            <View key={msg.id} style={[styles.message, styles[`message_${msg.type}`]]}>
              <View style={[styles.messageContent, styles[`messageContent_${msg.type}`]]}>
                <Text style={[styles.messageText, styles[`messageText_${msg.type}`]]}>
                  {msg.text}
                </Text>
              </View>
              {msg.type === 'bot' && (
                <TouchableOpacity 
                  style={styles.copyBtn}
                  onPress={() => copyToClipboard(msg.text)}
                >
                  <Feather name="copy" size={14} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {isLoading && (
            <View style={[styles.message, styles.message_bot]}>
              <View style={[styles.messageContent, styles.messageContent_bot]}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Questions - Show only at start */}
        {messages.length <= 1 && !isLoading && (
          <View style={[styles.quickQuestionsContainer, { borderTopColor: colors.border }]}>
            <Text style={[styles.quickLabel, { color: colors.textLight }]}>Quick questions:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickButtonsScroll}>
              {quickQuestions.map((q, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.quickBtn, { backgroundColor: '#F0F5F3', borderColor: colors.border }]}
                  onPress={() => handleQuickQuestion(q)}
                >
                  <Text style={[styles.quickBtnText, { color: colors.text }]}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Form */}
        <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: '#FFFFFF' }]}>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Ask about pepper farming..."
            placeholderTextColor={colors.textLight}
            value={input}
            onChangeText={setInput}
            editable={!isLoading}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: isLoading || !input.trim() ? 0.5 : 1 }]}
            onPress={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Feather name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Floating Notepad - Lower Left */}
      <View style={{ position: 'absolute', bottom: 30, left: 90, zIndex: 999 }}>
        <Notepad />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 150,
  },
  message: {
    marginVertical: 6,
    flexDirection: 'row',
  },
  message_user: {
    justifyContent: 'flex-end',
  },
  message_bot: {
    justifyContent: 'flex-start',
  },
  messageContent: {
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  messageContent_user: {
    backgroundColor: '#1B4D3E',
    borderBottomRightRadius: 4,
  },
  messageContent_bot: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4E5DD',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  messageText_user: {
    color: '#FFFFFF',
  },
  messageText_bot: {
    color: '#1B4D3E',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1B4D3E',
  },
  quickQuestionsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  quickButtonsScroll: {
    marginHorizontal: -12,
    paddingHorizontal: 12,
  },
  quickBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  quickBtnText: {
    fontSize: 11,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyBtn: {
    padding: 6,
    marginLeft: 6,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingRight: 8,
  },
  bulletPoint: {
    fontSize: 13,
    color: '#1B4D3E',
    marginRight: 8,
    fontWeight: '700',
  },
  bulletText: {
    fontSize: 13,
    color: '#1B4D3E',
    flex: 1,
    lineHeight: 18,
  },
  regularText: {
    fontSize: 13,
    color: '#1B4D3E',
    lineHeight: 18,
    marginVertical: 4,
  },
  copyBtn: {
    padding: 6,
    marginLeft: 6,
  },
});

export default PiperbotScreen;
