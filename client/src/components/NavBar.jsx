import { NavLink } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';

export default function NavBar() {
  const { users, currentUserId, setCurrentUserId, currentUser } = useUser();

  return (
    <div className="nav">
      <div className="nav-left">
        <NavLink to="/" className="nav-title">PM Scenario Simulator</NavLink>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Scenarios
          </NavLink>
          {currentUser?.role === 'manager' && (
            <NavLink to="/manager" className={({ isActive }) => (isActive ? 'active' : '')}>
              Manager dashboard
            </NavLink>
          )}
        </div>
      </div>
      <div className="user-switcher">
        <span className="muted">Signed in as</span>
        <select value={currentUserId} onChange={(e) => setCurrentUserId(e.target.value)}>
          {users.map((u) => (
            <option key={u.user_id} value={u.user_id}>
              {u.name}
            </option>
          ))}
        </select>
        {currentUser && <span className="role-pill">{currentUser.role}</span>}
      </div>
    </div>
  );
}
