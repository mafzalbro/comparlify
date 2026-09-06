import prisma from "../src/lib/prisma";

async function fix() {
  const posts = await prisma.post.findMany({ select: { id: true } });
  for (const p of posts) {
    await (prisma as any).$runCommandRaw({
      update: "Post",
      updates: [
        {
          q: { _id: p.id },
          u: { $unset: { previousId: "", nextId: "" } }
        }
      ]
    });
  }
  console.log("✅ Fixed post navigation fields");
}

fix().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
