import { verifyToken } from "@/lib/auth";
import { success, error } from "@/lib/response";

export async function GET(req: Request) {
    const auth = req.headers.get("authorization");

    if (!auth) return error("Missing auth header", 401);

    const token = auth.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) return error("Invalid token", 401);

    return success(decoded);
}
