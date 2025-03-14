import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const WithdrawalRequestsTable = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: withdrawalRequests, refetch, isLoading } = useQuery({
    queryKey: ['withdrawal-requests'],
    queryFn: async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          throw new Error('No active session');
        }

        const { data, error } = await supabase
          .from('withdrawal_requests')
          .select(`
            *,
            translator:translator_id(
              id,
              first_name,
              last_name
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching withdrawal requests:', error);
          throw error;
        }
        return data;
      } catch (error: any) {
        console.error('Error in withdrawal requests query:', error);
        throw error;
      }
    },
    retry: false
  });

  const handleMarkAsCompleted = async (requestId: string, translatorId: string) => {
    try {
      // First check if the request exists and is in pending status
      const { data: request, error: fetchError } = await supabase
        .from('withdrawal_requests')
        .select('status')
        .eq('id', requestId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (request?.status !== 'pending') {
        toast({
          title: "Error",
          description: "This request cannot be marked as completed",
          variant: "destructive"
        });
        return;
      }

      // Update the withdrawal request status
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error marking payment as completed:', updateError);
        toast({
          title: "Error",
          description: updateError.message || "Failed to mark payment as completed",
          variant: "destructive"
        });
        return;
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] });
      queryClient.invalidateQueries({ queryKey: ['translator-balance'] });

      toast({
        title: "Success",
        description: "Payment marked as completed",
      });
      refetch();
    } catch (err: any) {
      console.error('Error in handleMarkAsCompleted:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Translator
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount (R$)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PIX Key
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Requested At
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {withdrawalRequests?.map((request) => (
            <tr key={request.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {request.translator?.first_name} {request.translator?.last_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {request.amount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {request.payment_details?.pix_key}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(request.created_at || ''), 'PPP')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Badge 
                  variant="outline"
                  className={
                    request.status === 'completed' 
                      ? 'bg-green-100 text-green-800 border-green-500'
                      : 'bg-yellow-100 text-yellow-800 border-yellow-500'
                  }
                >
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {request.status === 'pending' && (
                  <Button 
                    onClick={() => handleMarkAsCompleted(request.id, request.translator_id)}
                    variant="default"
                  >
                    Mark as Completed
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WithdrawalRequestsTable;