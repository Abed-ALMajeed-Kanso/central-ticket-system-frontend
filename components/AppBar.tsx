"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "../app/context/UserContext";
import Button from "app/elements/Button";
import { checkAccessToken, refreshAccessToken, logout } from "../app/lib/api/auth";


const AppBar = () => {
  const { user, setUser } = useUser();
  const router = useRouter();
  const pathname = usePathname(); 

useEffect(() => {
  const verify = async () => {

    if (pathname === "/") return;

    const result = await checkAccessToken();

    if (!result.success) {
      const refreshResult = await refreshAccessToken();

      if (!refreshResult.success) {
        setUser(null);
        router.push("/");
        return;
      }

      await checkAccessToken();
    }
  };

  verify();
}, [pathname]);

  const handleLogout = async () => {
    await logout(setUser);
    setUser(null);
    router.push("/");
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-cyan-50 to-cyan-200 px-4 py-2 flex gap-5">
      {user?.role =="ROLE_ADMIN" && pathname !== "/" && (
        <Button
          type="button"
          onClick={() => router.push("/users")}
          variant="success" 
          paddingLess
          className="w-48 text-base px-6 py-3"
        >
          View Users
        </Button>
      )}
      {user && pathname !== "/" && (
        <>
        {pathname !== "/tickets" ? (
          <Button
            type="button"
            onClick={() => router.push("/tickets")}
            variant="primary"
            paddingLess
            className="w-48 text-base px-6 py-3"
          >
            View Tickets
          </Button>
        ) : pathname === "/tickets" ? (
          <Button
            type="button"
            onClick={() => router.push("/profile")}
            paddingLess
            className="w-48 text-base px-6 py-3"
          >
            Back to profile
          </Button>
        ) : null}
      </>
    )}
    {user && pathname !== "/" && (
        <Button
          type="button"
          onClick={handleLogout}
          variant="danger"
          paddingLess
          className="w-48 text-base px-6 py-3"
        >
          Logout
        </Button>
      )}
    </div>
  );
};

export default AppBar;
