import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";

export function LUCCMaps() {
  return (
    <div className="m-4 flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold mb-4">Maps & Venue Info</h2>
      <div className="flex flex-col md:flex-row gap-8 w-full justify-center items-center">
        {/* LICA Building Map */}
        <Dialog>
          <DialogTrigger asChild>
            <img
              src="/assets/lucc/event.jpeg"
              alt="LICA Building Map for LUCC 2025"
              className="rounded-lg shadow-lg cursor-pointer max-w-xs md:max-w-sm hover:scale-105 transition-transform"
              loading="lazy"
            />
          </DialogTrigger>
          <DialogContent className="max-w-3xl flex flex-col items-center">
            <img
              src="/assets/lucc/event.jpeg"
              alt="LICA Building Map for LUCC 2025 enlarged"
              className="rounded-lg w-full h-auto"
              style={{ maxHeight: "80vh", objectFit: "contain" }}
            />
            <DialogClose className="mt-2 underline text-sm">Close</DialogClose>
          </DialogContent>
        </Dialog>
        {/* Campus Map */}
        <Dialog>
          <DialogTrigger asChild>
            <img
              src="/assets/lucc/campus.jpeg"
              alt="Lancaster University Campus Map for LUCC 2025"
              className="rounded-lg shadow-lg cursor-pointer max-w-xs md:max-w-sm hover:scale-105 transition-transform"
              loading="lazy"
            />
          </DialogTrigger>
          <DialogContent className="max-w-3xl flex flex-col items-center">
            <img
              src="/assets/lucc/campus.jpeg"
              alt="Lancaster University Campus Map for LUCC 2025 enlarged"
              className="rounded-lg w-full h-auto"
              style={{ maxHeight: "80vh", objectFit: "contain" }}
            />
            <DialogClose className="mt-2 underline text-sm">Close</DialogClose>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col items-center mt-4">
        <a
          href="/assets/lucc/Campus%20Map%20&%20Info%20LUCC%2025.pdf"
          className={buttonVariants({ variant: "outline" })}
          download
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Full Venue & Campus Info (PDF)
        </a>
        <span className="text-xs text-muted-foreground mt-2">
          PDF includes both maps and additional info
        </span>
      </div>
    </div>
  );
} 