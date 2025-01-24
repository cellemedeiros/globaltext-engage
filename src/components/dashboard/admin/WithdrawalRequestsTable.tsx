import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

export default function WithdrawalRequestsTable() {
  const { toast } = useToast();
  const { data: withdrawalRequests, isLoading, refetch } = useQuery({
    queryKey: ['admin-withdrawal-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          translator:profiles!withdrawal_requests_translator_id_fkey (
            first_name,
            last_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching withdrawal requests:', error);
        throw error;
      }
      return data;
    },
  });

  const handleMarkAsCompleted = async (id: string) => {
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error marking payment as completed:', error);
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
    } catch (err) {
      console.error('Error in handleMarkAsCompleted:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const columns = [
    {
      accessorKey: "translator",
      header: "Translator",
      cell: ({ row }) => {
        const translator = row.original.translator;
        return `${translator.first_name || ''} ${translator.last_name || ''}`.trim() || 'N/A';
      },
    },
    {
      accessorKey: "translator.phone",
      header: "Phone",
      cell: ({ row }) => row.original.translator.phone || 'N/A',
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => `R$${row.original.amount.toFixed(2)}`,
    },
    {
      accessorKey: "payment_details",
      header: "PIX Key",
      cell: ({ row }) => {
        const paymentDetails = row.original.payment_details;
        return paymentDetails?.pix_key || 'N/A';
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          row.original.status === 'pending' 
            ? 'bg-yellow-100 text-yellow-800' 
            : row.original.status === 'completed'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Requested At",
      cell: ({ row }) => format(new Date(row.original.created_at), 'MMM d, yyyy HH:mm'),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        if (row.original.status === 'pending') {
          return (
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => handleMarkAsCompleted(row.original.id)}
            >
              <Check className="w-4 h-4" />
              Mark as Paid
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Withdrawal Requests</h2>
      <DataTable
        columns={columns}
        data={withdrawalRequests || []}
        isLoading={isLoading}
      />
    </div>
  );
}