import React, { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { UserRolesEnum } from "@/utils/enums/enum";
import { Text, Paper, Flex, Table } from "@mantine/core";
import { CommonBadge, CommonFilter, CommonHeading, CommonSearch, CommonTable } from "@/components/common";

export default function AdminTransactions() {
  const [transactions] = useState([
    { id: "1", client: "Acme Corp", type: "Sales", date: "2024-03-01", invoice: "INV-001", particular: "Software License", amount: 5000, tax: 650 },
    { id: "2", client: "Acme Corp", type: "Purchase", date: "2024-03-05", invoice: "PUR-001", particular: "Office Supplies", amount: 1000, tax: 130 },
    { id: "3", client: "Global Tech", type: "Sales", date: "2024-03-10", invoice: "INV-002", particular: "Consulting", amount: 15000, tax: 1950 },
    { id: "4", client: "Global Tech", type: "Sales Return", date: "2024-03-12", invoice: "SR-001", particular: "Refund", amount: 2000, tax: 260 },
  ]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>("");

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.client.toLowerCase().includes(search.toLowerCase()) ||
      t.invoice.toLowerCase().includes(search.toLowerCase()) ||
      t.particular.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? t.type === typeFilter : true;
    return matchesSearch && matchesType;
  });

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
          <CommonSearch
            placeholder="Search by Client, Invoice, or Particular..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
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

      <Paper withBorder radius="md">
        <CommonTable
          headers={["Client", "Date", "Type", "Invoice No", "Particulars", "Amount", "Tax"]}
          isEmpty={filteredTransactions.length === 0}
          emptyMessage="No transactions found."
        >
          {filteredTransactions.map((t) => (
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
      </Paper>
    </DashboardLayout>
  );
}
