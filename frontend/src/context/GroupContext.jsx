import { createContext, useState } from "react";

export const GroupContext = createContext();

export function GroupProvider({ children }) {
  // Temporary mocked data until we connect to the Node.js backend!
  const [groupsFeed] = useState([
    {
        id: "1",
        messages: ["announcement 1", "do your homework math class"]
    },
    {
        id: "2",
        messages: ["announcement 2", "read chapter 4 svt class"]
    },
    {
        id: "3",
        messages: ["announcement 3", "prepare for eco presentation"]
    }
  ]);

  return (
    <GroupContext.Provider value={groupsFeed}>
      {children}
    </GroupContext.Provider>
  );
}
