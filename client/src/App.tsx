import {Navigate, Route, Routes} from "react-router-dom";
import PrivateRoute from "./router/PrivateRoute.tsx";
import * as React from "react";
import {Suspense} from "react";
import PublicLayout from "./layouts/PublicLayout.tsx";
import PrivateLayout from "./layouts/PrivateLayout.tsx";
import {rootRoutes} from "./router/rootRoutes.ts";
import BlankLayout from "./layouts/BlankLayout.tsx";
import {useInitSocket} from "./hooks/useInitSocket.tsx";
import type {IRoute} from "@/types/route.ts";
import Loading from "@/components/Loading.tsx";

function renderComponent(
  Component: React.LazyExoticComponent<() => React.JSX.Element>,
  Layout: React.ComponentType<{ children: React.ReactNode }>
) {
  return Layout ? (
    <Layout>
      <Component/>
    </Layout>
  ) : (
    <Component/>
  );
}

function App() {
  useInitSocket()

  return (
    <Routes>
      {rootRoutes.map((route: IRoute) => {

        let Layout: ({children}: { children: React.ReactNode }) => React.JSX.Element

        switch (route.layout) {
          case 'publicLayout':
            route.isPublic = true;
            Layout = PublicLayout;
            break;
          case 'privateLayout':
            route.isPublic = false;
            Layout = PrivateLayout;
            break;
          case 'blankLayout':
            Layout = BlankLayout;
            break;
          default:
            route.isPublic = false;
            Layout = PrivateLayout
        }

        const Component = route.element;

        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              <Suspense fallback={<Loading/>}>
                {route.isPublic ? (
                  renderComponent(Component, Layout)
                ) : (
                  <PrivateRoute>
                    {renderComponent(Component, Layout)}
                  </PrivateRoute>
                )}
              </Suspense>
            }
          />
        );
      })}
      <Route path="*" element={<Navigate to="/404" replace/>}/>
    </Routes>
  )
}

export default App