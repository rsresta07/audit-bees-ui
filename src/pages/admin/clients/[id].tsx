import React, { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useRouter } from "next/router";
import { Plus, ArrowLeft, Edit, Trash2, RefreshCw, ShoppingCart, Tag, CornerDownLeft, CornerUpRight, Calculator, Landmark } from "lucide-react";
import Link from "next/link";
import { UserRolesEnum } from "@/utils/enums/enum";
import {
  Group, Text, Title, Paper, TextInput, Select, Checkbox, Tooltip,
  Modal, SimpleGrid, ActionIcon, PasswordInput, NumberInput, Box, Table
} from "@mantine/core";
import { CommonTable, CommonBadge, CommonButton, CommonPagination } from "@/components/common";
import { ADToBS } from "bikram-sambat-js";
import { FiscalYear, getFiscalYearFromDate } from "@/utils/helpers/dateFormatter";

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

type TxItem = {
  id: string;
  particulars: string;
  amount: number;
  vatPercent: number;
  tax: number;
  grandTotal: number;
};

type TxErrors = {
  date?: string;
  invoice?: string;
  pan?: string;
  items?: string;
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

  const [transactions, setTransactions] = useState<any[]>([
    {
      id: "1",
      type: "Sales",
      date: "2024-03-15",
      invoice: "INV-100",
      particulars: "Website Dev",
      pan: "12345",
      amount: 50000,
      tax: 6500,
      isImport: false,
      isCapitalPurchase: false,
      items: [{ id: "1-1", particulars: "Website Dev", amount: 50000, vatPercent: 13, tax: 6500, grandTotal: 56500 }]
    },
    {
      id: "2",
      type: "Purchase",
      date: "2024-03-18",
      invoice: "PUR-20",
      particulars: "Office Supplies",
      pan: "98765",
      amount: 10000,
      tax: 1300,
      isImport: false,
      isCapitalPurchase: false,
      items: [{ id: "2-1", particulars: "Office Supplies", amount: 10000, vatPercent: 13, tax: 1300, grandTotal: 11300 }]
    },
  ]);

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const paginatedTransactions = transactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);

  const [txFormErrors, setTxFormErrors] = useState<TxErrors>({});
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);

  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [clientData, setClientData] = useState({
    name: "Acme Corp", pan: "123456789", address: "Kathmandu", password: "", vatPeriod: "Monthly"
  });
  const [clientFormErrors, setClientFormErrors] = useState<ClientErrors>({});

  const [filingPeriods, setFilingPeriods] = useState<{ id: string, name: string }[]>([]);


  const [formData, setFormData] = useState({
    type: "Sales",
    date: getTodayDate(),
    invoice: "",
    pan: "",
    isImport: false,
    isCapitalPurchase: false,
    items: [
      {
        id: Date.now().toString(),
        particulars: "",
        amount: 0,
        vatPercent: 0,
        tax: 0,
        grandTotal: 0,
      },
    ] as TxItem[],
  });

  const currentFiscalYear = React.useMemo(
    () => getFiscalYearFromDate(formData.date, fiscalYears),
    [formData.date, fiscalYears]
  );

  const currentVatRate = currentFiscalYear?.vatAmount ?? 0;

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

    const storedFiscalYears = localStorage.getItem("fiscalYears");

    if (storedFiscalYears) {
      setFiscalYears(JSON.parse(storedFiscalYears));
    } else {
      const initialFiscalYears = [
        { id: "1", year: "2082/83", vatAmount: 13 },
        { id: "2", year: "2083/84", vatAmount: 13 },
      ];

      setFiscalYears(initialFiscalYears);
    }
  }, []);

  const validateTxForm = (): boolean => {
    const errors: TxErrors = {};
    if (!formData.date) errors.date = "Date is required.";
    if (!formData.invoice.trim()) errors.invoice = "Invoice number is required.";
    if (!formData.pan.trim() || !/^\d{9}$/.test(formData.pan.trim())) errors.pan = "PAN/VAT must be exactly 9 digits.";

    if (formData.items.length === 0) {
      errors.items = "At least one item is required.";
    } else {
      let hasError = false;
      for (const item of formData.items) {
        if (!item.particulars.trim()) hasError = true;
        if (item.amount < 0) hasError = true;
      }
      if (hasError) errors.items = "All items must have particulars and valid amounts.";
    }

    setTxFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTxForm()) return;

    const totalAmount = formData.items.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const totalTax = formData.items.reduce(
      (sum, item) => sum + item.tax,
      0
    );

    const grandTotal = formData.items.reduce(
      (sum, item) => sum + item.grandTotal,
      0
    );
    const particularsStr = formData.items.map(i => i.particulars).filter(Boolean).join(", ");

    if (editingTxId) {
      setTransactions(transactions.map(t => t.id === editingTxId ? {
        ...t,
        type: formData.type,
        date: formData.date,
        invoice: formData.invoice,
        particulars: particularsStr,
        pan: formData.pan,
        amount: totalAmount,
        tax: totalTax,
        grandTotal,
        isImport: formData.isImport,
        isCapitalPurchase: formData.isCapitalPurchase,
        items: formData.items,
      } : t));
    } else {
      const newTx = {
        id: Date.now().toString(),
        type: formData.type,
        date: formData.date,
        invoice: formData.invoice,
        particulars: particularsStr,
        pan: formData.pan,
        amount: totalAmount,
        tax: totalTax,
        grandTotal,
        isImport: formData.isImport,
        isCapitalPurchase: formData.isCapitalPurchase,
        items: formData.items,
      };
      setTransactions([...transactions, newTx]);
    }
    setIsTxModalOpen(false);
    setEditingTxId(null);
    setFormData({ type: "Sales", date: getTodayDate(), invoice: "", pan: "", isImport: false, isCapitalPurchase: false, items: [{ id: "1", particulars: "", amount: 0, vatPercent: 0, tax: 0, grandTotal: 0 }] });
  };

  const handleEditTx = (tx: any) => {
    setEditingTxId(tx.id);
    setFormData({
      type: tx.type,
      date: tx.date,
      invoice: tx.invoice,
      pan: tx.pan,
      isImport: tx.isImport ?? false,
      isCapitalPurchase: tx.isCapitalPurchase ?? false,
      items:
        tx.items && tx.items.length > 0
          ? tx.items
          : [
            {
              id: Date.now().toString(),
              particulars: tx.particulars,
              amount: tx.amount,
              vatPercent: currentVatRate,
              tax: tx.tax,
              grandTotal: tx.amount + tx.tax,
            },
          ],
    });
    setIsTxModalOpen(true);
  };

  const handleItemChange = (
    index: number,
    field: keyof TxItem,
    value: any
  ) => {
    const newItems = [...formData.items];

    const item = {
      ...newItems[index],
      [field]: value,
    };

    const amount =
      Number(field === "amount" ? value : item.amount) || 0;

    const tax = amount * (currentVatRate / 100);

    item.vatPercent = currentVatRate;
    item.tax = Number(tax.toFixed(2));
    item.grandTotal = Number((amount + tax).toFixed(2));

    newItems[index] = item;

    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const updateDate = (newDate: string) => {
    const fy = getFiscalYearFromDate(newDate, fiscalYears);

    const vatRate = fy?.vatAmount ?? 0;

    setFormData((prev) => ({
      ...prev,
      date: newDate,
      items: prev.items.map((item) => {
        const tax = item.amount * (vatRate / 100);

        return {
          ...item,
          vatPercent: vatRate,
          tax: Number(tax.toFixed(2)),
          grandTotal: Number((item.amount + tax).toFixed(2)),
        };
      }),
    }));
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now().toString(),
          particulars: "",
          amount: 0,
          vatPercent: currentVatRate,
          tax: 0,
          grandTotal: 0,
        },
      ],
    }));
  };

  const removeItemRow = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
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
              leftSection={<Plus size={16} />}
              onClick={() => {
                setEditingTxId(null);
                setTxFormErrors({});
                setFormData({ type: "Sales", date: getTodayDate(), invoice: "", pan: "", isImport: false, isCapitalPurchase: false, items: [{ id: "1", particulars: "", amount: 0, vatPercent: 0, tax: 0, grandTotal: 0 }] });
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
          <Title order={3} size="h4">Transactions</Title>
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
        {transactions.length > itemsPerPage && (
          <CommonPagination
            total={Math.ceil(transactions.length / itemsPerPage)}
            value={page}
            onChange={setPage}
          />
        )}
      </Paper>

      <Modal
        opened={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        title={editingTxId ? "Edit Transaction" : "Add Transaction"}
        size="75%"
      >
        <form onSubmit={handleSaveTransaction} noValidate>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
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
              onChange={(e) => updateDate(e.currentTarget.value)}
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
              label="VAT/PAN Number"
              placeholder="9-digit PAN"
              maxLength={9}
              value={formData.pan}
              error={txFormErrors.pan}
              onChange={(e) => txField("pan", e.currentTarget.value.replace(/\D/g, ""))}
            />
          </SimpleGrid>
          <SimpleGrid cols={2} spacing="md" mb="lg">
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

          <Box mb="xl" style={{ overflowX: "auto" }}>
            <Text fw={600} mb="xs">Line Items</Text>
            {txFormErrors.items && <Text c="red" size="sm" mb="xs">{txFormErrors.items}</Text>}
            <Table withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Particulars</Table.Th>
                  <Table.Th style={{ width: 180 }}>Amount</Table.Th>
                  <Table.Th style={{ width: 120 }}>VAT %</Table.Th>
                  <Table.Th style={{ width: 150 }}>VAT Amount</Table.Th>
                  <Table.Th style={{ width: 180 }}>Grand Total</Table.Th>
                  <Table.Th style={{ width: 50 }} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {formData.items.map((item, index) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <TextInput
                        placeholder="Particulars"
                        value={item.particulars}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "particulars",
                            e.currentTarget.value
                          )
                        }
                        variant="unstyled"
                      />
                    </Table.Td>

                    <Table.Td>
                      <NumberInput
                        value={item.amount}
                        min={0}
                        onChange={(v) =>
                          handleItemChange(index, "amount", v)
                        }
                        variant="unstyled"
                        hideControls
                      />
                    </Table.Td>

                    <Table.Td>
                      <NumberInput
                        value={item.vatPercent}
                        readOnly
                        suffix="%"
                        variant="unstyled"
                        hideControls
                      />
                    </Table.Td>

                    <Table.Td>
                      <NumberInput
                        value={item.tax}
                        readOnly
                        variant="unstyled"
                        hideControls
                        styles={{
                          input: {
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Table.Td>

                    <Table.Td>
                      <NumberInput
                        value={item.grandTotal}
                        readOnly
                        variant="unstyled"
                        hideControls
                        styles={{
                          input: {
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Table.Td>

                    <Table.Td>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => removeItemRow(index)}
                        disabled={formData.items.length === 1}
                      >
                        <Trash2 size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr>
                  <Table.Th>
                    <CommonButton
                      variant="subtle"
                      size="xs"
                      leftSection={<Plus size={14} />}
                      onClick={addItemRow}
                    >
                      Add Row
                    </CommonButton>
                  </Table.Th>

                  <Table.Th>
                    {formData.items
                      .reduce((s, i) => s + i.amount, 0)
                      .toLocaleString()}
                  </Table.Th>

                  <Table.Th>{currentVatRate}%</Table.Th>

                  <Table.Th>
                    {formData.items
                      .reduce((s, i) => s + i.tax, 0)
                      .toLocaleString()}
                  </Table.Th>

                  <Table.Th>
                    {formData.items
                      .reduce((s, i) => s + i.grandTotal, 0)
                      .toLocaleString()}
                  </Table.Th>

                  <Table.Th />
                </Table.Tr>
              </Table.Tfoot>
            </Table>
          </Box>

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
