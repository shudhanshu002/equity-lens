"use client";

import type React from "react";
import { SessionProvider } from "next-auth/react";

type AuthSessionProviderProps = {
    children: React.ReactNode;
};

export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
    return <SessionProvider>{children}</SessionProvider>;
}