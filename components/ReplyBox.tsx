'use client';

import { useState } from 'react';

interface ReplyBoxProps {
  chatId: string;
  onSend: (text: string) => Promise<void>;
  disabled?: boolean;
}

export default function ReplyBox({ chatId, onSend, disabled }: ReplyBoxProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending || disabled) return;

    setSending(true);
    try {
      await onSend(text.trim());
      setText('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your reply in English..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled || sending}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending || disabled}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-2">
        Your message will be automatically translated to Korean before sending.
      </p>
    </div>
  );
}

