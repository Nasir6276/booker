export const isClerkConfigured = (): boolean => {
  if (typeof window === 'undefined') {
    const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    return !!pubKey && pubKey.startsWith('pk_');
  }

  const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return !!pubKey && pubKey.startsWith('pk_');
};
