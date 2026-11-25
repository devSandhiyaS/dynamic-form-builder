import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./components/AdminLayout";
import Forms from "./pages/Forms";
import CreateForm from "./pages/CreateForm";
import FormBuilder from "./pages/FormBuilder";
import PublicForm from "./pages/PublicForm";
import Submissions from "./pages/Submissions";

function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route path="/login" element={<Login />} />
      {/* Admin Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/forms/create" element={<CreateForm />} />
        <Route
          path="/forms/:formId/builder"
          element={<FormBuilder />}
        />
        <Route
          path="/forms/:formId/submissions"
          element={<Submissions />}
        />
      </Route>
      {/* Public Form Route */}
      <Route
        path="/forms/:formId"
        element={<PublicForm />}
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;