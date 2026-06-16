import React, { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Plus, Trash2 } from "lucide-react";
import { UserRolesEnum } from "@/utils/enums/enum";
import { 
  Title, Text, Paper, SimpleGrid, TextInput, NumberInput, 
  Button, Group, ActionIcon, List, ThemeIcon, Box, Divider
} from "@mantine/core";

export default function SettingsPage() {
  const [filingPeriods, setFilingPeriods] = useState<{id: string, name: string}[]>([]);
  const [newPeriod, setNewPeriod] = useState("");

  const [fiscalYears, setFiscalYears] = useState<{id: string, year: string, vatAmount: number}[]>([]);
  const [newFiscalYear, setNewFiscalYear] = useState({ year: "", vatAmount: "" });

  React.useEffect(() => {
    const storedPeriods = localStorage.getItem("filingPeriods");
    if (storedPeriods) {
      setFilingPeriods(JSON.parse(storedPeriods));
    } else {
      const initial = [
        { id: "1", name: "Monthly" },
        { id: "2", name: "Trimester" },
      ];
      setFilingPeriods(initial);
      localStorage.setItem("filingPeriods", JSON.stringify(initial));
    }

    const storedFiscalYears = localStorage.getItem("fiscalYears");
    if (storedFiscalYears) {
      setFiscalYears(JSON.parse(storedFiscalYears));
    } else {
      const initial = [
        { id: "1", year: "2080/81", vatAmount: 13 },
        { id: "2", year: "2081/82", vatAmount: 13 },
      ];
      setFiscalYears(initial);
      localStorage.setItem("fiscalYears", JSON.stringify(initial));
    }
  }, []);

  const saveFilingPeriods = (periods: typeof filingPeriods) => {
    setFilingPeriods(periods);
    localStorage.setItem("filingPeriods", JSON.stringify(periods));
  };

  const saveFiscalYears = (years: typeof fiscalYears) => {
    setFiscalYears(years);
    localStorage.setItem("fiscalYears", JSON.stringify(years));
  };

  const handleAddPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriod) return;
    saveFilingPeriods([...filingPeriods, { id: Date.now().toString(), name: newPeriod }]);
    setNewPeriod("");
  };

  const handleDeletePeriod = (id: string) => {
    saveFilingPeriods(filingPeriods.filter(p => p.id !== id));
  };

  const handleAddFiscalYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFiscalYear.year || !newFiscalYear.vatAmount) return;
    saveFiscalYears([...fiscalYears, { 
      id: Date.now().toString(), 
      year: newFiscalYear.year, 
      vatAmount: parseFloat(newFiscalYear.vatAmount) 
    }]);
    setNewFiscalYear({ year: "", vatAmount: "" });
  };

  const handleDeleteFiscalYear = (id: string) => {
    saveFiscalYears(fiscalYears.filter(p => p.id !== id));
  };

  return (
    <DashboardLayout role={UserRolesEnum.SUPER_ADMIN}>
      <Box mb="xl">
        <Title order={2}>Settings</Title>
        <Text c="var(--muted-foreground)">Manage filing periods and fiscal years.</Text>
      </Box>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {/* Filing Periods */}
        <Paper withBorder p="md" radius="md">
          <Title order={3} size="h5" mb="md">VAT Filing Periods</Title>
          
          <form onSubmit={handleAddPeriod}>
            <Group align="flex-end" mb="xl">
              <TextInput 
                placeholder="e.g. Bi-monthly" 
                label="New Period"
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.currentTarget.value)}
                style={{ flex: 1 }}
                required
              />
              <Button type="submit" leftSection={<Plus size={16} />}>
                Add
              </Button>
            </Group>
          </form>

          <List spacing="sm" size="sm" center>
            {filingPeriods.map((period, index) => (
              <React.Fragment key={period.id}>
                <List.Item
                  icon={
                    <ThemeIcon color="var(--primary)" size={24} radius="xl" variant="light">
                      <Text size="xs" fw={700}>{index + 1}</Text>
                    </ThemeIcon>
                  }
                >
                  <Group justify="space-between">
                    <Text fw={500}>{period.name}</Text>
                    <ActionIcon 
                      variant="subtle" 
                      color="var(--destructive)" 
                      onClick={() => handleDeletePeriod(period.id)}
                    >
                      <Trash2 size={16} />
                    </ActionIcon>
                  </Group>
                </List.Item>
                {index < filingPeriods.length - 1 && <Divider my="xs" />}
              </React.Fragment>
            ))}
          </List>
          {filingPeriods.length === 0 && (
            <Text c="var(--muted-foreground)" ta="center" py="sm">No filing periods added yet.</Text>
          )}
        </Paper>

        {/* Fiscal Years */}
        <Paper withBorder p="md" radius="md">
          <Title order={3} size="h5" mb="md">Fiscal Years & VAT Amount</Title>
          
          <form onSubmit={handleAddFiscalYear}>
            <Group align="flex-end" mb="xl">
              <TextInput 
                placeholder="e.g. 2081/82" 
                label="Year"
                value={newFiscalYear.year}
                onChange={(e) => setNewFiscalYear({...newFiscalYear, year: e.currentTarget.value})}
                style={{ flex: 1 }}
                required
              />
              <NumberInput 
                placeholder="VAT %" 
                label="VAT %"
                min={0}
                max={100}
                value={newFiscalYear.vatAmount ? Number(newFiscalYear.vatAmount) : ''}
                onChange={(val) => setNewFiscalYear({...newFiscalYear, vatAmount: val.toString()})}
                style={{ width: 100 }}
                required
              />
              <Button type="submit" leftSection={<Plus size={16} />}>
                Add
              </Button>
            </Group>
          </form>

          <List spacing="sm" size="sm" center>
            {fiscalYears.map((fy, index) => (
              <React.Fragment key={fy.id}>
                <List.Item
                  icon={
                    <ThemeIcon color="var(--chart-1)" size={24} radius="xl" variant="light">
                      <Text size="xs" fw={700}>{index + 1}</Text>
                    </ThemeIcon>
                  }
                >
                  <Group justify="space-between">
                    <Box>
                      <Text fw={500}>{fy.year}</Text>
                      <Text size="xs" c="var(--muted-foreground)">VAT: {fy.vatAmount}%</Text>
                    </Box>
                    <ActionIcon 
                      variant="subtle" 
                      color="var(--destructive)" 
                      onClick={() => handleDeleteFiscalYear(fy.id)}
                    >
                      <Trash2 size={16} />
                    </ActionIcon>
                  </Group>
                </List.Item>
                {index < fiscalYears.length - 1 && <Divider my="xs" />}
              </React.Fragment>
            ))}
          </List>
          {fiscalYears.length === 0 && (
            <Text c="var(--muted-foreground)" ta="center" py="sm">No fiscal years added yet.</Text>
          )}
        </Paper>
      </SimpleGrid>
    </DashboardLayout>
  );
}
