import { useEffect } from "react";
import { useRouter } from "next/router";
import { getCookie } from "cookies-next";
import { UserRolesEnum } from "@/utils/enums/enum";
import { Center, Title, Text, Stack } from "@mantine/core";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const role = getCookie("role");
    if (role === UserRolesEnum.SUPER_ADMIN) {
      router.push("/admin/clients");
    } else if (role === "CLIENT") {
      router.push("/client/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <Center h="100vh">
      <Stack align="center">
        <Title order={1}>Welcome to Audit Bees</Title>
        <Text c="var(--muted-foreground)">Redirecting...</Text>
      </Stack>
    </Center>
  );
}

