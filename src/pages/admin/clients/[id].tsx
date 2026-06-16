import React, { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useRouter } from "next/router";
import { Plus, ArrowLeft, Edit, Trash2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { UserRolesEnum } from "@/utils/enums/enum";
import {
  Group, Text, Title, Paper, TextInput, Select, Checkbox, Tooltip,
  Modal, SimpleGrid, ActionIcon, PasswordInput, NumberInput, Box, Table
} from "@mantine/core";
import { CommonTable, CommonBadge, CommonButton } from "@/components/common";

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

type TxErrors = {
  date?: string;
  invoice?: string;
  particulars?: string;
  pan?: string;
  amount?: string;
  tax?: string;
};

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

  const [transactions, setTransactions] = useState([
    { id: "1", type: "Sales", date: "2024-03-15", invoice: "INV-100", particulars: "Website Dev", pan: "12345", amount: 50000, tax: 6500, isImport: false, isCapitalPurchase: false },
    { id: "2", type: "Purchase", date: "2024-03-18", invoice: "PUR-20", particulars: "Office Supplies", pan: "98765", amount: 10000, tax: 1300, isImport: false, isCapitalPurchase: false },
  ]);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: "Sales", date: getTodayDate(), invoice: "", particulars: "", pan: "", amount: 0, tax: 0, isImport: false, isCapitalPurchase: false
  });
  const [txFormErrors, setTxFormErrors] = useState<TxErrors>({});

  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [clientData, setClientData] = useState({
    name: "Acme Corp", pan: "123456789", address: "Kathmandu", password: "", vatPeriod: "Monthly"
  });
  const [clientFormErrors, setClientFormErrors] = useState<ClientErrors>({});

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

  const validateTxForm = (): boolean => {
    const errors: TxErrors = {};
    if (!formData.date) errors.date = "Date is required.";
    if (!formData.invoice.trim()) errors.invoice = "Invoice number is required.";
    if (!formData.particulars.trim()) errors.particulars = "Particulars are required.";
    if (!formData.pan.trim() || !/^\d{9}$/.test(formData.pan.trim())) errors.pan = "PAN/VAT must be exactly 9 digits.";
    
    if (isNaN(formData.amount) || formData.amount <= 0) {
      errors.amount = "Amount must be a valid number greater than 0.";
    }
    
    if (isNaN(formData.tax) || formData.tax < 0) {
      errors.tax = "Tax cannot be negative.";
    } else if (!isNaN(formData.amount) && formData.tax > formData.amount) {
      errors.tax = "Tax cannot be greater than the transaction amount.";
    }

    if ((formData.type.includes("Sales")) && (formData.isImport || formData.isCapitalPurchase)) {
       // Just silently ignore or throw error? Better to clear them in the state or show an error. 
       // We'll show an error on particulars just to inform, or handle it in onChange.
    }

    setTxFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTxForm()) return;

    if (editingTxId) {
      setTransactions(transactions.map(t => t.id === editingTxId ? {
        ...t,
        type: formData.type,
        date: formData.date,
        invoice: formData.invoice,
        particulars: formData.particulars,
        pan: formData.pan,
        amount: formData.amount,
        tax: formData.tax,
        isImport: formData.isImport,
        isCapitalPurchase: formData.isCapitalPurchase,
      } : t));
    } else {
      const newTx = {
        id: Date.now().toString(),
        type: formData.type,
        date: formData.date,
        invoice: formData.invoice,
        particulars: formData.particulars,
        pan: formData.pan,
        amount: formData.amount,
        tax: formData.tax,
        isImport: formData.isImport,
        isCapitalPurchase: formData.isCapitalPurchase,
      };
      setTransactions([...transactions, newTx]);
    }
    setIsTxModalOpen(false);
    setEditingTxId(null);
    setFormData({ type: "Sales", date: getTodayDate(), invoice: "", particulars: "", pan: "", amount: 0, tax: 0, isImport: false, isCapitalPurchase: false });
  };

  const handleEditTx = (tx: any) => {
    setEditingTxId(tx.id);
    setFormData({
      type: tx.type,
      date: tx.date,
      invoice: tx.invoice,
      particulars: tx.particulars,
      pan: tx.pan,
      amount: tx.amount,
      tax: tx.tax,
      isImport: tx.isImport ?? false,
      isCapitalPurchase: tx.isCapitalPurchase ?? false,
    });
    setIsTxModalOpen(true);
  };

  const validateClientForm = (): boolean => {
    const errors: ClientErrors = {};
    if (!clientData.name.trim() || clientData.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";
    if (!clientData.pan.trim() || !/^\d{9}$/.test(clientData.pan.trim())) errors.pan = "PAN must be exactly 9 digits.";
    if (!clientData.address.trim() || clientData.address.trim().length < 3) errors.address = "Address must be at least 3 characters.";
    if (clientData.password && clientData.password.length < 8) errors.password = "Password must be at least 8 characters.";
    setClientFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateClientForm()) return;
    // Normally would save to backend here
    setIsEditClientOpen(false);
  };

  const txField = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setTxFormErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const clientField = <K extends keyof typeof clientData>(key: K, value: typeof clientData[K]) => {
    setClientData(prev => ({ ...prev, [key]: value }));
    setClientFormErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleDelete = (txId: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      setTransactions(transactions.filter(t => t.id !== txId));
    }
  };

  const totalSales = transactions.filter(t => t.type === "Sales").reduce((acc, t) => acc + t.amount, 0);
  const totalPurchase = transactions.filter(t => t.type === "Purchase").reduce((acc, t) => acc + t.amount, 0);
  const salesReturn = transactions.filter(t => t.type === "Sales Return").reduce((acc, t) => acc + t.amount, 0);
  const purchaseReturn = transactions.filter(t => t.type === "Purchase Return").reduce((acc, t) => acc + t.amount, 0);

  const netTaxable = (totalSales - salesReturn) - (totalPurchase - purchaseReturn);

  const salesTax = transactions.filter(t => t.type === "Sales").reduce((acc, t) => acc + t.tax, 0);
  const purchaseTax = transactions.filter(t => t.type === "Purchase").reduce((acc, t) => acc + t.tax, 0);
  const salesReturnTax = transactions.filter(t => t.type === "Sales Return").reduce((acc, t) => acc + t.tax, 0);
  const purchaseReturnTax = transactions.filter(t => t.type === "Purchase Return").reduce((acc, t) => acc + t.tax, 0);

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
            <Title order={2}>Client Detail: #{id}</Title>
            <Text c="var(--muted-foreground)">Manage transactions for this client.</Text>
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
              leftSection={<Plus size={16} />}
              onClick={() => {
                setEditingTxId(null);
                setTxFormErrors({});
                setFormData({ type: "Sales", date: getTodayDate(), invoice: "", particulars: "", pan: "", amount: 0, tax: 0, isImport: false, isCapitalPurchase: false });
                setIsTxModalOpen(true);
              }}
            >
              Add Transaction
            </CommonButton>
          </Group>
        </Group>
      </Box>

      <SimpleGrid cols={{ base: 2, md: 3, lg: 6 }} mb="xl">
        <Paper withBorder p="md" radius="md">
          <Text size="xs" c="var(--muted-foreground)" fw={500} tt="uppercase">Total Purchase</Text>
          <Text size="xl" fw={700}>{totalPurchase.toLocaleString()}</Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Text size="xs" c="var(--muted-foreground)" fw={500} tt="uppercase">Total Sales</Text>
          <Text size="xl" fw={700}>{totalSales.toLocaleString()}</Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Text size="xs" c="var(--muted-foreground)" fw={500} tt="uppercase">Purchase Return</Text>
          <Text size="xl" fw={700}>{purchaseReturn.toLocaleString()}</Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Text size="xs" c="var(--muted-foreground)" fw={500} tt="uppercase">Sales Return</Text>
          <Text size="xl" fw={700}>{salesReturn.toLocaleString()}</Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Text size="xs" c="var(--muted-foreground)" fw={500} tt="uppercase">Net Taxables</Text>
          <Text size="xl" fw={700} c={netTaxable >= 0 ? "var(--chart-1)" : "var(--destructive)"}>{netTaxable.toLocaleString()}</Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Text size="xs" c="var(--muted-foreground)" fw={500} tt="uppercase">Net VAT</Text>
          <Text size="xl" fw={700} c={netVat >= 0 ? "var(--chart-1)" : "var(--destructive)"}>{netVat.toLocaleString()}</Text>
        </Paper>
      </SimpleGrid>

      <Paper withBorder radius="md">
        <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
          <Title order={3} size="h4">Transactions</Title>
        </Box>
        <CommonTable
          headers={["Date", "Type", "Invoice No.", "Particulars", "PAN/VAT", "Amount", "Tax", "Actions"]}
          isEmpty={transactions.length === 0}
          emptyMessage="No transactions found."
        >
          {transactions.map((tx) => (
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
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon variant="light" color="var(--chart-3)" onClick={() => handleEditTx(tx)}>
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
      </Paper>

      <Modal
        opened={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        title={editingTxId ? "Edit Transaction" : "Add Transaction"}
        size="lg"
      >
        <form onSubmit={handleSaveTransaction} noValidate>
          <SimpleGrid cols={2} spacing="md" mb="md">
            <Select
              required
              label="Transaction Type"
              data={["Sales", "Purchase", "Sales Return", "Purchase Return"]}
              value={formData.type}
              onChange={(val) => {
                const newType = val || "Sales";
                if (newType.includes("Sales")) {
                  setFormData(prev => ({ ...prev, type: newType, isImport: false, isCapitalPurchase: false }));
                } else {
                  txField("type", newType);
                }
              }}
            />
            <TextInput
              required
              type="date"
              label="Date"
              value={formData.date}
              error={txFormErrors.date}
              onChange={(e) => txField("date", e.currentTarget.value)}
            />
            <TextInput
              required
              label="Invoice Number"
              placeholder="e.g. INV-001"
              value={formData.invoice}
              error={txFormErrors.invoice}
              onChange={(e) => txField("invoice", e.currentTarget.value)}
            />
            <TextInput
              required
              label="Particulars"
              placeholder="e.g. Office Supplies"
              value={formData.particulars}
              error={txFormErrors.particulars}
              onChange={(e) => txField("particulars", e.currentTarget.value)}
            />
            <TextInput
              required
              label="VAT/PAN Number"
              placeholder="9-digit PAN"
              maxLength={9}
              value={formData.pan}
              error={txFormErrors.pan}
              onChange={(e) => txField("pan", e.currentTarget.value.replace(/\D/g, ""))}
            />
            <NumberInput
              required
              label="Amount"
              min={0}
              value={formData.amount || ""}
              error={txFormErrors.amount}
              onChange={(val) => txField("amount", Number(val))}
            />
            <NumberInput
              required
              label="Tax Amount"
              min={0}
              value={formData.tax || ""}
              error={txFormErrors.tax}
              onChange={(val) => txField("tax", Number(val))}
            />
          </SimpleGrid>
          <SimpleGrid cols={2} spacing="md" mb="md">
            <Checkbox
              label="Import"
              checked={formData.isImport}
              disabled={formData.type.includes("Sales")}
              onChange={(e) => txField("isImport", e.currentTarget.checked)}
            />
            <Checkbox
              label="Capital Purchase"
              checked={formData.isCapitalPurchase}
              disabled={formData.type.includes("Sales")}
              onChange={(e) => txField("isCapitalPurchase", e.currentTarget.checked)}
            />
          </SimpleGrid>
          <Group justify="flex-end">
            <CommonButton variant="default" onClick={() => setIsTxModalOpen(false)}>Cancel</CommonButton>
            <CommonButton type="submit">Save Transaction</CommonButton>
          </Group>
        </form>
      </Modal>

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
