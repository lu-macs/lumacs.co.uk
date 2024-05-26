import { db } from '.';

export const getImages = () => {
  return db.query.image.findMany({
    with: {
      tags: true,
    },
  });
};

export type GetImages = Awaited<ReturnType<typeof getImages>>;
