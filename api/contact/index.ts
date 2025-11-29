import { db } from "@/lib/db";
import { contacts } from "@/schema/contacts";
import { success, error } from "@/lib/response";

export async function POST(req: Request) {
    try {
        const { fullName, email, message } = await req.json();

        if (!fullName || !email || !message)
            return error("Missing fields");

        await db.insert(contacts).values({
            fullName,
            email,
            message,
        });

        return success("Message received!");
    } catch (err) {
        return error("Server error", 500);
    }
}
