/**
 * Sanitizes user-provided content by removing HTML tags and encoding special characters.
 * This helps prevent XSS attacks and ensures clean content storage.
 * 
 * @param content - The raw content string to sanitize
 * @returns The sanitized content string
 */
export function sanitizeContent(content: string): string {
  // First pass: Remove all HTML tags (including malformed ones)
  let sanitized = content.replace(/<[^>]*>?/gm, '');
  
  // Second pass: Remove any remaining < or > characters that might be part of incomplete tags
  sanitized = sanitized.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Remove script-related keywords that might bypass filters
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, ''); // Remove event handlers like onclick=
  
  // Remove null bytes and other control characters
  sanitized = sanitized.replace(/\0/g, '');
  
  // Normalize whitespace but preserve line breaks
  sanitized = sanitized.replace(/\r\n/g, '\n'); // Normalize line endings
  
  // Trim whitespace
  return sanitized.trim();
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
