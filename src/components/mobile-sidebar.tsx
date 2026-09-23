"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="text-white font-semibold">Lead Intel</div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded hover:bg-slate-800 text-slate-300"
        >
          <Menu size={20} />
        </button>
      </header>

      {open && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="md:hidden fixed inset-y-0 left-0 z-50 w-64">
            <div className="relative h-full">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white z-10"
              >
                <X size={16} />
              </button>
              <Sidebar />
            </div>
          </div>
        </>
      )}
    </>
  );
}