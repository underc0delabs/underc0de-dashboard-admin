import { createBrowserRouter, Navigate, RouterProvider, Outlet } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { SetupRoute } from "./SetupRoute";
import { RoleBasedRoute } from "./RoleBasedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import Login from "@/modules/login/views/Login";
import Dashboard from "@/modules/dashboard/views/Dashboard";
import Users from "@/modules/appUsers/views/Users";
import MemberProvisioning from "@/modules/appUsers/views/MemberProvisioning";
import Commerces from "@/modules/commerces/views/Commerces";
import Categories from "@/modules/categories/views/Categories";
import { RolesEnum } from "@/constants/rolesEnum";
import AdminUsers from "@/modules/adminUsers/views/AdminUsers";
import Notifications from "@/modules/notifications/views/Notifications";
import Environments from "@/modules/environments/views/Environments";
import Raffles from "@/modules/raffles/views/Raffles";
import Bingo from "@/modules/bingo/views/Bingo";
import Events from "@/modules/events/views/Events";
import BirthdayCalendar from "@/modules/birthdayCalendar/views/BirthdayCalendar";
import Profile from "@/modules/profile/views/Profile";
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
        path: routes.userMemberProvision,
        element: (
          <RoleBasedRoute allowedRoles={[RolesEnum.ADMIN_ROLE]}>
            <MemberProvisioning />
          </RoleBasedRoute>
        ),
      },
      { 
        path: routes.commerces, 
        element: (  
          <RoleBasedRoute allowedRoles={[RolesEnum.ADMIN_ROLE, RolesEnum.USER_EDITOR]}>
            <Commerces />
          </RoleBasedRoute>
        )
      },
      {
        path: routes.categories,
        element: (
          <RoleBasedRoute allowedRoles={[RolesEnum.ADMIN_ROLE, RolesEnum.USER_EDITOR]}>
            <Categories />
          </RoleBasedRoute>
        ),
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
        path: routes.raffles,
        element: (
          <RoleBasedRoute allowedRoles={[RolesEnum.ADMIN_ROLE, RolesEnum.USER_EDITOR]}>
            <Raffles />
          </RoleBasedRoute>
        ),
      },
      {
        path: routes.bingo,
        element: (
          <RoleBasedRoute allowedRoles={[RolesEnum.ADMIN_ROLE, RolesEnum.USER_EDITOR]}>
            <Bingo />
          </RoleBasedRoute>
        ),
      },
      {
        path: routes.events,
        element: (
          <RoleBasedRoute allowedRoles={[RolesEnum.ADMIN_ROLE, RolesEnum.USER_EDITOR]}>
            <Events />
          </RoleBasedRoute>
        ),
      },
      {
        path: routes.birthdayCalendar,
        element: (
          <RoleBasedRoute allowedRoles={[RolesEnum.ADMIN_ROLE, RolesEnum.USER_EDITOR]}>
            <BirthdayCalendar />
          </RoleBasedRoute>
        ),
      },
      {
        path: routes.environments,
        element: (
          <RoleBasedRoute allowedRoles={[RolesEnum.ADMIN_ROLE]}>
            <Environments />
          </RoleBasedRoute>
        )
      },
      {
        path: routes.profile,
        element: <Profile />,
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export const Router = () => {
  return <RouterProvider router={router} />;
};
