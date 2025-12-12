'use client';

import { Conversation } from '@/lib/types';
import { useEffect, useState } from 'react';

interface MessageListProps {
  conversations: Conversation[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
}

export default function MessageList({
  conversations,
  selectedChatId,
  onSelectChat,
}: MessageListProps) {
  return (
    <div className="w-full md:w-1/3 border-r border-gray-200 bg-gray-50 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold">Conversations</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations yet
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.chatId}
              onClick={() => onSelectChat(conv.chatId)}
              className={`w-full text-left p-4 hover:bg-gray-100 transition-colors ${
                selectedChatId === conv.chatId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium text-gray-900">
                  {conv.username || `User ${conv.userId}`}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(conv.lastActivity).toLocaleTimeString()}
                </span>
              </div>
              {conv.lastMessage && (
                <p className="text-sm text-gray-600 truncate">
                  {conv.lastMessage.direction === 'inbound'
                    ? conv.lastMessage.translatedText || conv.lastMessage.originalText
                    : conv.lastMessage.originalText}
                </p>
              )}
              <div className="text-xs text-gray-400 mt-1">
                {conv.messageCount} message{conv.messageCount !== 1 ? 's' : ''}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

