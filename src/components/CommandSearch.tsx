import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useEffect, useState } from 'react';
import { navigate } from 'astro:transitions/client';

export const CommandSearch = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem
            onSelect={() => {
              setOpen(false);
              navigate('/');
            }}
          >
            Home
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              navigate(
                'https://lancastersu.co.uk/groups/magic-and-circus-society-lumacs/join'
              );
            }}
          >
            Join Us
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              navigate('/hire/');
            }}
          >
            Hire Us
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              navigate('/events/');
            }}
          >
            Events
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              navigate('/lucc/');
            }}
          >
            LUCC
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              navigate('/timeline/');
            }}
          >
            Our History
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              navigate('/branding/');
            }}
          >
            Branding
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              navigate('/privacy/');
            }}
          >
            Privacy Policy
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              navigate('/admin/');
            }}
          >
            Admin
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
