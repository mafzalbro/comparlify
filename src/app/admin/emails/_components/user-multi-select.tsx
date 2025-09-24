'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { User } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserMultiSelectProps {
  allUsers: User[];
  selectedUsers: string[];
  onSelectedUsersChange: (selected: string[]) => void;
}

export function UserMultiSelect({
  allUsers,
  selectedUsers,
  onSelectedUsersChange,
}: UserMultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleToggle = (userId: string) => {
    onSelectedUsersChange(
      selectedUsers.includes(userId)
        ? selectedUsers.filter((id) => id !== userId)
        : [...selectedUsers, userId]
    );
  };

  const handleRemove = (userId: string) => {
    onSelectedUsersChange(selectedUsers.filter((id) => id !== userId));
  };
  
  const selectedUserDetails = allUsers.filter(user => selectedUsers.includes(user.id));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10"
          >
            <span className="flex flex-wrap gap-1">
                {selectedUserDetails.length > 0 ? (
                     selectedUserDetails.map(user => (
                        <Badge key={user.id} variant="secondary" className="gap-1 pr-1">
                            {user.name}
                            <button
                                onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(user.id);
                                }}
                                className="rounded-full bg-muted-foreground/20 p-0.5 hover:bg-muted-foreground/40"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                     ))
                ) : (
                    'Select users to exclude...'
                )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Search users..." />
              <CommandEmpty>No user found.</CommandEmpty>
              <CommandList>
                <ScrollArea className="h-64">
                    <CommandGroup>
                        {allUsers.map((user) => (
                        <CommandItem
                            key={user.id}
                            value={user.name || user.email || ''}
                            onSelect={() => {
                              handleToggle(user.id);
                            }}
                        >
                            <Check
                            className={cn(
                                'mr-2 h-4 w-4',
                                selectedUsers.includes(user.id) ? 'opacity-100' : 'opacity-0'
                            )}
                            />
                            {user.name} ({user.email})
                        </CommandItem>
                        ))}
                    </CommandGroup>
                </ScrollArea>
              </CommandList>
            </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
