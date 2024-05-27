import {
  generateUploadButton,
  generateUploadDropzone,
} from '@uploadthing/react';

import type { OurFileRouter } from '@/server/uploadthing';

export const OurUploadButton = generateUploadButton<OurFileRouter>();
export const OurUploadDropzone = generateUploadDropzone<OurFileRouter>();
