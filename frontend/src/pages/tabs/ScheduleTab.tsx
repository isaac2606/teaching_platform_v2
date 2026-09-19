// @ts-nocheck
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useRouteLoaderData } from "react-router-dom";
import api from "../../services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import CreateCohortModal from "../../features/cohorts/CreateCohortModal";
import EditCohortModal from "../../features/cohorts/EditCohortModal";
import ClassCard from "../../features/cohorts/ClassCard";

export default function ScheduleTab() {

  const { user } = useContext(AuthContext);
  const hub = useRouteLoaderData("hub-workspace");
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const { data: upcomingClasses = [] } = useQuery({
    queryKey: ["classes", hub?._id],
    queryFn: async () => {
      const response = await api.get(`/class/getClasses/${hub._id}`);
      return response.data;
    },
    enabled: !!hub?._id
  });

  const deleteMutation = useMutation({
    mutationFn: async (classId) => {
      await api.delete(`/class/deleteClass/${classId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes", hub?._id] });
    },
    onError: (err) => {
      console.error("Failed to delete class", err);
      alert("Failed to delete the group. Please try again.");
    }
  });

  const handleCohortCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["classes", hub?._id] });
  };

  const handleDelete = (classId) => {
    deleteMutation.mutate(classId);
  };

  const handleEdit = (newClass) => {
    queryClient.invalidateQueries({ queryKey: ["classes", hub?._id] });
    setEditingGroup(null);
  };

  const handleUpdate = (updatedClass) => {
    queryClient.invalidateQueries({ queryKey: ["classes", hub?._id] });
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