
'use client';

import * as React from 'react';
import { ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { User } from '@prisma/client';

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
  const [search, setSearch] = React.useState('');
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

  const selectedUserDetails = allUsers.filter((user) =>
    selectedUsers.includes(user.id)
  );

  const filteredUsers = allUsers.filter((user) => {
    const query = search.toLowerCase();
    return (
      user?.name?.toLowerCase().includes(query) ||
      user?.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10"
          >
            <div className="flex flex-wrap gap-1 items-center">
              {selectedUserDetails.length > 0 ? (
                selectedUserDetails.map((user) => (
                  <Badge
                    key={user.id}
                    variant="secondary"
                    className="gap-1 pr-1"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent opening dropdown
                      handleRemove(user.id);
                    }}
                  >
                    {user.name}
                    <X className="h-3 w-3" />
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">Select users to exclude...</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] p-2">
          {/* Search Input */}
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
            autoFocus
          />

          {/* User list with checkboxes */}
          <ScrollArea className="h-64 pr-2">
            <div className="space-y-1">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <DropdownMenuCheckboxItem
                    key={user.id}
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => handleToggle(user.id)}
                    onSelect={(e) => e.preventDefault()} // prevent closing on select
                  >
                    {user.name} ({user.email})
                  </DropdownMenuCheckboxItem>
                ))
              ) : (
                <div className="px-2 py-1 text-sm text-muted-foreground">No users found.</div>
              )}
            </div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
