import {Navigate, Route, Routes} from "react-router-dom";
import PrivateRoute from "./router/PrivateRoute.jsx";
import {Suspense} from "react";
import PublicLayout from "./layouts/PublicLayout.jsx";
import PrivateLayout from "./layouts/PrivateLayout.jsx";
import {rootRoutes} from "./router/rootRoutes.js";
import BlankLayout from "./layouts/BlankLayout.jsx";
import {useInitSocket} from "./hooks/useInitSocket.jsx";

function renderComponent(Component, Layout) {
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
      {rootRoutes.map((route) => {

        let Layout = null

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
              <Suspense fallback={<div>Loading...</div>}>
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
