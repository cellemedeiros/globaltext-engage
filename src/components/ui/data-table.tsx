import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData> {
  columns: {
    accessorKey: string;
    header: string;
    cell?: ({ row }: { row: { original: any } }) => React.ReactNode;
  }[];
  data: TData[];
  isLoading?: boolean;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
}: DataTableProps<TData>) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.accessorKey}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row: any, i) => (
          <TableRow key={i}>
            {columns.map((column) => (
              <TableCell key={column.accessorKey}>
                {column.cell
                  ? column.cell({ row: { original: row } })
                  : row[column.accessorKey]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}