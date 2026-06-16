import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { UserRolesEnum } from "@/utils/enums/enum";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Title, Text, Box, SimpleGrid, Paper, Group, Table, Center } from "@mantine/core";
import { CommonHeading, CommonTable } from "@/components/common";

export default function AdminReports() {
  // Mock data for reports
  const stats = [
    { label: "Total Revenue", value: "Rs. 2.4M", change: "+12.5%", trend: "up" },
    { label: "Active Clients", value: "45", change: "+5.2%", trend: "up" },
    { label: "Pending Returns", value: "12", change: "-2.4%", trend: "down" },
    { label: "Total Transactions", value: "1,240", change: "+18.1%", trend: "up" },
  ];

  return (
    <DashboardLayout role={UserRolesEnum.SUPER_ADMIN}>
      <CommonHeading 
        title="Reports & Analytics" 
        description="Overview of system performance and audit metrics." 
      />

      <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="lg" mb="xl">
        {stats.map((stat, i) => (
          <Paper key={i} withBorder p="md" radius="md">
            <Text size="sm" c="var(--muted-foreground)" fw={500}>{stat.label}</Text>
            <Group align="flex-end" gap="xs" mt={5}>
              <Text size="xl" fw={700}>{stat.value}</Text>
              <Text 
                size="sm" 
                fw={500} 
                c={stat.trend === 'up' ? 'var(--chart-1)' : 'var(--destructive)'}
                display="flex"
                style={{ alignItems: 'center' }}
              >
                {stat.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {stat.change}
              </Text>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        {/* Placeholder for a chart */}
        <Paper withBorder p="md" radius="md">
          <Title order={3} size="h4" mb="md">Revenue Over Time</Title>
          <Box h={250} style={{ border: '1px dashed var(--mantine-color-default-border)', borderRadius: 'var(--mantine-radius-md)' }}>
            <Center h="100%">
              <Group gap="xs" c="var(--muted-foreground)">
                <TrendingUp size={20} />
                <Text>Chart Area</Text>
              </Group>
            </Center>
          </Box>
        </Paper>

        {/* Top Clients Table */}
        <Paper withBorder p="md" radius="md">
          <Title order={3} size="h4" mb="md">Top Clients by Volume</Title>
          <CommonTable
            headers={["Client Name", "Transactions", "Total Value"]}
            isEmpty={false}
          >
            <Table.Tr>
              <Table.Td>Acme Corp</Table.Td>
              <Table.Td>145</Table.Td>
              <Table.Td>Rs. 450,000</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Global Tech</Table.Td>
              <Table.Td>92</Table.Td>
              <Table.Td>Rs. 280,000</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Everest Supplies</Table.Td>
              <Table.Td>56</Table.Td>
              <Table.Td>Rs. 125,000</Table.Td>
            </Table.Tr>
          </CommonTable>
        </Paper>
      </SimpleGrid>
    </DashboardLayout>
  );
}
