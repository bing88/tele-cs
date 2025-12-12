import { Message } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isInbound = message.direction === 'inbound';
  const displayText = isInbound 
    ? message.translatedText || message.originalText
    : message.originalText;

  return (
    <div className={`flex ${isInbound ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isInbound
            ? 'bg-gray-100 text-gray-900'
            : 'bg-blue-500 text-white'
        }`}
      >
        <p className="text-sm">{displayText}</p>
        {message.translatedText && isInbound && (
          <p className="text-xs mt-1 opacity-70 italic">
            Original: {message.originalText}
          </p>
        )}
        {message.translatedText && !isInbound && (
          <p className="text-xs mt-1 opacity-70 italic">
            Translated: {message.translatedText}
          </p>
        )}
        <p className="text-xs mt-1 opacity-60">
          {new Date(message.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

