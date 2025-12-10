"use client";

import React from "react";

export const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    active: "bg-blue-100 text-blue-800 border-blue-300",
    completed: "bg-green-100 text-green-800 border-green-300",
    urgent: "bg-red-100 text-red-800 border-red-300",
  };

  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`px-3 py-1 text-sm font-medium rounded-full border ${
        styles[status] || ""
      }`}
    >
      {label}
    </span>
  );
};
export default getStatusBadge;