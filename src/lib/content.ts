
import 'server-only';
import { cache } from 'react';
import prisma from './prisma';

export const getContent = cache(async () => {
    const allContent = await prisma.siteContent.findMany();
    const contentMap = allContent.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
    }, {} as Record<string, string>);
    return contentMap;
});
