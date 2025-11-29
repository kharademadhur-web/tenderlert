import { serialize } from 'cookie';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export async function GET(req: Request) {
    try {
        // Generate random state for CSRF protection
        const state = crypto.randomUUID();

        // Build Google OAuth URL
        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID!,
            redirect_uri: GOOGLE_REDIRECT_URI!,
            response_type: 'code',
            scope: 'openid profile email',
            state: state,
            access_type: 'offline',
            prompt: 'consent',
        });

        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

        // Create response with redirect
        const response = new Response(null, {
            status: 302,
            headers: {
                Location: googleAuthUrl,
            },
        });

        // Store state in secure cookie for verification
        response.headers.append('Set-Cookie', serialize('oauth_state', state, {
            httpOnly: true,
            secure: true, // Always true in production (Vercel)
            sameSite: 'lax',
            maxAge: 600, // 10 minutes
            path: '/',
        }));

        return response;
    } catch (error) {
        console.error('Google redirect error:', error);
        return new Response(JSON.stringify({ error: 'Failed to initiate Google OAuth' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
