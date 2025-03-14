import { Badge } from "@/components/ui/badge";

interface TranslationStatusProps {
  status: string;
  wordCount: number;
  adminReviewStatus?: string;
}

export const getStatusDisplay = (status: string, adminReviewStatus?: string) => {
  // If the translation is under admin review and has been approved, show as completed
  if (status === 'pending_admin_review' && adminReviewStatus === 'approved') {
    return {
      label: 'Completed',
      className: 'bg-green-500 text-white'
    };
  }

  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        className: 'bg-green-500 text-white'
      };
    case 'pending_admin_review':
      return {
        label: 'Under Admin Review',
        className: 'bg-purple-500 text-white'
      };
    case 'in_progress':
      return {
        label: 'In Progress',
        className: 'bg-yellow-500 text-white'
      };
    case 'pending':
      return {
        label: 'Pending',
        className: 'bg-blue-500 text-white'
      };
    case 'pending_review':
      return {
        label: 'Pending Review',
        className: 'bg-blue-500 text-white'
      };
    default:
      return {
        label: 'Pending',
        className: 'bg-blue-500 text-white'
      };
  }
};

const TranslationStatus = ({ status, wordCount, adminReviewStatus }: TranslationStatusProps) => {
  const statusDisplay = getStatusDisplay(status, adminReviewStatus);

  return (
    <div className="flex flex-col items-end gap-2">
      <Badge variant="secondary" className={`${statusDisplay.className}`}>
        {statusDisplay.label}
      </Badge>
      <span className="text-sm text-muted-foreground">
        {wordCount.toLocaleString()} words
      </span>
      {adminReviewStatus && (
        <Badge variant="outline" className={
          adminReviewStatus === 'approved' 
            ? 'border-green-500 text-green-700'
            : adminReviewStatus === 'rejected'
            ? 'border-red-500 text-red-700'
            : 'border-yellow-500 text-yellow-700'
        }>
          {adminReviewStatus.charAt(0).toUpperCase() + adminReviewStatus.slice(1)}
        </Badge>
      )}
    </div>
  );
};

export default TranslationStatus;