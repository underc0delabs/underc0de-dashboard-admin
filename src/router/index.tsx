import { createBrowserRouter, Navigate, RouterProvider, Outlet } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { SetupRoute } from "./SetupRoute";
import { RoleBasedRoute } from "./RoleBasedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import Login from "@/modules/login/views/Login";
import Dashboard from "@/modules/dashboard/views/Dashboard";
import Users from "@/modules/appUsers/views/Users";
import Commerces from "@/modules/commerces/views/Commerces";
import { RolesEnum } from "@/constants/rolesEnum";
import AdminUsers from "@/modules/adminUsers/views/AdminUsers";
import Notifications from "@/modules/notifications/views/Notifications";
import Environments from "@/modules/environments/views/Environments";
import { routes } from "@/constants/routes";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <SetupRoute>
        <ProtectedRoute>
          <MainLayout>
            <Outlet />
          </MainLayout>
        </ProtectedRoute>
      </SetupRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { 
        path: routes.users, 
        element: (
          <RoleBasedRoute allowedRoles={[RolesEnum.ADMIN_ROLE, RolesEnum.USER_EDITOR]}>
            <Users />
          </RoleBasedRoute>
        )
      },
      { 
        path: routes.commerces, 
        element: (  
          <RoleBasedRoute allowedRoles={[RolesEnum.ADMIN_ROLE, RolesEnum.USER_EDITOR]}>
            <Commerces />
          </RoleBasedRoute>
        )
      },
      { path: routes.adminUsers, element: (
        <RoleBasedRoute allowedRoles={[RolesEnum.ADMIN_ROLE]}>
          <AdminUsers />
        </RoleBasedRoute>
      ) },  
      {
        path: routes.notifications, 
        element: (
          <RoleBasedRoute allowedRoles={[RolesEnum.ADMIN_ROLE]}>
            <Notifications />
          </RoleBasedRoute>
        )
      },
      {
        path: routes.environments,
        element: (
          <RoleBasedRoute allowedRoles={[RolesEnum.ADMIN_ROLE]}>
            <Environments />
          </RoleBasedRoute>
        )
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export const Router = () => {
  return <RouterProvider router={router} />;
};
