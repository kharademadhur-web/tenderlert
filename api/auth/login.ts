import { db } from "../../lib/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "../../lib/hash";
import { generateToken } from "../../lib/auth";
import { success, error } from "../../lib/response";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const found = await db.select()
            .from(users)
            .where(eq(users.email, email));

        if (found.length === 0) return error("User not found", 404);

        if (!found[0].password) return error("Please login with Google", 400);

        const valid = await verifyPassword(password, found[0].password);
        if (!valid) return error("Invalid credentials", 401);

        const token = generateToken({ id: found[0].id, email });

        return success({ token });
    } catch (err) {
        return error("Server error", 500);
    }
}
