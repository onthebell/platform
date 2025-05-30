import ReportButton from '@/components/moderation/ReportButton';

export default function ExamplePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Content with Report Button Example</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <h2 className="text-lg font-semibold mb-2">Sample Community Post</h2>
        <p className="text-gray-600 mb-4">
          This is an example of how the report button would appear on community posts. Users can
          click the flag icon to report inappropriate content.
        </p>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Posted by John Doe • 2 hours ago</span>
          <ReportButton
            contentType="post"
            contentId="example-post-123"
            contentAuthorId="user-456"
            size="sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-2">Sample Comment</h2>
        <p className="text-gray-600 mb-4">
          This is an example comment that can also be reported if inappropriate.
        </p>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">By Jane Smith • 1 hour ago</span>
          <ReportButton
            contentType="comment"
            contentId="example-comment-789"
            contentAuthorId="user-101"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
