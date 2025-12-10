"use client";

import { ReactNode } from "react";
import { UserProvider } from "./context/UserContext"; 

interface Props {
  children: ReactNode;
}

export default function Providers({ children }: Props) {
  return <UserProvider>{children}</UserProvider>;
}
