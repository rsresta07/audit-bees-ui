import React, { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useRouter } from "next/router";
import { Plus, ArrowLeft, Edit, Trash2, RefreshCw, ShoppingCart, Tag, CornerDownLeft, CornerUpRight, Calculator, Landmark, Download, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { UserRolesEnum } from "@/utils/enums/enum";
import {
  Group, Text, Title, Paper, TextInput, Select, Checkbox, Tooltip,
  Modal, SimpleGrid, ActionIcon, PasswordInput, NumberInput, Box, Table
} from "@mantine/core";
import { CommonTable, CommonBadge, CommonButton, CommonPagination } from "@/components/common";
import { ADToBS } from "bikram-sambat-js";
import { FiscalYear, getFiscalYearFromDate } from "@/utils/helpers/dateFormatter";
import { exportTableToPDF } from "@/utils/helpers/pdfExport";
import { exportTransactionsToExcel } from "@/utils/helpers/excelExport";

function generateRandomPassword(): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%^&*";
  const all = upper + lower + digits + special;
  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  for (let i = required.length; i < 12; i++) {
    required.push(all[Math.floor(Math.random() * all.length)]);
  }
  return required.sort(() => Math.random() - 0.5).join("");
}



type ClientErrors = {
  name?: string;
  pan?: string;
  address?: string;
  password?: string;
};

const getTodayDate = () => new Date().toISOString().split("T")[0];

export default function ClientDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [transactions, setTransactions] = useState<any[]>([]);

  React.useEffect(() => {
    if (!id) return;
    const storedTx = localStorage.getItem(`transactions_${id}`);
    if (storedTx) {
      try {
        setTransactions(JSON.parse(storedTx));
      } catch (e) {
        console.error("Error parsing transactions JSON", e);
        // Fallback to empty or initialTx if parsing fails
        setTransactions([]);
      }
    } else {
      // Generate 20 dummy transactions for the client
      const dummyTx: any[] = [];
      const types = ["Sales", "Purchase", "Sales Return", "Purchase Return"];
      for (let i = 1; i <= 20; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const amount = Math.floor(Math.random() * 90000) + 1000; // 1k-91k
        const tax = Math.round(amount * 0.13);
        dummyTx.push({
          id: i.toString(),
          type,
          date: `2024-03-${(i % 28 + 1).toString().padStart(2, "0")}`,
          invoice: `${type.substring(0, 3).toUpperCase()}-${100 + i}`,
          particulars: `${type} transaction ${i}`,
          pan: "00000",
          amount,
          tax,
          isImport: false,
          isCapitalPurchase: false,
          items: [{
            id: `${i}-1`,
            particulars: `${type} item ${i}`,
            amount,
            vatPercent: 13,
            tax,
            grandTotal: amount + tax,
          }],
        });
      }
      setTransactions(dummyTx);
      localStorage.setItem(`transactions_${id}`, JSON.stringify(dummyTx));
    }
  }, [id]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredTransactions = transactions.filter(t => {
    if (!startDate && !endDate) return true;
    const txDate = new Date(t.date);
    if (startDate && txDate < new Date(startDate)) return false;
    if (endDate && txDate > new Date(endDate)) return false;
    return true;
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const paginatedTransactions = filteredTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  React.useEffect(() => {
    setPage(1);
  }, [startDate, endDate]);

  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [clientData, setClientData] = useState({ name: "", pan: "", address: "", vatPeriod: "Monthly", password: "" });
  const [clientFormErrors, setClientFormErrors] = useState<ClientErrors>({});

  // Load client details from stored admin clients
  React.useEffect(() => {
    const clientId = Array.isArray(id) ? id[0] : id;
    if (!clientId) return;
    const storedClients = localStorage.getItem('adminClients');
    if (storedClients) {
      try {
        const clients = JSON.parse(storedClients);
        const client = clients.find((c: any) => c.id === clientId);
        if (client) {
          setClientData({ name: client.name, pan: client.pan, address: client.address, vatPeriod: client.vatPeriod, password: client.password });
        }
      } catch (e) {
        console.error('Error parsing adminClients', e);
      }
    }
  }, [id]);

  const [filingPeriods, setFilingPeriods] = useState<{ id: string, name: string }[]>([]);




  React.useEffect(() => {
    const storedPeriods = localStorage.getItem("filingPeriods");

    if (storedPeriods) {
      setFilingPeriods(JSON.parse(storedPeriods));
    } else {
      setFilingPeriods([
        { id: "1", name: "Monthly" },
        { id: "2", name: "Trimester" },
      ]);
    }


  }, []);



  const validateClientForm = (): boolean => {
    const errors: ClientErrors = {};
    if (!clientData.name.trim() || clientData.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";
    if (!clientData.pan.trim() || !/^\d{9}$/.test(clientData.pan.trim())) errors.pan = "PAN must be exactly 9 digits.";
    if (!clientData.address.trim() || !clientData.address.trim()) errors.address = "Address is required.";
    if (clientData.password && clientData.password.length < 8) errors.password = "Password must be at least 8 characters.";
    setClientFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateClientForm()) return;
    setIsEditClientOpen(false);
  };



  const clientField = <K extends keyof typeof clientData>(key: K, value: typeof clientData[K]) => {
    setClientData(prev => ({ ...prev, [key]: value }));
    setClientFormErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleDelete = (txId: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      const updated = transactions.filter(t => t.id !== txId);
      setTransactions(updated);
      localStorage.setItem(`transactions_${id}`, JSON.stringify(updated));
    }
  };

  const handleExportExcel = () => {
    exportTransactionsToExcel({
      transactions: filteredTransactions,
      clientData: {
        name: clientData.name,
        pan: clientData.pan,
        vatPeriod: clientData.vatPeriod
      },
      filename: `Transactions_${clientData.name.replace(/\s+/g, '_')}_${getTodayDate()}.xlsx`
    });
  };

  const handleExportPDF = () => {
    const tableRows = filteredTransactions.map(tx => {
      const invoices = tx.items && tx.items.length > 0 ? tx.items.map((i: any) => {
        if (tx.type.includes("Return")) {
          const parts = [];
          if (i.debitInvoice) parts.push(`Dr: ${i.debitInvoice}`);
          if (i.creditInvoice) parts.push(`Cr: ${i.creditInvoice}`);
          return parts.length > 0 ? parts.join(" | ") : "-";
        }
        return i.invoice || "-";
      }).join("\n") : (
        tx.type.includes("Return")
          ? [tx.debitInvoice ? `Dr: ${tx.debitInvoice}` : "", tx.creditInvoice ? `Cr: ${tx.creditInvoice}` : ""].filter(Boolean).join(" | ") || "-"
          : tx.invoice || "-"
      );
      const particulars = tx.items && tx.items.length > 0 ? tx.items.map((i: any) => i.particulars || "-").join("\n") : tx.particulars;
      const pans = tx.items && tx.items.length > 0 ? tx.items.map((i: any) => i.pan || "-").join("\n") : tx.pan;

      return [
        tx.date,
        tx.type,
        invoices,
        particulars,
        pans,
        tx.amount.toLocaleString(),
        tx.tax.toLocaleString(),
      ];
    });

    exportTableToPDF({
      title: `Transactions - ${clientData.name}`,
      subtitle: `PAN: ${clientData.pan} | Address: ${clientData.address}`,
      columns: ["Date", "Type", "Invoice No.", "Particulars", "PAN/VAT", "Amount", "Tax"],
      data: tableRows,
      filename: `Transactions_${clientData.name.replace(/\s+/g, '_')}_${getTodayDate()}.pdf`
    });
  };

  const totalSales = filteredTransactions.filter(t => t.type === "Sales").reduce((acc, t) => acc + t.amount, 0);
  const totalPurchase = filteredTransactions.filter(t => t.type === "Purchase").reduce((acc, t) => acc + t.amount, 0);
  const salesReturn = filteredTransactions.filter(t => t.type === "Sales Return").reduce((acc, t) => acc + t.amount, 0);
  const purchaseReturn = filteredTransactions.filter(t => t.type === "Purchase Return").reduce((acc, t) => acc + t.amount, 0);

  const netTaxable = (totalSales - salesReturn) - (totalPurchase - purchaseReturn);

  const salesTax = filteredTransactions.filter(t => t.type === "Sales").reduce((acc, t) => acc + t.tax, 0);
  const purchaseTax = filteredTransactions.filter(t => t.type === "Purchase").reduce((acc, t) => acc + t.tax, 0);
  const salesReturnTax = filteredTransactions.filter(t => t.type === "Sales Return").reduce((acc, t) => acc + t.tax, 0);
  const purchaseReturnTax = filteredTransactions.filter(t => t.type === "Purchase Return").reduce((acc, t) => acc + t.tax, 0);

  const netVat = (salesTax - salesReturnTax) - (purchaseTax - purchaseReturnTax);

  return (
    <DashboardLayout role={UserRolesEnum.SUPER_ADMIN}>
      <Box mb="xl">
        <CommonButton
          component={Link}
          href="/admin/clients"
          variant="subtle"
          color="var(--muted-foreground)"
          leftSection={<ArrowLeft size={16} />}
          mb="md"
        >
          Back to Clients
        </CommonButton>
        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={2}>{clientData.name}</Title>
            <Group gap="xs" mt={4}>
              <CommonBadge color="var(--primary)">PAN: {clientData.pan}</CommonBadge>
              <Text size="sm" c="var(--muted-foreground)">•</Text>
              <Text size="sm" c="var(--muted-foreground)">{clientData.address}</Text>
              <Text size="sm" c="var(--muted-foreground)">•</Text>
              <Text size="sm" c="var(--muted-foreground)">VAT: {clientData.vatPeriod}</Text>
            </Group>
          </Box>
          <Group>
            <CommonButton
              variant="default"
              leftSection={<Edit size={16} />}
              onClick={() => {
                setClientFormErrors({});
                setIsEditClientOpen(true);
              }}
            >
              Edit Client
            </CommonButton>
            <CommonButton
              component={Link}
              href={`/admin/clients/${id}/add-transaction`}
              leftSection={<Plus size={16} />}
            >
              Add Transaction
            </CommonButton>
          </Group>
        </Group>
      </Box>

      <SimpleGrid cols={{ base: 2, md: 3, lg: 6 }} mb="xl">
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="center" mb="xs">
            <Text size="xs" c="var(--muted-foreground)" fw={500} tt="uppercase">Total Purchase</Text>
            <ShoppingCart size={16} color="var(--muted-foreground)" />
          </Group>
          <Text size="xl" fw={700}>{totalPurchase.toLocaleString()}</Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="center" mb="xs">
            <Text size="xs" c="var(--muted-foreground)" fw={500} tt="uppercase">Total Sales</Text>
            <Tag size={16} color="var(--muted-foreground)" />
          </Group>
          <Text size="xl" fw={700}>{totalSales.toLocaleString()}</Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="center" mb="xs">
            <Text size="xs" c="var(--muted-foreground)" fw={500} tt="uppercase">Purchase Return</Text>
            <CornerDownLeft size={16} color="var(--muted-foreground)" />
          </Group>
          <Text size="xl" fw={700}>{purchaseReturn.toLocaleString()}</Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="center" mb="xs">
            <Text size="xs" c="var(--muted-foreground)" fw={500} tt="uppercase">Sales Return</Text>
            <CornerUpRight size={16} color="var(--muted-foreground)" />
          </Group>
          <Text size="xl" fw={700}>{salesReturn.toLocaleString()}</Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="center" mb="xs">
            <Text size="xs" c="var(--muted-foreground)" fw={500} tt="uppercase">Net Taxables</Text>
            <Calculator size={16} color={netTaxable >= 0 ? "var(--chart-1)" : "var(--destructive)"} />
          </Group>
          <Text size="xl" fw={700} c={netTaxable >= 0 ? "var(--chart-1)" : "var(--destructive)"}>{netTaxable.toLocaleString()}</Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="center" mb="xs">
            <Text size="xs" c="var(--muted-foreground)" fw={500} tt="uppercase">Net VAT</Text>
            <Landmark size={16} color={netVat >= 0 ? "var(--chart-1)" : "var(--destructive)"} />
          </Group>
          <Text size="xl" fw={700} c={netVat >= 0 ? "var(--chart-1)" : "var(--destructive)"}>{netVat.toLocaleString()}</Text>
        </Paper>
      </SimpleGrid>

      <Paper withBorder radius="md">
        <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
          <Group justify="space-between" mb="sm">
            <Title order={3} size="h4">Transactions</Title>
            <Group gap="xs">
              {/* <CommonButton size="xs" variant="light" color="var(--chart-2)" leftSection={<FileSpreadsheet size={14} />} onClick={handleExportExcel}>
                Export Excel
              </CommonButton> */}
              <CommonButton size="xs" variant="light" leftSection={<Download size={14} />} onClick={handleExportPDF} disabled={true}>
                Export PDF
              </CommonButton>
            </Group>
          </Group>
          <Group gap="md">
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
          </Group>
        </Box>
        <CommonTable
          headers={["Date", "Type", "Invoice No.", "Particulars", "PAN/VAT", "Amount", "Tax", "Actions"]}
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
              <Table.Td>
                {tx.items && tx.items.length > 0
                  ? tx.items.map((item: any) => (
                    <div key={item.id}>
                      {tx.type.includes("Return")
                        ? [item.debitInvoice ? `Dr: ${item.debitInvoice}` : "", item.creditInvoice ? `Cr: ${item.creditInvoice}` : ""].filter(Boolean).join(" | ") || "-"
                        : item.invoice || "-"}
                    </div>
                  ))
                  : tx.type.includes("Return")
                    ? [tx.debitInvoice ? `Dr: ${tx.debitInvoice}` : "", tx.creditInvoice ? `Cr: ${tx.creditInvoice}` : ""].filter(Boolean).join(" | ") || "-"
                    : tx.invoice || "-"}
              </Table.Td>
              <Table.Td>
                {tx.items && tx.items.length > 0
                  ? tx.items.map((item: any) => <div key={item.id}>{item.particulars || "-"}</div>)
                  : tx.particulars}
              </Table.Td>
              <Table.Td>
                {tx.items && tx.items.length > 0
                  ? tx.items.map((item: any) => <div key={item.id}>{item.pan || "-"}</div>)
                  : tx.pan}
              </Table.Td>
              <Table.Td>{tx.amount.toLocaleString()}</Table.Td>
              <Table.Td>{tx.tax.toLocaleString()}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon component={Link} href={`/admin/clients/${id}/add-transaction?txId=${tx.id}`} variant="light" color="var(--chart-3)">
                    <Edit size={16} />
                  </ActionIcon>
                  <ActionIcon variant="light" color="var(--destructive)" onClick={() => handleDelete(tx.id)}>
                    <Trash2 size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
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

      <Modal
        opened={isEditClientOpen}
        onClose={() => setIsEditClientOpen(false)}
        title="Edit Client"
      >
        <form onSubmit={handleSaveClient} noValidate>
          <TextInput
            required
            label="Name"
            mb="sm"
            value={clientData.name}
            error={clientFormErrors.name}
            onChange={(e) => clientField("name", e.currentTarget.value)}
          />
          <TextInput
            required
            label="PAN Number"
            mb="sm"
            maxLength={9}
            value={clientData.pan}
            error={clientFormErrors.pan}
            onChange={(e) => clientField("pan", e.currentTarget.value.replace(/\D/g, ""))}
          />
          <TextInput
            required
            label="Address"
            mb="sm"
            value={clientData.address}
            error={clientFormErrors.address}
            onChange={(e) => clientField("address", e.currentTarget.value)}
          />

          <Group align="flex-start" mb="sm" gap="xs" wrap="nowrap">
            <PasswordInput
              label="Password (Leave blank to keep current)"
              placeholder="Min. 8 characters"
              style={{ flex: 1 }}
              value={clientData.password}
              error={clientFormErrors.password}
              onChange={(e) => clientField("password", e.currentTarget.value)}
            />
            <Tooltip label="Generate 12-character random password" position="top">
              <ActionIcon
                variant="light"
                color="var(--primary)"
                size={36}
                mt={25}
                onClick={() => {
                  clientField("password", generateRandomPassword());
                }}
              >
                <RefreshCw size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
          <Select
            label="VAT Filing Period"
            mb="md"
            data={filingPeriods.map(p => ({ value: p.name, label: p.name }))}
            value={clientData.vatPeriod}
            onChange={(val) => setClientData({ ...clientData, vatPeriod: val || "Monthly" })}
          />
          <Group justify="flex-end">
            <CommonButton variant="default" onClick={() => setIsEditClientOpen(false)}>Cancel</CommonButton>
            <CommonButton type="submit">Save</CommonButton>
          </Group>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
