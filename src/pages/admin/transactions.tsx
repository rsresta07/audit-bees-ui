import React, { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { UserRolesEnum } from "@/utils/enums/enum";
import { Text, Paper, Flex, Table, Box } from "@mantine/core";
import { CommonBadge, CommonFilter, CommonHeading, CommonSearch, CommonTable, CommonPagination, CommonButton } from "@/components/common";
import { exportTransactionsToExcel } from "@/utils/helpers/excelExport";
import { FileSpreadsheet } from "lucide-react";
import { TextInput } from "@mantine/core";

export default function AdminTransactions() {
  const [transactions] = useState([
    { id: "1", client: "Acme Corp", type: "Sales", date: "2024-03-01", invoice: "INV-001", particular: "Software License", amount: 5000, tax: 650 },
    { id: "2", client: "Acme Corp", type: "Purchase", date: "2024-03-05", invoice: "PUR-001", particular: "Office Supplies", amount: 1000, tax: 130 },
    { id: "3", client: "Global Tech", type: "Sales", date: "2024-03-10", invoice: "INV-002", particular: "Consulting", amount: 15000, tax: 1950 },
    { id: "4", client: "Global Tech", type: "Sales Return", date: "2024-03-12", invoice: "SR-001", particular: "Refund", amount: 2000, tax: 260 },
  ]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.client.toLowerCase().includes(search.toLowerCase()) ||
      t.invoice.toLowerCase().includes(search.toLowerCase()) ||
      t.particular.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? t.type === typeFilter : true;

    let matchesStartDate = true;
    let matchesEndDate = true;
    if (startDate || endDate) {
      const txDate = new Date(t.date);
      if (startDate && txDate < new Date(startDate)) matchesStartDate = false;
      if (endDate && txDate > new Date(endDate)) matchesEndDate = false;
    }

    return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
  });

  const [page, setPage] = React.useState(1);
  const itemsPerPage = 10;

  React.useEffect(() => {
    setPage(1);
  }, [search, typeFilter, startDate, endDate]);

  const paginatedTransactions = filteredTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleExportExcel = () => {
    exportTransactionsToExcel({
      transactions: filteredTransactions,
      filename: `All_Transactions_${new Date().toISOString().split('T')[0]}.xlsx`
    });
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Sales': return 'var(--chart-2)'; // green equivalent
      case 'Purchase': return 'var(--primary)'; // blue equivalent
      case 'Sales Return': return 'var(--destructive)'; // red equivalent
      case 'Purchase Return': return 'var(--chart-3)'; // orange/yellow equivalent
      default: return 'var(--muted-foreground)';
    }
  };

  return (
    <DashboardLayout role={UserRolesEnum.SUPER_ADMIN}>
      <CommonHeading
        title="All Transactions"
        description="View transactions across all clients."
      />

      <Paper withBorder p="md" mb="lg" radius="md">
        <Flex gap="md" justify="space-between" direction={{ base: 'column', md: 'row' }}>
          <Box style={{ flex: 1, maxWidth: '400px' }}>
            <CommonSearch
              placeholder="Search by Client, Invoice, or Particular..."
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
          </Box>
          <Flex gap="md" align="flex-end" wrap="wrap">
            <TextInput
              type="date"
              label="Start Date"
              value={startDate}
              onChange={e => setStartDate(e.currentTarget.value)}
            />
            <TextInput
              type="date"
              label="End Date"
              value={endDate}
              onChange={e => setEndDate(e.currentTarget.value)}
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
            <CommonButton variant="light" color="var(--chart-2)" leftSection={<FileSpreadsheet size={16} />} onClick={handleExportExcel} mt="auto">
              Export Excel
            </CommonButton>
          </Flex>
        </Flex>
      </Paper>

      <Paper withBorder radius="md">
        <CommonTable
          headers={["Client", "Date", "Type", "Invoice No", "Particulars", "Amount", "Tax"]}
          isEmpty={paginatedTransactions.length === 0}
          emptyMessage="No transactions found."
        >
          {paginatedTransactions.map((t) => (
            <Table.Tr key={t.id}>
              <Table.Td><Text fw={500}>{t.client}</Text></Table.Td>
              <Table.Td>{t.date}</Table.Td>
              <Table.Td>
                <CommonBadge color={getBadgeColor(t.type)}>
                  {t.type}
                </CommonBadge>
              </Table.Td>
              <Table.Td>{t.invoice}</Table.Td>
              <Table.Td>{t.particular}</Table.Td>
              <Table.Td>{t.amount.toLocaleString()}</Table.Td>
              <Table.Td>{t.tax.toLocaleString()}</Table.Td>
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
