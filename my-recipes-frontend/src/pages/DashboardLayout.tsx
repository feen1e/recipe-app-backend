import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboardContainer">
      <nav className="dashboardNav">
        <div className="dashboardLinks">
          <Link to="/app/collections" className="dashboardLink">
            Collections
          </Link>
          <Link to="/app/uploads" className="dashboardLink">
            Uploads
          </Link>
          <Link to="/app/recipes" className="dashboardLink">
            Recipes
          </Link>
          <Link to="/app/favorites" className="dashboardLink">
            Favorites
          </Link>
        </div>

        <div className="dashboardUser">
          {user && (
            <span className="dashboardUsername">Hi, {user.username}</span>
          )}
          <button onClick={handleLogout} className="logoutButton">
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboardMain">
        <Outlet />
      </main>
    </div>
  );
}
