import { useState, useEffect, useCallback } from "react";
// Eventually, this will import from '../services/api'
// import api from '../services/api';

export function useHubs(initialHubs = []) {
  const [hubs, setHubs] = useState(initialHubs);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial load
  useEffect(() => {
    try {
      // In a real app with backend:
      // const response = await api.get('/hubs');
      // setHubs(response.data);
      
      const storedHubs = JSON.parse(localStorage.getItem("Hubs"));
      if (storedHubs) {
        setHubs(storedHubs);
      } else if (initialHubs.length > 0) {
        setHubs(initialHubs);
        localStorage.setItem("Hubs", JSON.stringify(initialHubs));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [initialHubs]);

  // Use useCallback to memorize these functions so they don't trigger unnecessary re-renders in child components
  const addHub = useCallback((newTitle) => {
    if (!newTitle.trim()) return;
    
    setHubs((prevHubs) => {
      const updatedHubs = [...prevHubs, { id: Date.now().toString(), title: newTitle }];
      localStorage.setItem("Hubs", JSON.stringify(updatedHubs));
      return updatedHubs;
    });
  }, []);

  const editHub = useCallback((hubId, newTitle) => {
    if (!newTitle.trim()) return;

    setHubs((prevHubs) => {
      const updatedHubs = prevHubs.map((hub) =>
        hub.id === hubId ? { ...hub, title: newTitle } : hub
      );
      localStorage.setItem("Hubs", JSON.stringify(updatedHubs));
      return updatedHubs;
    });
  }, []);

  const deleteHub = useCallback((hubId) => {
    setHubs((prevHubs) => {
      const updatedHubs = prevHubs.filter((hub) => hub.id !== hubId);
      localStorage.setItem("Hubs", JSON.stringify(updatedHubs));
      return updatedHubs;
    });
  }, []);

  return { hubs, loading, error, addHub, editHub, deleteHub };
}
