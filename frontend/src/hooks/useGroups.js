import { useState, useEffect, useCallback, useContext } from "react";
import api from '../services/api';
import { AuthContext } from "../context/AuthContext";

export function useGroups() {
  const {user}  = useContext(AuthContext)
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial load
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        // Updated to use the new unified route: /group/my-groups
        // The backend automatically knows we are a teacher from our auth token!
        const response = await api.get(`/group/my-groups`);
        setGroups(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchGroups();
    }
  }, [user]);

  // Use useCallback to memorize these functions so they don't trigger unnecessary re-renders in child components
  const addGroup = useCallback(async (newTitle) => {
    if (!newTitle.trim()) return;
    try {
      // Note: We use title to match the new backend schema we will write!
      const response = await api.post("/group", { title: newTitle });
      const savedGroup = response.data;
      setGroups((prevGroups) => [...prevGroups, savedGroup]);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const editGroup = useCallback(async (groupId, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      // This will connect to the new PUT route we will write
      const response = await api.put(`/group/${groupId}`, { title: newTitle });
      const savedGroup = response.data; 
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group._id === groupId ? savedGroup  : group
        )
      );
    } catch (err) {
      setError(err.message);
    }finally{
      setLoading(false);
    }
  }, []);

  const deleteGroup = useCallback(async (groupId) => {
    try {
      // This will connect to the new DELETE route we will write
      await api.delete(`/group/${groupId}`);
      setGroups((prevGroups) =>
        prevGroups.filter((group) => group._id !== groupId)
      );
    } catch (err) {
      setError(err.message);
    }finally{
      setLoading(false);
    }
  }, []);

  return { groups, loading, error, addGroup, editGroup, deleteGroup };
}
