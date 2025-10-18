import { memo } from 'react';

interface MessageProps {
  content: string;
  timestamp: string;
}

function Message({ content, timestamp }: MessageProps) {
  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date().getTime();
    const messageTime = new Date(timestamp).getTime();
    const diffInSeconds = Math.floor((now - messageTime) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-3 sm:p-4 mb-2 sm:mb-3 border border-purple-500/30 hover:border-purple-400/50 hover:shadow-[0_8px_32px_0_rgba(139,92,246,0.3)] transition-all duration-300 animate-fade-in">
      <p className="text-gray-100 text-sm sm:text-base leading-relaxed break-words">
        {content}
      </p>
      <p className="text-purple-400/70 text-xs mt-1.5 sm:mt-2 lowercase">
        {formatRelativeTime(timestamp)}
      </p>
    </div>
  );
}

// Wrap with React.memo to prevent unnecessary re-renders
export default memo(Message);
