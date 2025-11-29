import { verifyToken } from "@/lib/auth";
import { success, error } from "@/lib/response";

export async function GET(req: Request) {
    const header = req.headers.get("authorization");
    if (!header) return error("Missing Authorization header", 401);

    const token = header.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) return error("Invalid or expired token", 401);

    return success(decoded);
}
