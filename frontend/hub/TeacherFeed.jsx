import { useParams } from "react-router-dom";
import { GroupContext } from "../contexts/GroupContext.jsx";
import { useContext } from "react";

export default function TeacherFeed() {
  const { feedId } = useParams();
  console.log(feedId);
  const groups = useContext(GroupContext);

  const group = groups.find((grp) => grp.id === feedId);
  console.log(group);

  return (
    <div className="flex-1 min-h-screen bg-neutral-800 p-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-1">
          Announcements
        </p>
        <h1 className="text-2xl font-bold text-white">{group?.name}</h1>
        <div className="mt-3 h-px bg-neutral-600" />
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto flex flex-col gap-3">
        {group.messages.map((msg, index) => (
          <div
            key={index}
            className="bg-neutral-700 rounded-xl px-5 py-4 border border-neutral-600 hover:border-blue-400 "
          >
            <p className="text-xs font-semibold text-blue-400 mb-1">
              #{String(index + 1).padStart(2, "0")}
            </p>
            <p className="text-neutral-100 text-sm leading-relaxed">{msg}</p>
          </div>
        ))}
      </div>
    </div>
  );
}