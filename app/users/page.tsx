"use client";

import { useEffect, useState, useMemo } from "react";
import Button from "../elements/Button";
import { getAllUsers, deleteUser } from "../lib/api/users";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import { useRouter } from "next/navigation";

export default function UsersPage() {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllUsers(page, size, sortBy, sortDir);
        setData(res.content);
        setTotalPages(res.totalPages);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, size, sortBy, sortDir]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "number",
        header: "Phone",
      },
      {
        accessorKey: "address",
        header: "Address",
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {},
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId);
      setData((prev) => prev.filter((u) => u.id !== userId)); 
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  return (
   <div className="min-h-screen flex justify-center bg-gradient-to-br from-cyan-300 to-sky-600 p-8 pt-24">
    <div className="w-full max-w-5xl bg-white shadow-md rounded-xl p-8 max-h-[80vh] overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4 text-center relative after:block after:w-16 after:h-1 after:bg-blue-600 after:mx-auto after:mt-2">
        Users
      </h1>
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border-b py-3 text-left font-semibold cursor-pointer"
                  onClick={() => handleSort(header.column.id)}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {sortBy === header.column.id && (
                    <span>{sortDir === "asc" ? " 🔼" : " 🔽"}</span>
                  )}
                </th>
              ))}
              {/* Add Delete header */}
              <th className="border-b py-3 text-left font-semibold">Actions</th>
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="py-3 border-b px-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
              {/* Delete button */}
              <td className="py-3 border-b px-2">
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  onClick={() => handleDelete(row.original.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    {/* Pagination */}
    <div className="flex justify-between items-center mt-6">
      <button
        className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
        disabled={page === 0}
        onClick={() => setPage((p) => p - 1)}
      >
        Previous
      </button>

      <span className="font-medium">
        Page {page + 1} / {totalPages}
      </span>

      <select
        className="border px-3 py-2 rounded"
        value={size}
        onChange={(e) => {
          setSize(Number(e.target.value));
          setPage(0);
        }}
      >
        <option value="5">5 per page</option>
        <option value="10">10 per page</option>
        <option value="20">20 per page</option>
        <option value="50">50 per page</option>
      </select>

      <button
        className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
        disabled={page + 1 >= totalPages}
        onClick={() => setPage((p) => p + 1)}
      >
        Next
      </button>
    </div>

    <div className="mt-4 flex justify-center">
      <Button
        type="button"
        className="w-full text-base px-6 py-3"
        onClick={() => router.push("/create-user")}>

        Create User
        </Button> 
    </div>

  </div>
</div> 
  );
}
