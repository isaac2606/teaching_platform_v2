import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useRouteLoaderData } from "react-router-dom";
import api from "../../services/api"

import CreateCohortModal from "../../features/cohorts/CreateCohortModal";
import EditCohortModal from "../../features/cohorts/EditCohortModal";
import ClassCard from "../../features/cohorts/ClassCard";

export default function ScheduleTab() {

  const { user } = useContext(AuthContext);
  const hub = useRouteLoaderData("hub-workspace");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);

  useEffect(() => {
    const getUpcomingClasses = async () => {
      try {
        const response = await api.get(`/class/getClasses/${hub._id}`);
        setUpcomingClasses(response.data);
      } catch (err) {
        console.error("failed to get classes", err);
      }
    };

    if (hub && hub._id) {
      getUpcomingClasses();
    }
  }, [hub]);

  const handleCohortCreated = (newCohort) => {
    setUpcomingClasses([...upcomingClasses, newCohort]);
  };

  const handleDelete = async (classId) => {
    try {
      await api.delete(`/class/deleteClass/${classId}`);
      // Remove the deleted class from state
      setUpcomingClasses((prev) => prev.filter(cls => cls._id !== classId));
    } catch (err) {
      console.error("Failed to delete class", err);
      alert("Failed to delete the group. Please try again.");
    }
  };

  const handleEdit = (newClass) => {
    setUpcomingClasses((prev) => 
        prev.map(cls => cls._id === newClass._id ? newClass : cls)
    );
    setEditingGroup(null);
  };

  const handleUpdate = (updatedClass) => {
    setUpcomingClasses((prev) => 
        prev.map(cls => cls._id === updatedClass._id ? updatedClass : cls)
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Schedule & Groups</h2>
          <p className="text-text-secondary mt-1">Manage all upcoming live sessions for {hub.title}.</p>
        </div>

        {user?.role === "teacher" && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:-translate-y-0.5 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create New Group
          </button>
        )}
      </div>

      {/* Upcoming Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingClasses.map((cls) => (
          <ClassCard 
            key={cls._id} 
            group={cls} 
            onDelete={handleDelete} 
            onEdit={setEditingGroup} 
            onUpdate={handleUpdate}
          />
        ))}
      </div>

      <CreateCohortModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        hubId={hub?._id}
        onCohortCreated={handleCohortCreated}
      />

      {editingGroup && (
        <EditCohortModal
          group={editingGroup}
          onClose={() => setEditingGroup(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}