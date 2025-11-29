import { db } from "@/lib/db";
import { users } from "@/schema/users";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/hash";
import { generateToken } from "@/lib/auth";
import { success, error } from "@/lib/response";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const existing = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

        if (existing.length === 0)
            return error("User not found");

        const valid = await verifyPassword(password, existing[0].password);

        if (!valid)
            return error("Invalid credentials");

        const token = generateToken({
            id: existing[0].id,
            email,
        });

        return success({ token });
    } catch {
        return error("Server error", 500);
    }
}
