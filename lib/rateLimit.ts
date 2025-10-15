/**
 * Client-side rate limiting utilities using localStorage.
 * Prevents users from sending messages too frequently (10 second cooldown).
 */

const RATE_LIMIT_KEY = 'nerdsphere_last_message';
const RATE_LIMIT_SECONDS = 10;

/**
 * Checks if the user is allowed to send a message based on the rate limit.
 * 
 * @returns An object indicating if sending is allowed and remaining cooldown time
 */
export function canSendMessage(): { allowed: boolean; remainingTime: number } {
  const lastMessageTime = localStorage.getItem(RATE_LIMIT_KEY);
  
  if (!lastMessageTime) {
    return { allowed: true, remainingTime: 0 };
  }
  
  const elapsed = Date.now() - parseInt(lastMessageTime);
  const remainingMs = (RATE_LIMIT_SECONDS * 1000) - elapsed;
  
  if (remainingMs <= 0) {
    return { allowed: true, remainingTime: 0 };
  }
  
  return { allowed: false, remainingTime: Math.ceil(remainingMs / 1000) };
}

/**
 * Records the current timestamp as the last message sent time.
 * Should be called after successfully sending a message.
 */
export function recordMessageSent(): void {
  localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
}
