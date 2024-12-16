import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PendingApplicationMessage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Application Under Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Thank you for applying to be a translator. Your application is currently under review.
              We will notify you once a decision has been made.
            </p>
            <p className="text-muted-foreground">
              This process typically takes 2-3 business days. If you haven't heard back from us
              after this period, please contact our support team.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PendingApplicationMessage;