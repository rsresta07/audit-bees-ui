import React, { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import Link from "next/link";
import { Plus, Eye, Edit, Trash2, RefreshCw, Users, CalendarDays, CalendarRange, AlertCircle } from "lucide-react";
import { UserRolesEnum } from "@/utils/enums/enum";
import {
  Group, Text, Paper, TextInput, Select, Tooltip,
  Modal, SimpleGrid, ActionIcon, PasswordInput, Flex, Table
} from "@mantine/core";
import { CommonHeading, CommonSearch, CommonFilter, CommonTable, CommonButton, CommonPagination } from "@/components/common";

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

export default function AdminClients() {
  const [clients, setClients] = useState([
    { id: "1", name: "Acme Corp", pan: "123456789", address: "Kathmandu", vatPeriod: "Monthly" },
    { id: "2", name: "Global Tech", pan: "987654321", address: "Pokhara", vatPeriod: "Trimester" },
  ]);

  const [search, setSearch] = useState("");
  const [vatFilter, setVatFilter] = useState<string | null>("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", pan: "", address: "", password: "", vatPeriod: "Monthly" });
  const [formErrors, setFormErrors] = useState<ClientErrors>({});
  const [filingPeriods, setFilingPeriods] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
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

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.pan.includes(search) ||
      c.address.toLowerCase().includes(search.toLowerCase());
    const matchesVat = vatFilter ? c.vatPeriod === vatFilter : true;
    return matchesSearch && matchesVat;
  });

  useEffect(() => {
    setPage(1);
  }, [search, vatFilter]);

  const paginatedClients = filteredClients.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const validateClientForm = (): boolean => {
    const errors: ClientErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2)
      errors.name = "Name must be at least 2 characters.";
    if (!formData.pan.trim() || !/^\d{9}$/.test(formData.pan.trim()))
      errors.pan = "PAN must be exactly 9 digits.";
    if (!formData.address.trim() || formData.address.trim().length < 3)
      errors.address = "Address must be at least 3 characters.";
    if (!editingClientId && formData.password.length < 8)
      errors.password = "Password must be at least 8 characters.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormErrors({});
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateClientForm()) return;
    if (editingClientId) {
      setClients(clients.map(c => c.id === editingClientId ? {
        ...c, name: formData.name, pan: formData.pan, address: formData.address, vatPeriod: formData.vatPeriod,
      } : c));
    } else {
      setClients([...clients, {
        id: Date.now().toString(),
        name: formData.name, pan: formData.pan, address: formData.address, vatPeriod: formData.vatPeriod,
      }]);
    }
    closeModal();
    setEditingClientId(null);
    setFormData({ name: "", pan: "", address: "", password: "", vatPeriod: "Monthly" });
  };

  const handleEditClient = (client: any) => {
    setEditingClientId(client.id);
    setFormData({ name: client.name, pan: client.pan, address: client.address, password: "", vatPeriod: client.vatPeriod });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const field = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setFormErrors(prev => ({ ...prev, [key]: undefined }));
  };

  return (
    <DashboardLayout role={UserRolesEnum.SUPER_ADMIN}>
      <Group justify="space-between" mb="lg">
        <CommonHeading title="Clients" />
        <CommonButton
          leftSection={<Plus size={16} />}
          onClick={() => {
            setEditingClientId(null);
            setFormData({ name: "", pan: "", address: "", password: "", vatPeriod: "Monthly" });
            setFormErrors({});
            setIsModalOpen(true);
          }}
        >
          Add Client
        </CommonButton>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="center" mb="xs">
            <Text size="sm" c="var(--muted-foreground)" fw={500}>Total Clients</Text>
            <Users size={18} color="var(--muted-foreground)" />
          </Group>
          <Text size="xl" fw={700}>{clients.length}</Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="center" mb="xs">
            <Text size="sm" c="var(--muted-foreground)" fw={500}>Monthly Filings</Text>
            <CalendarDays size={18} color="var(--muted-foreground)" />
          </Group>
          <Text size="xl" fw={700}>{clients.filter(c => c.vatPeriod === "Monthly").length}</Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="center" mb="xs">
            <Text size="sm" c="var(--muted-foreground)" fw={500}>Trimester Filings</Text>
            <CalendarRange size={18} color="var(--muted-foreground)" />
          </Group>
          <Text size="xl" fw={700}>{clients.filter(c => c.vatPeriod === "Trimester").length}</Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" align="center" mb="xs">
            <Text size="sm" c="var(--muted-foreground)" fw={500}>Pending This Month</Text>
            <AlertCircle size={18} color="var(--chart-3)" />
          </Group>
          <Text size="xl" fw={700} c="orange">12</Text>
        </Paper>
      </SimpleGrid>

      <Paper withBorder p="md" mb="lg" radius="md">
        <Flex gap="md" justify="space-between" direction={{ base: 'column', md: 'row' }}>
          <CommonSearch
            placeholder="Search by Name, PAN, or Address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <CommonFilter
            label="Filter by VAT Period:"
            value={vatFilter || ""}
            onChange={setVatFilter}
            allLabel="All VAT Periods"
            options={filingPeriods.map(p => ({ label: p.name, value: p.name }))}
          />
        </Flex>
      </Paper>

      <Paper withBorder radius="md">
        <CommonTable
          headers={["Name", "PAN Number", "Address", "VAT Period", "Actions"]}
          isEmpty={paginatedClients.length === 0}
          emptyMessage="No clients found."
        >
          {paginatedClients.map((client) => (
            <Table.Tr key={client.id}>
              <Table.Td><Text fw={500}>{client.name}</Text></Table.Td>
              <Table.Td>{client.pan}</Table.Td>
              <Table.Td>{client.address}</Table.Td>
              <Table.Td>{client.vatPeriod}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon component={Link} href={`/admin/clients/${client.id}`} variant="light" color="var(--primary)">
                    <Eye size={16} />
                  </ActionIcon>
                  <ActionIcon variant="light" color="var(--chart-3)" onClick={() => handleEditClient(client)}>
                    <Edit size={16} />
                  </ActionIcon>
                  <ActionIcon variant="light" color="var(--destructive)" onClick={() => handleDelete(client.id)}>
                    <Trash2 size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </CommonTable>
        {filteredClients.length > itemsPerPage && (
          <CommonPagination 
            total={Math.ceil(filteredClients.length / itemsPerPage)} 
            value={page} 
            onChange={setPage} 
          />
        )}
      </Paper>

      <Modal opened={isModalOpen} onClose={closeModal} title={editingClientId ? "Edit Client" : "Add Client"}>
        <form onSubmit={handleSaveClient} noValidate>
          <TextInput
            required
            label="Name"
            mb="sm"
            placeholder="e.g. Acme Corp"
            value={formData.name}
            error={formErrors.name}
            onChange={(e) => field("name", e.currentTarget.value)}
          />
          <TextInput
            required
            label="PAN Number"
            mb="sm"
            placeholder="9-digit PAN (e.g. 123456789)"
            maxLength={9}
            value={formData.pan}
            error={formErrors.pan}
            onChange={(e) => field("pan", e.currentTarget.value.replace(/\D/g, ""))}
          />
          <TextInput
            required
            label="Address"
            mb="sm"
            placeholder="e.g. Kathmandu"
            value={formData.address}
            error={formErrors.address}
            onChange={(e) => field("address", e.currentTarget.value)}
          />

          {/* Password row with generate button */}
          <Group align="flex-start" mb="sm" gap="xs" wrap="nowrap">
            <PasswordInput
              required={!editingClientId}
              label={`Password${editingClientId ? " (leave blank to keep current)" : ""}`}
              placeholder="Min. 8 characters"
              style={{ flex: 1 }}
              value={formData.password}
              error={formErrors.password}
              onChange={(e) => field("password", e.currentTarget.value)}
            />
            <Tooltip label="Generate 12-character random password" position="top">
              <ActionIcon
                variant="light"
                color="var(--primary)"
                size={36}
                mt={25}
                onClick={() => {
                  field("password", generateRandomPassword());
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
            value={formData.vatPeriod}
            onChange={(val) => setFormData({ ...formData, vatPeriod: val || "Monthly" })}
          />
          <Group justify="flex-end">
            <CommonButton variant="default" onClick={closeModal}>Cancel</CommonButton>
            <CommonButton type="submit">Save</CommonButton>
          </Group>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
