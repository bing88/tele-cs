'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import MessageList from '@/components/MessageList';
import MessageThread from '@/components/MessageThread';
import ReplyBox from '@/components/ReplyBox';
import { Conversation, Message } from '@/lib/types';

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use refs to track current values for polling
  const selectedChatIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  // Fetch conversations
  const fetchConversations = useCallback(async (silent = false) => {
    try {
      const res = await fetch('/api/messages');
      if (!res.ok) {
        // Don't update on error - keep existing data
        if (!silent) setLoading(false);
        return;
      }
      
      const data = await res.json();
      const newConversations = data.conversations || [];
      
      // Always update with new data (prevents flickering by keeping old data until new arrives)
      setConversations(newConversations);
      
      // Auto-select first conversation if none selected
      setSelectedChatId((current) => {
        if (!current && newConversations.length > 0) {
          return newConversations[0].chatId;
        }
        return current;
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Don't clear existing conversations on error - preserve current state
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch messages for selected chat
  const fetchMessages = useCallback(async (chatId: string, silent = false) => {
    try {
      const res = await fetch(`/api/messages/${chatId}`);
      if (!res.ok) {
        // Don't update on error - keep existing data
        return;
      }
      
      const data = await res.json();
      const newMessages = data.messages || [];
      
      // Only update if chatId still matches (prevents race conditions)
      setMessages((current) => {
        // Only update if this is still the selected chat
        if (chatId === selectedChatIdRef.current) {
          return newMessages;
        }
        return current; // Keep current messages if chat changed
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Don't clear existing messages on error - preserve current state
    }
  }, []);

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
    } else {
      // Clear messages when no chat is selected
      setMessages([]);
    }
  }, [selectedChatId, fetchMessages]);

  // Poll for new messages every 3 seconds (silent updates to prevent flickering)
  useEffect(() => {
    const interval = setInterval(() => {
      // Use ref to get current selectedChatId to avoid stale closures
      const currentChatId = selectedChatIdRef.current;
      fetchConversations(true); // silent = true to prevent loading state changes
      if (currentChatId) {
        fetchMessages(currentChatId, true); // silent = true to prevent flickering
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchConversations, fetchMessages]);

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
