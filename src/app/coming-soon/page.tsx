'use client';

export default function ComingSoonPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full text-center border border-blue-100">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">OnTheBell is Coming Soon!</h1>
        <p className="text-gray-700 mb-6">
          We're putting the finishing touches on the Bellarine Peninsula's new community platform.
          <br />
          Please check back soon for local events, marketplace, business listings, and more.
        </p>
        <div className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} OnTheBell</div>
      </div>
    </div>
  );
}
