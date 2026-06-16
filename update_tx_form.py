import re

with open("src/pages/admin/clients/[id].tsx", "r") as f:
    content = f.read()

# 1. Add TxItem type and update TxErrors
type_def = """type TxItem = {
  id: string;
  particulars: string;
  untaxable: number;
  taxable: number;
  tax: number;
  total: number;
};

type TxErrors = {
  date?: string;
  invoice?: string;
  pan?: string;
  items?: string;
};"""
content = re.sub(r'type TxErrors = \{.*?\};', type_def, content, flags=re.DOTALL)

# 2. Update initial transactions
init_txs = """const [transactions, setTransactions] = useState([
    { 
      id: "1", type: "Sales", date: "2024-03-15", invoice: "INV-100", 
      particulars: "Website Dev", pan: "12345", amount: 50000, tax: 6500, 
      isImport: false, isCapitalPurchase: false,
      items: [{ id: "1-1", particulars: "Website Dev", untaxable: 0, taxable: 50000, tax: 6500, total: 56500 }]
    },
    { 
      id: "2", type: "Purchase", date: "2024-03-18", invoice: "PUR-20", 
      particulars: "Office Supplies", pan: "98765", amount: 10000, tax: 1300, 
      isImport: false, isCapitalPurchase: false,
      items: [{ id: "2-1", particulars: "Office Supplies", untaxable: 0, taxable: 10000, tax: 1300, total: 11300 }]
    },
  ]);"""
content = re.sub(r'const \[transactions, setTransactions\] = useState\(\[.*?\]\);', init_txs, content, flags=re.DOTALL)

# 3. Update formData initialization
form_data = """const [formData, setFormData] = useState({
    type: "Sales", date: getTodayDate(), invoice: "", pan: "", isImport: false, isCapitalPurchase: false,
    items: [{ id: "1", particulars: "", untaxable: 0, taxable: 0, tax: 0, total: 0 }] as TxItem[]
  });"""
content = re.sub(r'const \[formData, setFormData\] = useState\(\{(?:.|\n)*?isCapitalPurchase: false\n\s*\}\);', form_data, content)

# 4. Update validateTxForm
val_tx = """const validateTxForm = (): boolean => {
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
        if (item.untaxable < 0 || item.taxable < 0 || item.tax < 0) hasError = true;
      }
      if (hasError) errors.items = "All items must have particulars and valid amounts.";
    }

    setTxFormErrors(errors);
    return Object.keys(errors).length === 0;
  };"""
content = re.sub(r'const validateTxForm = \(\): boolean => \{.*?return Object.keys\(errors\).length === 0;\n\s*\};', val_tx, content, flags=re.DOTALL)


# 5. Update handleSaveTransaction
save_tx = """const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTxForm()) return;

    const totalAmount = formData.items.reduce((sum, item) => sum + item.untaxable + item.taxable, 0);
    const totalTax = formData.items.reduce((sum, item) => sum + item.tax, 0);
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
        isImport: formData.isImport,
        isCapitalPurchase: formData.isCapitalPurchase,
        items: formData.items,
      };
      setTransactions([...transactions, newTx]);
    }
    setIsTxModalOpen(false);
    setEditingTxId(null);
    setFormData({ type: "Sales", date: getTodayDate(), invoice: "", pan: "", isImport: false, isCapitalPurchase: false, items: [{ id: "1", particulars: "", untaxable: 0, taxable: 0, tax: 0, total: 0 }] });
  };"""
content = re.sub(r'const handleSaveTransaction = \(e: React\.FormEvent\) => \{.*?setFormData\(\{ type: "Sales".*?\}\);\n\s*\};', save_tx, content, flags=re.DOTALL)


# 6. Update handleEditTx
edit_tx = """const handleEditTx = (tx: any) => {
    setEditingTxId(tx.id);
    setFormData({
      type: tx.type,
      date: tx.date,
      invoice: tx.invoice,
      pan: tx.pan,
      isImport: tx.isImport ?? false,
      isCapitalPurchase: tx.isCapitalPurchase ?? false,
      items: tx.items && tx.items.length > 0 ? tx.items : [{
        id: Date.now().toString(), particulars: tx.particulars, untaxable: 0, taxable: tx.amount, tax: tx.tax, total: tx.amount + tx.tax
      }],
    });
    setIsTxModalOpen(true);
  };"""
content = re.sub(r'const handleEditTx = \(tx: any\) => \{.*?setIsTxModalOpen\(true\);\n\s*\};', edit_tx, content, flags=re.DOTALL)

# Add line item helpers just before handleSaveClient
helpers = """const handleItemChange = (index: number, field: keyof TxItem, value: any) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index], [field]: value };
    
    // Auto calculate
    if (field === "taxable" || field === "untaxable") {
      const taxableNum = field === "taxable" ? Number(value) : item.taxable;
      const untaxableNum = field === "untaxable" ? Number(value) : item.untaxable;
      item.tax = taxableNum * 0.13;
      item.total = taxableNum + untaxableNum + item.tax;
    } else if (field === "tax") {
      const taxNum = Number(value);
      item.total = item.taxable + item.untaxable + taxNum;
    }
    
    newItems[index] = item;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), particulars: "", untaxable: 0, taxable: 0, tax: 0, total: 0 }]
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

  const validateClientForm"""
content = content.replace("const validateClientForm", helpers)

# Update "Add Transaction" onClick
add_tx_btn = """onClick={() => {
                setEditingTxId(null);
                setTxFormErrors({});
                setFormData({ type: "Sales", date: getTodayDate(), invoice: "", pan: "", isImport: false, isCapitalPurchase: false, items: [{ id: "1", particulars: "", untaxable: 0, taxable: 0, tax: 0, total: 0 }] });
                setIsTxModalOpen(true);
              }}"""
content = re.sub(r'onClick=\{\(\) => \{\s*setEditingTxId\(null\);\s*setTxFormErrors\(\{\}\);\s*setFormData\(\{ type: "Sales".*?\}\);\s*setIsTxModalOpen\(true\);\s*\}\}', add_tx_btn, content, flags=re.DOTALL)


# Update Modal body
modal_body = """<Modal
        opened={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        title={editingTxId ? "Edit Transaction" : "Add Transaction"}
        size="70%"
      >
        <form onSubmit={handleSaveTransaction} noValidate>
          <SimpleGrid cols={4} spacing="md" mb="md">
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

          <Box mb="md" style={{ overflowX: "auto" }}>
            <Text fw={600} mb="xs">Line Items</Text>
            {txFormErrors.items && <Text c="red" size="sm" mb="xs">{txFormErrors.items}</Text>}
            <Table withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Particulars</Table.Th>
                  <Table.Th style={{ width: 150 }}>Untaxable Amt</Table.Th>
                  <Table.Th style={{ width: 150 }}>Taxable Amt</Table.Th>
                  <Table.Th style={{ width: 120 }}>Tax (13%)</Table.Th>
                  <Table.Th style={{ width: 150 }}>Total</Table.Th>
                  <Table.Th style={{ width: 50 }}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {formData.items.map((item, index) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <TextInput 
                        placeholder="Particulars" 
                        value={item.particulars}
                        onChange={(e) => handleItemChange(index, 'particulars', e.currentTarget.value)}
                        required
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput 
                        value={item.untaxable}
                        min={0}
                        onChange={(v) => handleItemChange(index, 'untaxable', v)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput 
                        value={item.taxable}
                        min={0}
                        onChange={(v) => handleItemChange(index, 'taxable', v)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput 
                        value={item.tax}
                        min={0}
                        onChange={(v) => handleItemChange(index, 'tax', v)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput 
                        value={item.total}
                        readOnly
                        variant="filled"
                      />
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon color="red" variant="subtle" onClick={() => removeItemRow(index)} disabled={formData.items.length === 1}>
                        <Trash2 size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr>
                  <Table.Th>
                    <CommonButton variant="subtle" size="xs" leftSection={<Plus size={14} />} onClick={addItemRow}>
                      Add Row
                    </CommonButton>
                  </Table.Th>
                  <Table.Th>
                    {formData.items.reduce((s, i) => s + i.untaxable, 0).toLocaleString()}
                  </Table.Th>
                  <Table.Th>
                    {formData.items.reduce((s, i) => s + i.taxable, 0).toLocaleString()}
                  </Table.Th>
                  <Table.Th>
                    {formData.items.reduce((s, i) => s + i.tax, 0).toLocaleString()}
                  </Table.Th>
                  <Table.Th>
                    {formData.items.reduce((s, i) => s + i.total, 0).toLocaleString()}
                  </Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Tfoot>
            </Table>
          </Box>

          <Group justify="flex-end">
            <CommonButton variant="default" onClick={() => setIsTxModalOpen(false)}>Cancel</CommonButton>
            <CommonButton type="submit">Save Transaction</CommonButton>
          </Group>
        </form>
      </Modal>"""

content = re.sub(r'<Modal\s+opened=\{isTxModalOpen\}.*?</Modal>', modal_body, content, flags=re.DOTALL)

with open("src/pages/admin/clients/[id].tsx", "w") as f:
    f.write(content)

print("Updated [id].tsx successfully!")
