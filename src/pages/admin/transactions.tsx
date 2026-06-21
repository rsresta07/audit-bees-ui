import React, { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { UserRolesEnum } from "@/utils/enums/enum";
import { Text, Paper, Flex, Table, Box } from "@mantine/core";
import { CommonBadge, CommonFilter, CommonHeading, CommonSearch, CommonTable, CommonPagination, CommonButton } from "@/components/common";
import { exportTransactionsToExcel } from "@/utils/helpers/excelExport";
import { FileSpreadsheet } from "lucide-react";
import { TextInput } from "@mantine/core";

export default function AdminTransactions() {
  const [transactions] = useState<any[]>([
    { id: "1", client: "Acme Corp", type: "Sales", date: "2024-01-01", invoice: "INV-001", particular: "Software License", amount: 5000, tax: 650 },
    { id: "2", client: "Acme Corp", type: "Purchase", date: "2024-01-05", invoice: "PUR-001", particular: "Office Supplies", amount: 1000, tax: 130 },
    { id: "3", client: "Global Tech", type: "Sales", date: "2024-01-10", invoice: "INV-002", particular: "Consulting", amount: 15000, tax: 1950 },
    { id: "4", client: "Global Tech", type: "Sales Return", date: "2024-01-12", invoice: "SR-001", particular: "Refund", amount: 2000, tax: 260 },
    { id: "5", client: "Beta Ltd", type: "Purchase", date: "2024-02-01", invoice: "PUR-002", particular: "Hardware", amount: 3000, tax: 390 },
    { id: "6", client: "Beta Ltd", type: "Sales", date: "2024-02-03", invoice: "INV-003", particular: "Maintenance", amount: 2500, tax: 325 },
    { id: "7", client: "Omega Inc", type: "Sales", date: "2024-02-07", invoice: "INV-004", particular: "Integration Service", amount: 8000, tax: 1040 },
    { id: "8", client: "Omega Inc", type: "Purchase Return", date: "2024-02-10", invoice: "PR-001", particular: "Returned Parts", amount: 1200, tax: 156 },
    { id: "9", client: "Acme Corp", type: "Sales", date: "2024-03-01", invoice: "INV-005", particular: "Cloud Hosting", amount: 4000, tax: 520 },
    { id: "10", client: "Global Tech", type: "Purchase", date: "2024-03-04", invoice: "PUR-003", particular: "Stationery", amount: 500, tax: 65 },
    { id: "11", client: "Beta Ltd", type: "Sales", date: "2024-03-08", invoice: "INV-006", particular: "Consulting", amount: 7000, tax: 910 },
    { id: "12", client: "Omega Inc", type: "Sales", date: "2024-03-11", invoice: "INV-007", particular: "Software Support", amount: 3500, tax: 455 },
    { id: "13", client: "Acme Corp", type: "Purchase", date: "2024-03-13", invoice: "PUR-004", particular: "Licenses", amount: 2000, tax: 260 },
    { id: "14", client: "Global Tech", type: "Sales", date: "2024-03-15", invoice: "INV-008", particular: "Project Management", amount: 9000, tax: 1170 },
    { id: "15", client: "Beta Ltd", type: "Sales Return", date: "2024-03-18", invoice: "SR-002", particular: "Refund", amount: 1500, tax: 195 },
    { id: "16", client: "Omega Inc", type: "Purchase", date: "2024-03-20", invoice: "PUR-005", particular: "Equipment", amount: 6000, tax: 780 },
    { id: "17", client: "Acme Corp", type: "Sales", date: "2024-04-01", invoice: "INV-009", particular: "Training", amount: 1200, tax: 156 },
    { id: "18", client: "Global Tech", type: "Purchase Return", date: "2024-04-03", invoice: "PR-002", particular: "Returned Items", amount: 800, tax: 104 },
    { id: "19", client: "Beta Ltd", type: "Sales", date: "2024-04-07", invoice: "INV-010", particular: "Consulting", amount: 5000, tax: 650 },
    { id: "20", client: "Omega Inc", type: "Sales", date: "2024-04-10", invoice: "INV-011", particular: "Implementation", amount: 11000, tax: 1430 }
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
        <Flex gap="md" direction={{ base: 'column', md: 'row' }} align="flex-start">
          <Box style={{ flex: 1, minWidth: 0, width: '100%' }}>
            <CommonSearch
              placeholder="Search by Client, Invoice, or Particular..."
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
          </Box>
          <Flex gap="md" style={{ flexWrap: 'wrap' }}>
            <TextInput
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.currentTarget.value)}
              style={{ width: 180 }}
            />
            <TextInput
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.currentTarget.value)}
              style={{ width: 180 }}
            />
          </Flex>
        </Flex>
        <Flex gap="md" mt="md" align="center" justify="space-between">
          <CommonFilter
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
          <CommonButton variant="light" color="var(--chart-2)" leftSection={<FileSpreadsheet size={16} />} onClick={handleExportExcel} disabled={true}>
            Export Excel
          </CommonButton>
        </Flex>
      </Paper>

      <Paper withBorder radius="md">
        <CommonTable
          headers={["Client", "Date", "Type", "Invoice No", "Particulars", "Amount", "Taxable Amount", "Non Taxable Amount", "Tax", "Total"]}
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
              <Table.Td>{(t.taxable ?? t.amount).toLocaleString()}</Table.Td>
              <Table.Td>{(t.nonTaxable ?? 0).toLocaleString()}</Table.Td>
              <Table.Td>{t.tax.toLocaleString()}</Table.Td>
              <Table.Td>{(t.amount + t.tax).toLocaleString()}</Table.Td>
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
