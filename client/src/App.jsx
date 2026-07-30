import { Navigate, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import ScenarioList from './pages/ScenarioList.jsx';
import ScenarioBrief from './pages/ScenarioBrief.jsx';
import ScenarioRun from './pages/ScenarioRun.jsx';
import Debrief from './pages/Debrief.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import { useUser } from './context/UserContext.jsx';

function ManagerRoute({ children }) {
  const { currentUser, loading } = useUser();
  if (loading) return <p className="muted">Loading…</p>;
  if (currentUser?.role !== 'manager') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { loading, currentUserId } = useUser();

  return (
    <div className="app-shell">
      <NavBar />
      {loading || !currentUserId ? (
        <p className="muted">Loading…</p>
      ) : (
        <Routes>
          <Route path="/" element={<ScenarioList />} />
          <Route path="/scenarios/:scenarioId" element={<ScenarioBrief />} />
          <Route path="/scenarios/:scenarioId/run" element={<ScenarioRun />} />
          <Route path="/scenarios/:scenarioId/debrief" element={<Debrief />} />
          <Route
            path="/manager"
            element={
              <ManagerRoute>
                <ManagerDashboard />
              </ManagerRoute>
            }
          />
        </Routes>
      )}
    </div>
  );
}
