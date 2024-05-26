import { createUploadthing, type FileRouter } from 'uploadthing/server';
import { db } from './db';
import { image } from './db/schema';
import { z } from 'zod';

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: { maxFileSize: '8MB', maxFileCount: 32 },
    video: { maxFileSize: '128MB', maxFileCount: 16 },
  })
    .input(
      z.object({
        password: z.string(),
      })
    )
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req, input }) => {
      // This code runs on your server before upload

      if (input.password !== import.meta.env.UPLOADTHING_PASSWORD) {
        throw new Error('Invalid password');
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return {};
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload

      console.log('file url', file.url);

      console.log('type', file.type);

      await db
        .insert(image)
        .values({
          id: file.key,
          createdAt: new Date(),
          type: file.type as 'image' | 'video',
        })
        .execute();

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {};
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
