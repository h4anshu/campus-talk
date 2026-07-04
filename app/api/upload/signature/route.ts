import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getSessionOrThrow, handleApiError, ApiError } from '@/lib/api-helpers';
import { isAdminSession } from '@/lib/admin-auth';

// The API secret never leaves the server — the browser gets back a signature
// for these exact params, uploads straight to Cloudinary itself, and Cloudinary
// verifies the signature matches before accepting the file. Used by both the
// student composer (real session) and the admin announcement composer
// (admin_session cookie, no student account) — same upload path either way.
export async function POST() {
  try {
    if (!(await isAdminSession())) {
      await getSessionOrThrow();
    }

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!apiSecret || !apiKey || !cloudName) {
      throw new ApiError('Image upload is not configured', 500);
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'campusvoice';
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret);

    return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder });
  } catch (error) {
    return handleApiError(error);
  }
}
