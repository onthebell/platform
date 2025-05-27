import { Metadata } from 'next';
import BusinessForm from '@/components/business/BusinessForm';

export const metadata: Metadata = {
  title: 'Add Your Business | OnTheBell',
  description: 'Add your business to the Bellarine Peninsula business directory.',
};

export default function AddBusinessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Your Business</h1>
          <p className="mt-2 text-gray-600">
            Join the Bellarine Peninsula business directory and connect with local customers.
            Your listing will be reviewed before going live.
          </p>
        </div>

        <BusinessForm />
      </div>
    </div>
  );
}
