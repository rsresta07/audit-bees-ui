import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";

export const logoutUser = () => {
  deleteCookie("token");
  deleteCookie("role");
  deleteCookie("username");
  deleteCookie("user");
  window.location.replace("/login");
};
