import { Card, Separator } from '@/components/ui/cool-card';

const displays: {
  title: string;
  img: string;
}[] = [
  {
    title: 'Fire Devil Sticks',
    img: '/display/fire.jpeg',
  },
  {
    title: 'Unicycling',
    img: '/display/unicycling.jpeg',
  },
  {
    title: 'Aerial Hoop',
    img: '/display/hoop.jpeg',
  },
  {
    title: 'Juggling',
    img: '/display/juggling.jpeg',
  },
  {
    title: 'Aerial Silks',
    img: '/display/silksstar.jpeg',
  },
  {
    title: 'Diablo',
    img: '/display/diablo.jpeg',
  },
  {
    title: 'Acro Staff',
    img: '/display/staff.jpeg',
  },
  {
    title: 'Aerial Silks',
    img: '/display/silksstanding.jpeg',
  },
];

export const DisplayCards = () => {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 m-4">
      {displays.map(({ img, title }, index) => (
        <Card key={index}>
          <div className="flex flex-col items-center justify-center p-2">
            <img
              src={img.split('.')[0] + '.webp'}
              alt={`lumacs members displaying ${title}`}
              className="size-40 lg:size-48 rounded"
              width={192}
              height={192}
              loading="eager"
              decoding="async"
            />
            <Separator className="my-2" />
            <h2 className="font-bold">{title}</h2>
          </div>
        </Card>
      ))}
    </div>
  );
};
