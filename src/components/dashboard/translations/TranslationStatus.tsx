import { Badge } from "@/components/ui/badge";

interface TranslationStatusProps {
  status: string;
  wordCount: number;
  adminReviewStatus?: string;
}

export const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending Translation',
        className: 'bg-blue-100 text-blue-800'
      };
    case 'pending_review':
      return {
        label: 'Under Review',
        className: 'bg-purple-100 text-purple-800'
      };
    case 'completed':
      return {
        label: 'Completed',
        className: 'bg-green-100 text-green-800'
      };
    default:
      return {
        label: status,
        className: 'bg-gray-100 text-gray-800'
      };
  }
};

const TranslationStatus = ({ status, wordCount, adminReviewStatus }: TranslationStatusProps) => {
  const statusDisplay = getStatusDisplay(status);

  return (
    <div className="text-right ml-4">
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusDisplay.className}`}>
        {statusDisplay.label}
      </span>
      <p className="text-sm text-muted-foreground mt-1">
        {wordCount} words
      </p>
      {adminReviewStatus && (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-2 ${
          adminReviewStatus === 'approved' 
            ? 'bg-green-100 text-green-800'
            : adminReviewStatus === 'rejected'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {adminReviewStatus}
        </span>
      )}
    </div>
  );
};

export default TranslationStatus;