/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface WorkerRuntime {
  runtime: {
    waitUntil: (promise: Promise<any>) => void;
    env: Env;
    cf: CFRequest['cf'];
    caches: typeof caches;
  };
}

declare namespace App {
  interface Locals extends WorkerRuntime {}
}
