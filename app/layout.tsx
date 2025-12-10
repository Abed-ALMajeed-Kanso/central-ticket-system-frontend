import "styles/globals.css";
import { ReactNode } from "react";
import AppBar from "../components/AppBar";
import Providers from "./Providers";

interface IProps {
  children: ReactNode;
}

export default function RootLayout({ children }: IProps) {
  return (
    <html lang="en" className="h-full w-full">
      <body className="h-full w-full overflow-hidden">
        <Providers>
          <AppBar />
          <div className="h-full w-full flex flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
