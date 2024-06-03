import { useEffect, useRef } from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

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

export const Card = ({ title, img }: { title: string; img: string }) => {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (el.current) {
        const rect = el.current.getBoundingClientRect(),
          x = e.clientX - rect.left,
          y = e.clientY - rect.top;
        el.current.style.setProperty('--mouse-x', x.toString() + 'px');
        el.current.style.setProperty('--mouse-y', y.toString() + 'px');
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="relative bg-border rounded-lg flex flex-col bg-radial-gradient-border items-center justify-center p-[10px]"
      ref={el}
    >
      <div className="bg-background rounded-lg flex flex-col flex-grow items-center justify-center inset-0.5 p-2 absolute z-10 bg-radial-gradient-content">
        <img
          src={img.split('.')[0] + '.webp'}
          alt={`lumacs members displaying ${title}`}
          className="size-40 lg:size-48 rounded"
          width={192}
          height={192}
          loading="eager"
          decoding='async'
        />
        <SeparatorPrimitive.Root className="h-[1px] w-full my-2 bg-border rounded bg-radial-gradient-border" />
        <h2 className="font-bold">{title}</h2>
      </div>
      <div className="size-40 lg:size-48 bg-red-500 invisible" />
      <SeparatorPrimitive.Root className="h-[1px] w-full my-2 bg-border rounded bg-radial-gradient-border invisible" />
      <div className="invisible">{title}</div>
    </div>
  );
};

export const Cards = () => {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 m-4">
      {displays.map((card, index) => (
        <Card key={index} title={card.title} img={card.img} />
      ))}
    </div>
  );
};
