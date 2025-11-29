export function success(data: any) {
    return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

export function error(message: string, status = 400) {
    return new Response(JSON.stringify({ success: false, message }), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}
