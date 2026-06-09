import TeacherHub from "../../hub/TeacherHub.jsx";
import {Route,Routes } from "react-router-dom"
//import TeacherFeed from "../../hub/TeacherFeed.jsx"
import TeacherFeed from "../../hub/TeacherFeed.jsx";

export default function DashBoard() {
  
  return (
    <Routes>


      <Route path="/dashboard" element={<TeacherHub></TeacherHub>}/>

      <Route path="/teacherFeed/:feedId" element={<TeacherFeed></TeacherFeed>}/>

    </Routes>
  );
}