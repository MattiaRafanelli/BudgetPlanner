import React, { createContext, useContext } from 'react';

interface UserContextValue {
  onLogout?: () => void;
}

const UserContext = createContext<UserContextValue>({});

export function UserProvider({ children, onLogout }: { children: React.ReactNode; onLogout?: () => void }) {
  return (
    <UserContext.Provider value={{ onLogout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
