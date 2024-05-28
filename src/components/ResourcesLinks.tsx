import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar';

export const ResourcesLinks = () => {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Resources</MenubarTrigger>
        <MenubarContent>
          <MenubarItem asChild>
            <a href="/gallery/">Gallery</a>
          </MenubarItem>
          <MenubarItem asChild>
            <a href="/hire/">Hire Us</a>
          </MenubarItem>
          <MenubarItem asChild>
            <a href="/conventions/">Conventions</a>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem asChild>
            <a href="/privacy/">Privacy Policy</a>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
