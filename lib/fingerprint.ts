/**
 * Generates a consistent browser fingerprint based on user agent and screen resolution.
 * This is used for basic rate limiting without requiring authentication.
 * 
 * @returns A string hash representing the browser fingerprint
 */
export function generateFingerprint(): string {
  const userAgent = navigator.userAgent;
  const screenResolution = `${screen.width}x${screen.height}`;
  const combined = `${userAgent}-${screenResolution}`;
  
  // Simple hash function to convert the combined string into a consistent hash
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString(36);
}
