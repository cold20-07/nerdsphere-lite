/**
 * Sanitizes user-provided content by removing HTML tags and trimming whitespace.
 * This helps prevent XSS attacks and ensures clean content storage.
 * 
 * @param content - The raw content string to sanitize
 * @returns The sanitized content string
 */
export function sanitizeContent(content: string): string {
  // Remove HTML tags to prevent XSS
  const withoutHtml = content.replace(/<[^>]*>/g, '');
  
  // Trim whitespace
  return withoutHtml.trim();
}

/**
 * Validates message content against business rules.
 * Checks for emptiness, length limits, and spam patterns.
 * 
 * @param content - The content string to validate
 * @returns An object with validation result and optional error message
 */
export function validateContent(content: string): { valid: boolean; error?: string } {
  // Check if content is empty or only whitespace
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  
  // Check if content exceeds 500 character limit
  if (content.length > 500) {
    return { valid: false, error: 'Message too long (max 500 characters)' };
  }
  
  // Check for spam pattern: 50 or more identical consecutive characters
  const spamPattern = /(.)\1{49,}/;
  if (spamPattern.test(content)) {
    return { valid: false, error: 'Message appears to be spam' };
  }
  
  return { valid: true };
}
