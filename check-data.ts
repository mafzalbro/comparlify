import prisma from "./src/lib/prisma";

async function main() {
  const content = await prisma.siteContent.findMany();
  console.log(JSON.stringify(content, null, 2));
}

main();
