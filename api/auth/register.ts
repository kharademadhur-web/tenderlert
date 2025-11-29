import { db } from "@/lib/db";
import { users } from "@/schema/users";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/hash";
import { success, error } from "@/lib/response";

export async function POST(req: Request) {
    try {
        const { fullName, email, password } = await req.json();

        if (!fullName || !email || !password) {
            return error("Missing required fields");
        }

        const existing = await db.select()
            .from(users)
            .where(eq(users.email, email));

        if (existing.length > 0) {
            return error("Email already in use", 409);
        }

        const hashed = await hashPassword(password);

        await db.insert(users).values({
            fullName,
            email,
            password: hashed
        });

        return success("User registered successfully");
    } catch (err) {
        return error("Server error", 500);
    }
}
