"use client";

import { useClerk } from "@clerk/nextjs";

export default function CustomSignOutButton() {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    // Redirect after sign-out
    window.location.href = "/";
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}
