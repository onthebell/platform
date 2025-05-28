// Community Guidelines page for OnTheBell
import { Metadata } from 'next';
import { 
  HeartIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Community Guidelines - OnTheBell',
  description: 'Community guidelines and rules for using OnTheBell safely and respectfully',
};

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <HeartIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Community Guidelines</h1>
            <p className="text-lg text-gray-700">
              Creating a safe, welcoming, and respectful community for all Bellarine Peninsula residents
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <HeartIcon className="h-6 w-6 mr-2" />
              Our Community Values
            </h2>
            <p className="text-gray-700 mb-6">
              OnTheBell is built on the principle that strong communities are founded on mutual respect, 
              kindness, and support. We expect all members to contribute to a positive environment where 
              everyone feels welcome and valued.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <ShieldCheckIcon className="h-6 w-6 mr-2" />
              Community Rules
            </h2>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">✅ Do:</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li>Be respectful and kind in all interactions</li>
              <li>Help your neighbors when you can</li>
              <li>Share accurate and helpful information</li>
              <li>Respect privacy and personal boundaries</li>
              <li>Use appropriate language suitable for all ages</li>
              <li>Report problems through proper channels</li>
              <li>Follow Australian laws and local regulations</li>
              <li>Verify information before sharing</li>
              <li>Give constructive feedback and criticism</li>
              <li>Welcome new community members</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">❌ Don't:</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li>Post content that is offensive, discriminatory, or hateful</li>
              <li>Share personal information without consent</li>
              <li>Engage in harassment, bullying, or threatening behavior</li>
              <li>Post spam, advertisements, or promotional content without permission</li>
              <li>Share false, misleading, or unverified information</li>
              <li>Use the platform for illegal activities</li>
              <li>Create multiple accounts or impersonate others</li>
              <li>Post content that violates intellectual property rights</li>
              <li>Share inappropriate images or content</li>
              <li>Engage in political campaigning or partisan activities</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
              Content Guidelines
            </h2>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Acceptable Content</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li>Community discussions and questions</li>
              <li>Local recommendations and reviews</li>
              <li>Event announcements and community activities</li>
              <li>Items for sale, wanted, or free (marketplace)</li>
              <li>Requests for help or services</li>
              <li>Local news and information (verified)</li>
              <li>Business information and updates</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Prohibited Content</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <ul className="list-disc pl-6 text-red-800 space-y-2">
                <li>Adult content or sexually explicit material</li>
                <li>Content promoting violence or illegal activities</li>
                <li>Discriminatory content based on race, religion, gender, or other protected characteristics</li>
                <li>Personal attacks, doxxing, or privacy violations</li>
                <li>Misinformation or deliberately false content</li>
                <li>Commercial spam or unauthorized advertising</li>
                <li>Content that violates copyright or intellectual property</li>
                <li>Dangerous or harmful advice</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <HandRaisedIcon className="h-6 w-6 mr-2" />
              Reporting and Moderation
            </h2>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">How to Report</h3>
            <p className="text-gray-700 mb-4">
              If you see content that violates these guidelines, please report it using the report button 
              available on all posts and comments. You can also contact our moderation team directly.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Moderation Process</h3>
            <ol className="list-decimal pl-6 text-gray-700 mb-6 space-y-2">
              <li>Reports are reviewed by our volunteer moderation team</li>
              <li>Content is evaluated against these guidelines</li>
              <li>Appropriate action is taken (warning, content removal, etc.)</li>
              <li>Users are notified of moderation decisions</li>
              <li>Appeals can be submitted for contested decisions</li>
            </ol>

            <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Consequences</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <p className="text-yellow-800 mb-4">
                Violations of community guidelines may result in:
              </p>
              <ul className="list-disc pl-6 text-yellow-800 space-y-1">
                <li>Warning and content removal</li>
                <li>Temporary restriction of posting privileges</li>
                <li>Temporary suspension from the platform</li>
                <li>Permanent ban for serious or repeated violations</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Business and Commercial Activity
            </h2>
            <p className="text-gray-700 mb-4">
              Local businesses are welcome on OnTheBell and can:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li>Create business profiles with contact information</li>
              <li>Share updates and announcements</li>
              <li>Respond to customer reviews and feedback</li>
              <li>Participate in community discussions as community members</li>
            </ul>
            <p className="text-gray-700 mb-6">
              However, excessive promotional posting or spam-like behavior will be moderated. 
              Businesses should focus on providing value to the community rather than purely promotional content.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Privacy and Safety
            </h2>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li>Never share your full address publicly</li>
              <li>Use caution when meeting people from online interactions</li>
              <li>Report suspicious or concerning behavior immediately</li>
              <li>Keep personal information private in public discussions</li>
              <li>Use the platform's messaging features for sensitive communications</li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="text-xl font-medium text-blue-900 mb-2">
                Questions About These Guidelines?
              </h3>
              <p className="text-blue-800">
                If you have questions about our community guidelines or need clarification about 
                what's acceptable, please don't hesitate to contact our moderation team. We're 
                here to help ensure OnTheBell remains a positive space for everyone.
              </p>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-gray-600">
                These guidelines may be updated periodically. We'll notify the community of any significant changes.
                <br />
                Last updated: May 28, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
