import { Metadata } from 'next'
import { DocumentTextIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Terms of Service | OnTheBell',
  description: 'Terms of Service for OnTheBell community platform',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-8">
            <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Last updated: May 28, 2025
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
              <div className="flex">
                <ShieldCheckIcon className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                <p className="text-blue-700">
                  By using OnTheBell, you agree to these terms. Please read them carefully.
                </p>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing or using OnTheBell ("the Platform"), you agree to be bound by these Terms of Service 
                and all applicable laws and regulations. If you do not agree with any of these terms, you are 
                prohibited from using or accessing this site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Platform Description</h2>
              <p className="text-gray-700 mb-4">
                OnTheBell is a community platform designed specifically for residents of the Bellarine Peninsula, 
                Victoria, Australia. The platform provides:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Local business directory and deals</li>
                <li>Community events calendar</li>
                <li>Marketplace for buying, selling, and sharing items</li>
                <li>Community discussion and connection features</li>
                <li>Neighborhood support and assistance requests</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Eligibility and Verification</h2>
              <p className="text-gray-700 mb-4">
                To access full platform features ("On the Bell" status), users must:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Be 18 years of age or older</li>
                <li>Provide a valid street address within the Bellarine Peninsula</li>
                <li>Complete our address verification process</li>
                <li>Maintain accurate and up-to-date account information</li>
              </ul>
              <p className="text-gray-700 mb-4">
                General access is available to all users, with limited functionality for non-verified accounts.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Conduct and Community Guidelines</h2>
              <p className="text-gray-700 mb-4">
                Users agree to conduct themselves in accordance with our 
                <a href="/community-guidelines" className="text-blue-600 hover:text-blue-800"> Community Guidelines</a>. 
                Prohibited activities include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Posting false, misleading, or fraudulent content</li>
                <li>Harassment, bullying, or discriminatory behavior</li>
                <li>Spam, excessive self-promotion, or commercial solicitation</li>
                <li>Sharing inappropriate, offensive, or illegal content</li>
                <li>Violating others' privacy or intellectual property rights</li>
                <li>Attempting to circumvent platform security measures</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content and Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                Users retain ownership of content they post but grant OnTheBell a non-exclusive, worldwide, 
                royalty-free license to use, display, and distribute such content on the platform.
              </p>
              <p className="text-gray-700 mb-4">
                OnTheBell respects intellectual property rights and will respond to valid copyright infringement 
                notices in accordance with applicable law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Marketplace and Transactions</h2>
              <p className="text-gray-700 mb-4">
                OnTheBell facilitates connections between users but is not a party to any transactions. Users are 
                responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Accurately describing items for sale or trade</li>
                <li>Meeting safety guidelines for in-person exchanges</li>
                <li>Resolving disputes directly with other parties</li>
                <li>Complying with all applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please review our 
                <a href="/privacy" className="text-blue-600 hover:text-blue-800"> Privacy Policy</a> to understand 
                how we collect, use, and protect your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Platform Availability and Modifications</h2>
              <p className="text-gray-700 mb-4">
                OnTheBell reserves the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Modify, suspend, or discontinue any part of the platform</li>
                <li>Update these terms with reasonable notice</li>
                <li>Remove content that violates our guidelines</li>
                <li>Suspend or terminate user accounts for violations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers and Limitation of Liability</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                  <p className="text-yellow-700">
                    The platform is provided "as is" without warranties of any kind.
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                OnTheBell shall not be liable for any direct, indirect, incidental, special, or consequential 
                damages resulting from platform use, including but not limited to marketplace transactions, 
                user interactions, or technical issues.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These terms are governed by the laws of Victoria, Australia. Any disputes will be resolved 
                in the courts of Victoria.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these terms, please contact us through our 
                <a href="/contact" className="text-blue-600 hover:text-blue-800"> Contact page</a>.
              </p>
            </section>

            <div className="bg-gray-50 rounded-lg p-6 mt-8">
              <p className="text-sm text-gray-600">
                These Terms of Service were last updated on May 28, 2025. We may update these terms from 
                time to time, and will notify users of significant changes through the platform or email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
