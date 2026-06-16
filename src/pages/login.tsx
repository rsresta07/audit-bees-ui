import React, { useState } from "react";
import { setCookie } from "cookies-next";
import { useRouter } from "next/router";
import { UserRolesEnum } from "@/utils/enums/enum";
import { TextInput, PasswordInput, Button, Paper, Title, Container, Center } from "@mantine/core";
import { ShieldCheck } from "lucide-react";

export default function Login() {
  const [panNumber, setPanNumber] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login logic
    let role = UserRolesEnum.CLIENT;
    if (panNumber.toLowerCase().includes("admin")) {
      role = UserRolesEnum.SUPER_ADMIN;
    }

    // Set mock token and role
    setCookie("token", "mock-jwt-token", { maxAge: 60 * 60 * 24 });
    setCookie("role", role, { maxAge: 60 * 60 * 24 });

    if (role === UserRolesEnum.SUPER_ADMIN) {
      router.push("/admin/clients");
    } else {
      router.push("/client/dashboard");
    }
  };

  return (
    <Container size={420} my={40}>
      <Center mt={100} mb={30}>
        <ShieldCheck size={40} color="var(--primary)" />
      </Center>
      <Title ta="center" order={2}>
        Sign in to Audit Bees
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleLogin}>
          <TextInput
            label="PAN Number / Admin Username"
            placeholder="Enter your PAN number"
            required
            value={panNumber}
            onChange={(e) => setPanNumber(e.currentTarget.value)}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
          <Button fullWidth mt="xl" type="submit">
            Sign In
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

