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
    <div className="bg-space-navy/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-2 sm:mb-3 border border-space-purple/20 hover:border-space-purple/40 hover:shadow-glow transition-all duration-300 animate-fade-in">
      <p className="text-gray-100 text-sm sm:text-base leading-relaxed break-words">
        {content}
      </p>
      <p className="text-space-cyan/60 text-xs mt-1.5 sm:mt-2">
        {formatRelativeTime(timestamp)}
      </p>
    </div>
  );
}

// Wrap with React.memo to prevent unnecessary re-renders
export default memo(Message);
