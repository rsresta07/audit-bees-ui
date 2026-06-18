"use client";
import React, { ReactNode } from "react";
import { AppShell, Burger, Group, NavLink, Text, Button, ActionIcon, useMantineColorScheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useRouter } from "next/router";
import { deleteCookie } from "cookies-next";
import { UserRolesEnum } from "@/utils/enums/enum";
import { Users, FileText, Settings, LogOut, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

interface LayoutProps {
  children: ReactNode;
  role: UserRolesEnum.SUPER_ADMIN | UserRolesEnum.CLIENT;
}

export default function DashboardLayout({ children, role }: LayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const handleLogout = () => {
    deleteCookie("token");
    deleteCookie("role");
    router.push("/login");
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = role === UserRolesEnum.SUPER_ADMIN
    ? [
      { label: "Clients", href: "/admin/clients", icon: <Users size={20} /> },
      { label: "All Transactions", href: "/admin/transactions", icon: <FileText size={20} /> },
      { label: "Reports", href: "/admin/reports", icon: <FileText size={20} /> },
      { label: "Settings", href: "/admin/settings", icon: <Settings size={20} /> },
    ]
    : [
      { label: "My Transactions", href: "/client/dashboard", icon: <FileText size={20} /> },
    ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700} size="lg">Audit Bees</Text>
          </Group>
          <Group>
            <Text size="sm" c="var(--muted-foreground)" visibleFrom="sm">{role} Portal</Text>
            <ActionIcon
              variant="default"
              onClick={() => toggleColorScheme()}
              size="lg"
              aria-label="Toggle color scheme"
            >
              {mounted &&
                (colorScheme === "dark" ? (
                  <Sun size={18} />
                ) : (
                  <Moon size={18} />
                ))}
            </ActionIcon>
            <Button variant="subtle" color="var(--destructive)" leftSection={<LogOut size={18} />} onClick={handleLogout}>
              Logout
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              component={Link}
              href={item.href}
              label={item.label}
              leftSection={item.icon}
              active={router.pathname.startsWith(item.href)}
              variant="light"
              mb="sm"
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            />
          ))}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
