export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'U';
  
  const trimmed = name.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  
  // Handle hyphenated names like "Jean-Luc"
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
  }

  // If single word, take first two letters if available
  if (trimmed.length === 1) return trimmed.toUpperCase();
  return trimmed.substring(0, 2).toUpperCase();
}
