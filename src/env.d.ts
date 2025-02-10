/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface WorkerRuntime {
  runtime: {
    ctx: {
      waitUntil: (promise: Promise<any>) => void;
    };
  };
}

declare namespace App {
  interface Locals extends WorkerRuntime {}
}
