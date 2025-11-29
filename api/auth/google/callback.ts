import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { parse, serialize } from 'cookie';
import { db } from '../../../lib/db';
import { users } from '../../../schema/users';
import { eq } from 'drizzle-orm';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;

interface GoogleTokenResponse {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
    token_type: string;
    id_token: string;
}

interface GoogleProfile {
    id: string;
    email: string;
    name: string;
    picture: string;
    email_verified: boolean;
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');

        if (!code || !state) {
            return new Response(JSON.stringify({ error: 'Missing code or state parameter' }), { status: 400 });
        }

        // Verify state matches cookie
        const cookieHeader = req.headers.get('cookie') || '';
        const cookies = parse(cookieHeader);
        const cookieState = cookies.oauth_state;

        if (cookieState !== state) {
            return new Response(JSON.stringify({ error: 'State mismatch - possible CSRF attack' }), { status: 403 });
        }

        // Exchange authorization code for tokens
        const tokenResponse = await exchangeCodeForTokens(code);
        const googleProfile = await getGoogleProfile(tokenResponse.access_token);

        // Check if user exists using Drizzle
        const existingUser = await db.select().from(users).where(eq(users.email, googleProfile.email));

        let userId: string;
        let userEmail: string;
        let userName: string;

        if (existingUser.length > 0) {
            // Update existing user with Google ID and avatar
            await db.update(users)
                .set({
                    googleId: googleProfile.id,
                    avatarUrl: googleProfile.picture,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, existingUser[0].id));

            userId = existingUser[0].id;
            userEmail = existingUser[0].email;
            userName = existingUser[0].fullName;
        } else {
            // Create new user from Google profile
            const newUser = await db.insert(users).values({
                email: googleProfile.email,
                fullName: googleProfile.name,
                googleId: googleProfile.id,
                avatarUrl: googleProfile.picture,
                password: null, // OAuth users don't have passwords
            }).returning();

            userId = newUser[0].id;
            userEmail = newUser[0].email;
            userName = newUser[0].fullName;
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            {
                id: userId, // Changed to 'id' to match login.ts payload
                email: userEmail,
                googleId: googleProfile.id,
                name: userName,
            },
            JWT_SECRET!,
            { expiresIn: '7d' }
        );

        // Create redirect URL with token
        const redirectUrl = new URL('/login', 'https://tenderlert.vercel.app'); // Base URL is required for URL constructor
        redirectUrl.searchParams.append('token', jwtToken);

        // Create response
        const response = new Response(null, {
            status: 302,
            headers: {
                Location: redirectUrl.toString(),
            },
        });

        // Clear state cookie
        response.headers.append('Set-Cookie', serialize('oauth_state', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: -1,
            path: '/',
        }));

        return response;
    } catch (error) {
        console.error('OAuth callback error:', error);

        const errorUrl = new URL('/login', 'https://tenderlert.vercel.app');
        errorUrl.searchParams.append('error', error instanceof Error ? error.message : 'Authentication failed');

        return new Response(null, {
            status: 302,
            headers: {
                Location: errorUrl.toString(),
            },
        });
    }
}

async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID!,
            client_secret: GOOGLE_CLIENT_SECRET!,
            redirect_uri: GOOGLE_REDIRECT_URI!,
            grant_type: 'authorization_code',
        }).toString(),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to exchange code for tokens: ${error}`);
    }

    return response.json();
}

async function getGoogleProfile(accessToken: string): Promise<GoogleProfile> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch Google profile');
    }

    return response.json();
}
