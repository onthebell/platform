import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getAuthenticatedUser } from '@/lib/utils/auth';
import {
  getAddressVerificationRequests,
  updateVerificationStatus,
  deleteVerificationDocument,
} from '@/lib/firebase/verification';
import { isAdmin } from '@/lib/admin';
import { createNotification } from '@/lib/firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    console.log('User:', user);

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await getAddressVerificationRequests();
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching verification requests:', error);
    return NextResponse.json({ error: 'Failed to fetch verification requests' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId, status, adminNotes } = await request.json();

    if (!requestId || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Update verification status
    await updateVerificationStatus(requestId, status, user.email, adminNotes);

    // Get the verification request to send notification
    const requests = await getAddressVerificationRequests();
    const verificationRequest = requests.find(req => req.id === requestId);

    if (verificationRequest) {
      // Send notification to user
      await createNotification({
        userId: verificationRequest.userId,
        type: 'info',
        title: `Address Verification ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        message:
          status === 'approved'
            ? 'Your address has been verified! You now have full access to OnTheBell community features.'
            : `Your address verification was not approved. ${adminNotes ? `Reason: ${adminNotes}` : 'Please try again or contact support.'}`,
        isRead: false,
      });

      // If approved and it's a document verification, schedule auto-deletion
      if (
        status === 'approved' &&
        verificationRequest.method === 'document' &&
        verificationRequest.proofDocument
      ) {
        try {
          await deleteVerificationDocument(requestId, verificationRequest.proofDocument);

          // Send notification about document deletion
          await createNotification({
            userId: verificationRequest.userId,
            type: 'info',
            title: 'Document Deleted',
            message:
              'Your verification document has been automatically deleted from our servers for your privacy and security.',
            isRead: false,
          });
        } catch (deleteError) {
          console.error('Failed to delete verification document:', deleteError);
          // Don't fail the verification approval if document deletion fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Verification ${status} successfully`,
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    return NextResponse.json({ error: 'Failed to update verification status' }, { status: 500 });
  }
}
