// Privacy Policy page for OnTheBell
import { Metadata } from 'next';
import { ShieldCheckIcon, EyeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { ServerStackIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Privacy Policy - OnTheBell',
  description: 'Privacy policy and data protection information for OnTheBell users',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <ShieldCheckIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-700">
              Your privacy is important to us. This policy explains how we collect, use, and protect
              your information.
            </p>
            <p className="text-sm text-gray-600 mt-2">Effective Date: May 28, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <ServerStackIcon className="h-6 w-6 mr-2" />
              Information We Collect
            </h2>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Account Information</h3>
            <p className="text-gray-700 mb-4">When you create an account, we collect:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
              <li>Email address</li>
              <li>Display name</li>
              <li>Profile photo (optional)</li>
              <li>Address for verification (Bellarine Peninsula residents only)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Content You Share</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
              <li>Posts, comments, and messages you create</li>
              <li>Images and files you upload</li>
              <li>Business information (if you create a business profile)</li>
              <li>Reviews and ratings you provide</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Technical Information</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
              <li>IP address and location data</li>
              <li>Device and browser information</li>
              <li>Usage patterns and interactions</li>
              <li>Cookies and similar technologies</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <EyeIcon className="h-6 w-6 mr-2" />
              How We Use Your Information
            </h2>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Core Platform Functions</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
              <li>Creating and maintaining your account</li>
              <li>Displaying your content to other community members</li>
              <li>Facilitating communication between users</li>
              <li>Providing location-based features and content</li>
              <li>Verifying Bellarine Peninsula residency</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Safety and Security</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
              <li>Preventing fraud and abuse</li>
              <li>Monitoring for community guideline violations</li>
              <li>Investigating reports and complaints</li>
              <li>Protecting against spam and malicious activity</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Platform Improvement</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
              <li>Analyzing usage patterns to improve features</li>
              <li>Understanding community needs and preferences</li>
              <li>Testing new features and functionality</li>
              <li>Ensuring optimal platform performance</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <GlobeAltIcon className="h-6 w-6 mr-2" />
              Information Sharing and Disclosure
            </h2>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-green-900 font-semibold mb-2">What We DON'T Do</h3>
              <ul className="list-disc pl-6 text-green-800 space-y-1">
                <li>We don't sell your personal information to third parties</li>
                <li>We don't use your data for advertising targeting</li>
                <li>We don't share your exact address publicly</li>
                <li>We don't provide data to data brokers or marketers</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">
              When We May Share Information
            </h3>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li>
                <strong>With Your Consent:</strong> When you explicitly agree to share information
              </li>
              <li>
                <strong>Public Content:</strong> Posts and comments you choose to make public
              </li>
              <li>
                <strong>Service Providers:</strong> Third-party services that help us operate the
                platform (hosting, email, etc.)
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to protect safety
              </li>
              <li>
                <strong>Business Transfers:</strong> In the event of a merger or acquisition (with
                user notification)
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Address Verification and Location Data
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-blue-900 font-semibold mb-2">Address Verification Process</h3>
              <ul className="list-disc pl-6 text-blue-800 space-y-1">
                <li>
                  We verify you live within Bellarine Peninsula postcodes (3222, 3223, 3225, 3226,
                  3227)
                </li>
                <li>Your exact address is never displayed publicly</li>
                <li>We only confirm you're a verified local resident</li>
                <li>Address data is stored securely and encrypted</li>
                <li>Location data is used only for community features and content filtering</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Data Security and Protection
            </h2>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li>All data is encrypted in transit and at rest</li>
              <li>We use industry-standard security measures</li>
              <li>Regular security audits and updates</li>
              <li>Limited access to personal data by authorized personnel only</li>
              <li>Secure backup and disaster recovery procedures</li>
              <li>Two-factor authentication available for accounts</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights and Choices</h2>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Account Control</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
              <li>Update your profile information at any time</li>
              <li>Control who can see your posts and information</li>
              <li>Delete posts and comments you've created</li>
              <li>Deactivate or delete your account</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Privacy Controls</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
              <li>Choose what information appears in your profile</li>
              <li>Control notification preferences</li>
              <li>Manage location sharing settings</li>
              <li>Block or report other users</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Data Requests</h3>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
              <li>Request a copy of your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Object to certain uses of your data</li>
              <li>Request data portability</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">We use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-1">
              <li>Keep you logged in to your account</li>
              <li>Remember your preferences and settings</li>
              <li>Analyze platform usage and performance</li>
              <li>Prevent fraud and improve security</li>
            </ul>
            <p className="text-gray-700 mb-6">
              You can control cookie settings through your browser, though some features may not
              work properly if cookies are disabled.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li>Account information: Retained while your account is active</li>
              <li>Posts and content: Retained until you delete them or deactivate your account</li>
              <li>Technical logs: Typically retained for 90 days for security purposes</li>
              <li>Address verification: Retained for verification purposes only</li>
              <li>
                Deleted accounts: Most data deleted within 30 days (some may be retained for legal
                compliance)
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 mb-6">
              OnTheBell is not intended for children under 13 years of age. We do not knowingly
              collect personal information from children under 13. If we become aware that a child
              under 13 has provided us with personal information, we will delete such information
              promptly.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">International Users</h2>
            <p className="text-gray-700 mb-6">
              OnTheBell is operated from Australia and is intended primarily for Australian
              residents. If you're accessing the platform from outside Australia, please be aware
              that your information may be transferred to and processed in Australia.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update this privacy policy from time to time. We will notify users of
              significant changes through the platform or via email. Your continued use of OnTheBell
              after changes are posted constitutes acceptance of the updated policy.
            </p>

            <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 mt-8">
              <h3 className="text-xl font-medium text-gray-900 mb-4">Contact Us</h3>
              <p className="text-gray-700 mb-4">
                If you have questions about this privacy policy or how we handle your information,
                please contact us:
              </p>
              <ul className="text-gray-700 space-y-1">
                <li>Email: privacy@onthebell.com.au</li>
                <li>
                  Through our contact form:{' '}
                  <a href="/contact" className="text-blue-600 hover:underline">
                    /contact
                  </a>
                </li>
                <li>
                  Address: OnTheBell Community Platform, Bellarine Peninsula, Victoria, Australia
                </li>
              </ul>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-gray-600">
                This privacy policy was last updated on May 28, 2025.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
