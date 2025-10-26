
import { Home, Settings, Table, PenSquare, BookText, GitCompareArrows, Users, Globe, Send, MessageCircle, Mail, Newspaper, MessageSquare, Gavel, ImageIcon, Wand2 } from "lucide-react";
import { type Role } from "@prisma/client";

type NavItem = {
    href: string;
    label: string;
    Icon: React.ElementType;
    roles: Role[];
};

type NavGroup = {
    group: string;
    items: NavItem[];
};

export const navConfig: NavGroup[] = [
    {
        group: "Overview",
        items: [
            { href: "/admin", label: "Dashboard", Icon: Home, roles: ['ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR', 'SUPPORT'] },
        ]
    },
    {
        group: "Content Management",
        items: [
            { href: "/admin/content", label: "Site Content", Icon: Globe, roles: ['ADMIN', 'EDITOR'] },
            { href: "/admin/blog", label: "Blog", Icon: BookText, roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
            { href: "/admin/comparisons", label: "Comparisons", Icon: GitCompareArrows, roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
            { href: "/admin/news", label: "News", Icon: Newspaper, roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
            { href: "/admin/community", label: "Community", Icon: MessageSquare, roles: ['ADMIN', 'EDITOR', 'MODERATOR'] },
            { href: "/admin/media", label: "Media", Icon: ImageIcon, roles: ['ADMIN', 'EDITOR', 'AUTHOR'] },
            { href: "/admin/tools", label: "Tools", Icon: Wand2, roles: ['ADMIN'] },
            { href: "/admin/legal", label: "Legal", Icon: Gavel, roles: ['ADMIN'] },
        ]
    },
    {
        group: "Data Management",
        items: [
            { href: "/admin/platforms", label: "Platforms", Icon: Table, roles: ['ADMIN', 'EDITOR'] },
            { href: "/admin/features", label: "Features", Icon: PenSquare, roles: ['ADMIN', 'EDITOR'] },
        ]
    },
    {
        group: "Communication",
        items: [
            { href: "/admin/emails", label: "Emails", Icon: Send, roles: ['ADMIN'] },
            { href: "/admin/comments", label: "Comments", Icon: MessageCircle, roles: ['ADMIN', 'MODERATOR'] },
            { href: "/admin/contacts", label: "Contacts", Icon: Mail, roles: ['ADMIN', 'SUPPORT'] },
        ]
    },
    {
        group: "Administration",
        items: [
            { href: "/admin/users", label: "Users", Icon: Users, roles: ['ADMIN'] },
            { href: "/admin/settings", label: "Settings", Icon: Settings, roles: ['ADMIN'] },
        ]
    }
];
