import { Suspense, lazy, type JSX } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./auth/useAuth";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const CollectionsPage = lazy(() => import("./pages/CollectionsPage"));
const UploadPage = lazy(() => import("./pages/UploadPage"));
const DashboardLayout = lazy(() => import("./pages/DashboardLayout"));
const RecipesPage = lazy(() => import("./pages/RecipesPage"));
const RecipeDetailsPage = lazy(() => import("./pages/RecipeDetailsPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/app"
          element={
            <PrivateRoute>
              <Outlet />
            </PrivateRoute>
          }
        >
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="uploads" element={<UploadPage />} />
          <Route path="dashboard" element={<DashboardLayout />} />
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="recipes/:id" element={<RecipeDetailsPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
