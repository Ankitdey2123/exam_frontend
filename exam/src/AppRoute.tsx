
import './App.css'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import LoginPage from './common/loginpage';
import SimpleDashboard from './common/dashboard';
import Layout from './common/layout';
import PermissionPage from './superAdminPage/permissionPage';
import { Toaster } from 'react-hot-toast';
import RolePage from './superAdminPage/rolePage';
import ExamCenterPage from './superAdminPage/examCenterPage';
import ExamPage from './superAdminPage/examPage';
import QuestionPage from './superAdminPage/questionPage';
import ViewQuestionPage from './superAdminPage/viewPage';
import SetQuestionPage from './superAdminPage/setQuestionPage';
import PlatformUserPage from './superAdminPage/platformUserPage';

import CoursePage from './superAdminPage/coursePage';
import CourseVideosPage from './superAdminPage/courseVideoPage';
import VideoPlayPage from './superAdminPage/videoPlayerPage';

import StudentLoginPage from './common/studentLoginPage';
import StudentLayout from './common/studentLayout';
import HomePage from './studentPage/homePage';
import StudentCoursePage from './studentPage/studentCoursePage';
import StudentExamPage from './studentPage/studentExamPage';
import StudentStartExamPage from './studentPage/studentStartExamPage';
import StudentExamQuestionPage from './studentPage/studentExamQuestionPage';
import StudentExamResultPage from './studentPage/studentExamResultPage';
import SeeStudentAnswerPage from './studentPage/seeStudentAnswerPage';
import StudentProfilePage from './studentPage/studentProfilePage';
import StudentCourseVideosPage from './studentPage/studentCourseVideoPage';
import StudentVideoPlayPage from './studentPage/studentVideoPlayerPage';
import StudentUserPage from './superAdminPage/studentUserPage';

function App() {

  return (
    <Router>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <Routes>
        {/*Super Admin and Teacher Login Route*/}
        <Route path="/" element={<LoginPage />} />
        {/*Student Login Route*/}
        <Route path="/stu-login" element={<StudentLoginPage />} />

        {/* Super Admin and Teacher Layout Wrapper */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<SimpleDashboard />} />
          <Route path="/permission" element={<PermissionPage />} />
          <Route path="/role" element={<RolePage />} />
          <Route path="/center" element={<ExamCenterPage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/question" element={<QuestionPage />} />
          <Route path="/platform-user" element={<PlatformUserPage />} />
          <Route path="/student-user" element={<StudentUserPage />} />
          <Route path="/set-question/:id" element={<SetQuestionPage />} />
          <Route path="/view-question/:id" element={<ViewQuestionPage />} />
          <Route path="course" element={<CoursePage />} />
          <Route path="course-videos/:id" element={<CourseVideosPage />} />
          <Route path="course/video/play/:videoId" element={<VideoPlayPage />} />
        </Route>


        {/*Student Layout Wrapper */}
        <Route element={<StudentLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/stu-course" element={<StudentCoursePage />} />
          <Route path="std-course-videos/:id" element={<StudentCourseVideosPage />} />
          <Route path="std-course/video/play/:videoId" element={<StudentVideoPlayPage />} />
          <Route path="/stu-exam" element={<StudentExamPage />} />
          <Route path="/stu-startexam/:examId" element={<StudentStartExamPage />} />
          <Route path="/stu-live-exam/:examId" element={<StudentExamQuestionPage />} />
          <Route path="/stu-result/:examId" element={<StudentExamResultPage />} />
          <Route path="/stu-answer/:examId" element={<SeeStudentAnswerPage />} />
          <Route path="/stu-profile" element={<StudentProfilePage />} />



        </Route>





      </Routes>
    </Router>
  )
}
export default App
