import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export const useAuth = (allowedRoles = []) => {
  const router = useRouter();

  useEffect(() => {
    const token = getCookie("token");
    const userRole = getCookie("role");

    if (!userRole) {
      // Redirect to login if token or role is missing
      router.push("/login");
      return;
    }

    // Check if user role is allowed
    if (!allowedRoles.includes(userRole)) {
      // Redirect to unauthorized page
      router.push("/");
      return;
    }

    // Token and role are valid, continue to the dashboard
  }, [allowedRoles, router]);

  return;
};
