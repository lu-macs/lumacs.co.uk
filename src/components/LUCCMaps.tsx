import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog';

export function LUCCMaps() {
  return (
    <div className="p-4 flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold mb-4">Maps & Venue Info</h2>
      <div className="flex flex-col md:flex-row gap-8 w-full justify-center items-center">
        {/* LICA Building Map */}
        <Dialog>
          <DialogTrigger asChild>
            <img
              src="/assets/lucc/event.png"
              alt="LICA Building Map for LUCC 2026"
              className="rounded-lg shadow-lg cursor-pointer max-w-xs md:max-w-sm hover:scale-105 transition-transform"
              loading="lazy"
            />
          </DialogTrigger>
          <DialogContent className="max-w-3xl flex flex-col items-center">
            <img
              src="/assets/lucc/event.png"
              alt="LICA Building Map for LUCC 2026 enlarged"
              className="rounded-lg w-full h-auto"
              style={{ maxHeight: '80vh', objectFit: 'contain' }}
            />
            <DialogClose className="mt-2 underline text-sm">Close</DialogClose>
          </DialogContent>
        </Dialog>
        {/* Campus Map */}
        <Dialog>
          <DialogTrigger asChild>
            <img
              src="/assets/lucc/campus-fixed.png"
              alt="Lancaster University Campus Map for LUCC 2026"
              className="rounded-lg shadow-lg cursor-pointer max-w-xs md:max-w-sm hover:scale-105 transition-transform"
              loading="lazy"
            />
          </DialogTrigger>
          <DialogContent className="max-w-3xl flex flex-col items-center">
            <img
              src="/assets/lucc/campus-fixed.png"
              alt="Lancaster University Campus Map for LUCC 2026 enlarged"
              className="rounded-lg w-full h-auto"
              style={{ maxHeight: '80vh', objectFit: 'contain' }}
            />
            <DialogClose className="mt-2 underline text-sm">Close</DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
