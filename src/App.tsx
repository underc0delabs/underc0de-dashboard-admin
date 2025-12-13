import * as app from "./app.imports";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "@/context/AuthContext";
import { DependenciesContextProvider } from "@/context/DependenciesContexts";
import { theme } from "@/theme";
import { Router } from "@/router";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = app.useState(false);
  const dependencyManagerRef = app.useRef<app.DependencyManager>(
    new app.DependencyManager()
  );

  app.useEffect(() => {
    app.httpClientModuleInitialize(dependencyManagerRef.current);
    app.loginModuleInitialize(dependencyManagerRef.current);
    app.dashboardModuleInitialize(dependencyManagerRef.current);
    app.adminUsersModuleInitialize(dependencyManagerRef.current);
    app.merchantsModuleInitialize(dependencyManagerRef.current);
    app.notificationsModuleInitialize(dependencyManagerRef.current);
    setIsLoaded(true);
  }, []);

  return (
    isLoaded && (
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications position="top-right" />
        <DependenciesContextProvider
          dependencyManager={dependencyManagerRef.current}
        >
          <AuthProvider>
            <Router />
          </AuthProvider>
        </DependenciesContextProvider>
      </MantineProvider>
    )
  );
};

export default App;
