import React, { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { UserRolesEnum } from "@/utils/enums/enum";
import { Paper, Text, Flex, Table } from "@mantine/core";
import { CommonHeading, CommonSearch, CommonFilter, CommonTable, CommonBadge, CommonPagination } from "@/components/common";

export default function ClientDashboard() {
  const [transactions] = useState([
    { id: "1", type: "Sales", date: "2024-03-15", invoice: "INV-100", particulars: "Website Dev", pan: "12345", amount: 50000, tax: 6500 },
    { id: "2", type: "Purchase", date: "2024-03-18", invoice: "PUR-20", particulars: "Office Supplies", pan: "98765", amount: 10000, tax: 1300 },
    { id: "3", type: "Sales Return", date: "2024-03-20", invoice: "SR-01", particulars: "Refund", pan: "12345", amount: 5000, tax: 650 },
  ]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.invoice.toLowerCase().includes(search.toLowerCase()) ||
      t.particulars.toLowerCase().includes(search.toLowerCase()) ||
      t.pan.includes(search);
    const matchesType = typeFilter ? t.type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  const [page, setPage] = React.useState(1);
  const itemsPerPage = 10;
  
  React.useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  const paginatedTransactions = filteredTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <DashboardLayout role={UserRolesEnum.CLIENT}>
      <CommonHeading 
        title="My Transactions" 
        description="View and filter your transaction history." 
      />

      <Paper withBorder shadow="sm" p="md" mb="xl" radius="md">
        <Flex gap="md" justify="space-between" direction={{ base: 'column', md: 'row' }}>
          <CommonSearch
            placeholder="Search by Invoice, Particulars, or PAN/VAT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <CommonFilter
            label="Filter by Type:"
            value={typeFilter || ""}
            onChange={setTypeFilter}
            allLabel="All Types"
            options={[
              { label: 'Sales', value: 'Sales' },
              { label: 'Purchase', value: 'Purchase' },
              { label: 'Sales Return', value: 'Sales Return' },
              { label: 'Purchase Return', value: 'Purchase Return' },
            ]}
          />
        </Flex>
      </Paper>

      <Paper withBorder shadow="sm" radius="md">
        <CommonTable
          headers={["Date", "Type", "Invoice No.", "Particulars", "PAN/VAT", "Amount", "Tax"]}
          isEmpty={paginatedTransactions.length === 0}
          emptyMessage="No transactions found."
        >
          {paginatedTransactions.map((tx) => (
            <Table.Tr key={tx.id}>
              <Table.Td>{tx.date}</Table.Td>
              <Table.Td>
                <CommonBadge color={tx.type.includes("Sales") ? "var(--chart-2)" : "var(--primary)"}>
                  {tx.type}
                </CommonBadge>
              </Table.Td>
              <Table.Td>{tx.invoice}</Table.Td>
              <Table.Td>{tx.particulars}</Table.Td>
              <Table.Td>{tx.pan}</Table.Td>
              <Table.Td>{tx.amount.toLocaleString()}</Table.Td>
              <Table.Td>{tx.tax.toLocaleString()}</Table.Td>
            </Table.Tr>
          ))}
        </CommonTable>
        {filteredTransactions.length > itemsPerPage && (
          <CommonPagination 
            total={Math.ceil(filteredTransactions.length / itemsPerPage)} 
            value={page} 
            onChange={setPage} 
          />
        )}
      </Paper>
    </DashboardLayout>
  );
}

