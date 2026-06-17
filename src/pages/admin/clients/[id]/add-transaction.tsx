import React, { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useRouter } from "next/router";
import { Plus, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { UserRolesEnum } from "@/utils/enums/enum";
import {
  Group, Text, Title, Paper, TextInput, Select, Checkbox,
  SimpleGrid, ActionIcon, NumberInput, Box, Table
} from "@mantine/core";
import { CommonButton } from "@/components/common";
import { FiscalYear, getFiscalYearFromDate } from "@/utils/helpers/dateFormatter";

type TxItem = {
  id: string;
  date: string;
  invoice: string;
  pan: string;
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

const getTodayDate = () => new Date().toISOString().split("T")[0];

export default function AddTransaction() {
  const router = useRouter();
  const { id, txId } = router.query;

  const [txFormErrors, setTxFormErrors] = useState<TxErrors>({});
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);

  const [formData, setFormData] = useState({
    type: "Sales",
    isImport: false,
    isCapitalPurchase: false,
    items: [
      {
        id: Date.now().toString(),
        date: getTodayDate(),
        invoice: "",
        pan: "",
        particulars: "",
        amount: 0,
        vatPercent: 0,
        tax: 0,
        grandTotal: 0,
      },
    ] as TxItem[],
  });

  const currentFiscalYear = React.useMemo(
    () => getFiscalYearFromDate(formData.items[0]?.date || getTodayDate(), fiscalYears),
    [formData.items, fiscalYears]
  );

  const currentVatRate = currentFiscalYear?.vatAmount ?? 0;

  useEffect(() => {
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

  useEffect(() => {
    if (txId && typeof txId === "string") {
      const storedTx = localStorage.getItem(`transactions_${id}`);
      if (storedTx) {
        const transactions = JSON.parse(storedTx);
        const existing = transactions.find((t: any) => t.id === txId);
        if (existing) {
          setFormData({
            type: existing.type,
            isImport: existing.isImport || false,
            isCapitalPurchase: existing.isCapitalPurchase || false,
            items: existing.items?.length ? existing.items : [{
              id: Date.now().toString(),
              date: existing.date,
              invoice: existing.invoice,
              pan: existing.pan,
              particulars: existing.particulars,
              amount: existing.amount,
              vatPercent: existing.tax > 0 ? (existing.tax / existing.amount) * 100 : 0,
              tax: existing.tax,
              grandTotal: existing.amount + existing.tax,
            }]
          });
        }
      }
    }
  }, [txId, id]);

  const validateTxForm = (): boolean => {
    const errors: TxErrors = {};
    if (formData.items.length === 0) {
      errors.items = "At least one item is required.";
    } else {
      let hasError = false;
      for (const item of formData.items) {
        if (!item.date) hasError = true;
        if (!item.invoice.trim()) hasError = true;
        if (!item.pan.trim() || !/^\d{9}$/.test(item.pan.trim())) hasError = true;
        if (!item.particulars.trim()) hasError = true;
        if (item.amount < 0) hasError = true;
      }
      if (hasError) errors.items = "All items must have date, invoice, PAN, particulars and valid amounts.";
    }

    setTxFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTxForm()) return;
    
    // In a real application, you'd send this to an API here
    const storedTx = localStorage.getItem(`transactions_${id}`);
    let existingTransactions = storedTx ? JSON.parse(storedTx) : [];
    
    const newTransaction = {
      id: txId && typeof txId === "string" ? txId : Date.now().toString(),
      type: formData.type,
      date: formData.items[0]?.date || getTodayDate(),
      invoice: formData.items[0]?.invoice || "",
      particulars: formData.items.length === 1 ? formData.items[0].particulars : "Multiple Items",
      pan: formData.items[0]?.pan || "",
      amount: formData.items.reduce((s, i) => s + i.amount, 0),
      tax: formData.items.reduce((s, i) => s + i.tax, 0),
      isImport: formData.isImport,
      isCapitalPurchase: formData.isCapitalPurchase,
      items: formData.items,
    };
    
    if (txId && typeof txId === "string") {
      existingTransactions = existingTransactions.map((t: any) => t.id === txId ? newTransaction : t);
    } else {
      existingTransactions = [newTransaction, ...existingTransactions];
    }
    
    localStorage.setItem(`transactions_${id}`, JSON.stringify(existingTransactions));
    
    router.push(`/admin/clients/${id}`);
  };

  const handleItemChange = (
    index: number,
    field: keyof TxItem,
    value: any
  ) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index], [field]: value };

    const vatRate = item.date ? getFiscalYearFromDate(item.date, fiscalYears)?.vatAmount ?? currentVatRate : currentVatRate;
    const amount = Number(field === "amount" ? value : item.amount) || 0;
    const tax = amount * (vatRate / 100);

    item.vatPercent = vatRate;
    item.tax = Number(tax.toFixed(2));
    item.grandTotal = Number((amount + tax).toFixed(2));

    newItems[index] = item;
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now().toString(),
          date: getTodayDate(),
          invoice: "",
          pan: "",
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

  const txField = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <DashboardLayout role={UserRolesEnum.SUPER_ADMIN}>
      <Box mb="xl">
        <CommonButton
          component={Link}
          href={`/admin/clients/${id}`}
          variant="subtle"
          color="var(--muted-foreground)"
          leftSection={<ArrowLeft size={16} />}
          mb="md"
        >
          Back to Client Details
        </CommonButton>
        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={2}>{txId ? "Edit Transaction" : "Add Transaction"}</Title>
          </Box>
        </Group>
      </Box>

      <Paper withBorder radius="md" p="md">
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
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Invoice No.</Table.Th>
                  <Table.Th>PAN/VAT</Table.Th>
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
                        type="date"
                        value={item.date}
                        onChange={(e) =>
                          handleItemChange(index, "date", e.currentTarget.value)
                        }
                        variant="unstyled"
                      />
                    </Table.Td>
                    <Table.Td>
                      <TextInput
                        placeholder="Invoice"
                        value={item.invoice}
                        onChange={(e) =>
                          handleItemChange(index, "invoice", e.currentTarget.value)
                        }
                        variant="unstyled"
                      />
                    </Table.Td>
                    <Table.Td>
                      <TextInput
                        placeholder="PAN"
                        maxLength={9}
                        value={item.pan}
                        onChange={(e) =>
                          handleItemChange(index, "pan", e.currentTarget.value.replace(/\D/g, ""))
                        }
                        variant="unstyled"
                      />
                    </Table.Td>
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
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={item.grandTotal}
                        readOnly
                        variant="unstyled"
                        hideControls
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
                  <Table.Th colSpan={4}>
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
                  <Table.Th />
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
            <CommonButton variant="default" onClick={() => router.push(`/admin/clients/${id}`)}>Cancel</CommonButton>
            <CommonButton type="submit">Save Transaction</CommonButton>
          </Group>
        </form>
      </Paper>
    </DashboardLayout>
  );
}
