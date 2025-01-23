import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";

export default function WithdrawalRequestsTable() {
  const { data: withdrawalRequests, isLoading } = useQuery({
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

      if (error) throw error;
      return data;
    },
  });

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
      cell: ({ row }) => `$${row.original.amount.toFixed(2)}`,
    },
    {
      accessorKey: "payment_method",
      header: "Payment Method",
      cell: ({ row }) => row.original.payment_method.replace('_', ' ').toUpperCase(),
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