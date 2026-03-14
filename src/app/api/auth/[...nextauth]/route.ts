import { handlers } from "@/lib/auth";

const check = handlers ?? {};
export const GET = check?.GET;
export const POST = check?.POST;
