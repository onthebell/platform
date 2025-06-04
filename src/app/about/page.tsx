// About page for OnTheBell community platform
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - OnTheBell',
  description:
    'Learn about OnTheBell, the community platform for residents of the Bellarine Peninsula',
};

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-4 sm:py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
            About OnTheBell
          </h1>

          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
            <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed">
              OnTheBell is a community platform designed specifically for residents of the beautiful
              Bellarine Peninsula in Victoria, Australia. Our mission is to connect neighbors,
              support local businesses, and strengthen the bonds that make our community special.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              Our Story
            </h2>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
              Founded by locals who are passionate about the Bellarine Peninsula, OnTheBell was
              created to address the need for a centralized platform where residents can connect,
              share information, and support each other. We believe that strong communities are
              built on meaningful connections and mutual support.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              What We Offer
            </h2>
            <ul className="list-disc pl-4 sm:pl-6 text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 space-y-2">
              <li>Community discussions and help requests</li>
              <li>Local business directory and reviews</li>
              <li>Events calendar for community activities</li>
              <li>Marketplace for buying, selling, and giving away items</li>
              <li>Verified resident access to exclusive community features</li>
              <li>Location-based services and information</li>
            </ul>

            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  Community First
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Every decision we make is guided by what's best for our community members and the
                  Bellarine Peninsula as a whole.
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Local Focus</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  We're built by locals for locals, ensuring our platform meets the unique needs of
                  Bellarine Peninsula residents.
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  Safety & Trust
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Through address verification and community moderation, we maintain a safe and
                  trustworthy environment for all members.
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Accessibility</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  We believe community connection should be available to everyone, which is why
                  OnTheBell is free to use for all residents.
                </p>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              Get Involved
            </h2>
            <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">
              Ready to join the OnTheBell community? Here's how you can get started:
            </p>
            <ol className="list-decimal pl-4 sm:pl-6 text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 space-y-2">
              <li>Sign up for your free account</li>
              <li>Verify your Bellarine Peninsula address for full access</li>
              <li>Complete your profile and introduce yourself</li>
              <li>Start connecting with your neighbors and local businesses</li>
            </ol>

            <div className="bg-blue-50 p-4 sm:p-6 rounded-lg mt-6 sm:mt-8">
              <h3 className="text-lg sm:text-xl font-medium text-blue-900 mb-2">
                Questions or Feedback?
              </h3>
              <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                We'd love to hear from you! Whether you have questions about using the platform,
                feedback on how we can improve, or ideas for new features, please don't hesitate to
                reach out to us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
