import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const locations: {
  name: string;
  href: string;
}[] = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'Hire Us',
    href: '/hire/',
  },
  {
    name: 'Events',
    href: '/events/',
  },
  {
    name: 'LUCC',
    href: '/lucc/',
  },
  {
    name: 'Our History',
    href: '/timeline/',
  },
  {
    name: 'Branding',
    href: '/branding/',
  },
  // {
  //   name: 'Gallery',
  //   href: '/gallery/',
  // },
];

export const HamburgerMenu = () => {
  return (
    <Sheet>
      <SheetTrigger>
        <Button variant="outline" size="icon">
          <Menu />
          <span className="sr-only">Toggle navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 pt-2">
          {locations.map(({ name, href }) => (
            <a
              href={href}
              className="underline hover:text-muted-foreground w-min whitespace-nowrap"
            >
              {name}
            </a>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
