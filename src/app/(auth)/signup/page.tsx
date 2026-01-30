'use client';

import { SignupForm } from './signup-form';

// By converting this page to a client component, we ensure that the
// complex SignupForm (which uses browser-only APIs for payments)
// is never rendered on the server, preventing the hydration crash
// that was causing the blank screen.
export default function SignupPage() {
  return <SignupForm />;
}
