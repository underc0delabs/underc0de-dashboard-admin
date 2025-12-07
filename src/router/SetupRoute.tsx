import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { RolesEnum } from "@/constants/rolesEnum";
import { Center, Loader } from "@mantine/core";

interface SetupRouteProps {
  readonly children: React.ReactNode;
}

export function SetupRoute({ children }: SetupRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Center h="100vh" bg="dark.9">
        <Loader color="white" size="lg" />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role.toLowerCase();
  const isAdmin = userRole === RolesEnum.ADMIN_ROLE.toLowerCase();
  const isEditor = userRole === RolesEnum.USER_EDITOR.toLowerCase();

  if (!isAdmin && !isEditor) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
