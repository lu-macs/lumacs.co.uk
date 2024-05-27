import type { GetImages } from '@/server/db/queries';

export const MyGallery = ({ images }: { images: GetImages }) => {
  return (
    <div className="flex gap-1 flex-wrap justify-center">
      {images
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .filter(({ type }) => type === 'image')
        .map(({ id, tags }) => (
          <img
            src={`https://utfs.io/f/${id}`}
            alt={tags?.join(', ')}
            // scale image so height is 72 and width is dynamic
            className="h-48 md:h-64"
          />
        ))}
      {images
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .filter(({ type }) => type === 'video')
        .map(({ id }) => (
          <video
            key={id}
            src={`https://utfs.io/f/${id}`}
            className="h-64"
            controls
          />
        ))}
    </div>
  );
};
