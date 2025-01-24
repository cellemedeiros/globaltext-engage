import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const WithdrawalRequestsTable = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

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
              last_name,
              email
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching withdrawal requests:', error);
          if (error.message?.includes('refresh_token_not_found')) {
            await supabase.auth.signOut();
            navigate('/?signin=true');
            throw new Error('Session expired. Please sign in again.');
          }
          throw error;
        }
        return data;
      } catch (error: any) {
        console.error('Error in withdrawal requests query:', error);
        if (error.message?.includes('No active session') || 
            error.message?.includes('refresh_token_not_found')) {
          await supabase.auth.signOut();
          navigate('/?signin=true');
          throw new Error('Session expired. Please sign in again.');
        }
        throw error;
      }
    },
    retry: false
  });

  const handleMarkAsCompleted = async (id: string) => {
    try {
      // First check if session is valid
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Session Expired",
          description: "Please sign in again",
          variant: "destructive"
        });
        navigate('/?signin=true');
        return;
      }

      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          processed_by: session.user.id
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error marking payment as completed:', error);
        if (error.message?.includes('refresh_token_not_found')) {
          await supabase.auth.signOut();
          navigate('/?signin=true');
          toast({
            title: "Session Expired",
            description: "Please sign in again",
            variant: "destructive"
          });
          return;
        }
        
        toast({
          title: "Error",
          description: error.message || "Failed to mark payment as completed",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Payment marked as completed",
        });
        refetch();
      }
    } catch (err: any) {
      console.error('Error in handleMarkAsCompleted:', err);
      if (err.message?.includes('refresh_token_not_found')) {
        await supabase.auth.signOut();
        navigate('/?signin=true');
      }
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            ID
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Translator
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Amount
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
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.translator.first_name} {request.translator.last_name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.amount}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.status}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <Button onClick={() => handleMarkAsCompleted(request.id)}>Mark as Completed</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default WithdrawalRequestsTable;
