import { useState, useEffect, useCallback, useContext } from "react";
import api from '../services/api';
import { AuthContext } from "../context/AuthContext";

export function useHubs() {
  const {user}  = useContext(AuthContext)
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHubs = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/hub/my-hubs`);
        setHubs(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchHubs();
    }
  }, [user]);

  const addHub = useCallback(async (newTitle) => {
    if (!newTitle.trim()) return;
    try {
      const response = await api.post("/hub", { title: newTitle });
      const savedHub = response.data;
      setHubs((prevHubs) => [...prevHubs, savedHub]);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const editHub = useCallback(async (hubId, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      setLoading(true);
      const response = await api.put(`/hub/${hubId}`, { title: newTitle });
      const savedHub = response.data; 
      setHubs((prevHubs) =>
        prevHubs.map((hub) =>
          hub._id === hubId ? savedHub  : hub
        )
      );
    } catch (err) {
      setError(err.message);
    }finally{
      setLoading(false);
    }
  }, []);

  const deleteHub = useCallback(async (hubId) => {
    try {
      setLoading(true);
      await api.delete(`/hub/${hubId}`);
      setHubs((prevHubs) =>
        prevHubs.filter((hub) => hub._id !== hubId)
      );
    } catch (err) {
      setError(err.message);
    }finally{
      setLoading(false);
    }
  }, []);

  return { hubs, loading, error, addHub, editHub, deleteHub };
}
