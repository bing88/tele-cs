'use client';

import { useState, useEffect } from 'react';
import MessageList from '@/components/MessageList';
import MessageThread from '@/components/MessageThread';
import ReplyBox from '@/components/ReplyBox';
import { Conversation, Message } from '@/lib/types';

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setConversations(data.conversations || []);
      
      // Auto-select first conversation if none selected
      if (!selectedChatId && data.conversations?.length > 0) {
        setSelectedChatId(data.conversations[0].chatId);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected chat
  const fetchMessages = async (chatId: string) => {
    try {
      const res = await fetch(`/api/messages/${chatId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Handle sending reply
  const handleSendReply = async (text: string) => {
    if (!selectedChatId) return;

    try {
      const res = await fetch(`/api/messages/${selectedChatId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      // Refresh messages and conversations
      await fetchMessages(selectedChatId);
      await fetchConversations();
    } catch (error) {
      console.error('Error sending reply:', error);
      throw error;
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChatId) {
      fetchMessages(selectedChatId);
    }
  }, [selectedChatId]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedChatId) {
        fetchMessages(selectedChatId);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedChatId]);

  return (
    <div className="flex h-screen bg-gray-100">
      <MessageList
        conversations={conversations}
        selectedChatId={selectedChatId || undefined}
        onSelectChat={setSelectedChatId}
      />
      
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <>
            <div className="border-b border-gray-200 bg-white p-4">
              <h1 className="text-xl font-semibold">
                {conversations.find(c => c.chatId === selectedChatId)?.username || 
                 `Chat ${selectedChatId}`}
              </h1>
            </div>
            <MessageThread messages={messages} chatId={selectedChatId} />
            <ReplyBox chatId={selectedChatId} onSend={handleSendReply} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            {loading ? 'Loading...' : 'Select a conversation to start'}
          </div>
        )}
      </div>
    </div>
  );
}
