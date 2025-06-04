import { NextRequest, NextResponse } from 'next/server';
import { verifyPostalCode } from '@/lib/firebase/verification';
import { getAuthenticatedUser } from '@/lib/utils/auth';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { verificationCode } = await request.json();

    if (!verificationCode) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }

    // Verify the postal code
    const result = await verifyPostalCode(user.id, verificationCode);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Address verification successful! You now have "On the Bell" access.',
      });
    } else {
      return NextResponse.json(
        { error: result.message || 'Invalid or expired verification code' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying postal code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
