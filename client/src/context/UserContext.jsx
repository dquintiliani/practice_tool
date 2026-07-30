import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const UserContext = createContext(null);

const STORAGE_KEY = 'pmsim.currentUserId';

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserIdState] = useState(localStorage.getItem(STORAGE_KEY) || '');
  const [loading, setLoading] = useState(true);

  const setCurrentUserId = useCallback((id) => {
    // Write synchronously so any effect that fires from the resulting render
    // (e.g. a page fetching data for "the current user") reads the new id,
    // not a stale one — api calls pull the id straight from localStorage.
    localStorage.setItem(STORAGE_KEY, id);
    setCurrentUserIdState(id);
  }, []);

  useEffect(() => {
    api.listUsers().then((list) => {
      setUsers(list);
      setLoading(false);
      const stillValid = list.some((u) => u.user_id === currentUserId);
      if (!stillValid && list.length > 0) {
        setCurrentUserId(list[0].user_id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentUser = users.find((u) => u.user_id === currentUserId) || null;

  return (
    <UserContext.Provider value={{ users, currentUser, currentUserId, setCurrentUserId, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
