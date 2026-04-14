
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

function App() {

  return (
    <Router>
      <Toaster
  position="top-center"
  reverseOrder={false}
/>
      <Routes>
        {/*Login Route*/}
        <Route path="/" element={<LoginPage/>}/>
             {/* Layout Wrapper */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<SimpleDashboard />} />
          <Route path="/permission" element={<PermissionPage />} />
           <Route path="/role" element={<RolePage/>} />
           <Route path="/center" element={<ExamCenterPage/>} />
           <Route path="/exam" element={<ExamPage/>} />
           <Route path="/question" element={<QuestionPage/>} />
           <Route path="/platform-user" element={<PlatformUserPage/>} />
           <Route path="/set-question/:id" element={<SetQuestionPage />} />
           <Route path="/view-question/:id" element={<ViewQuestionPage/>} />
        </Route>





      </Routes>
    </Router>
  )
}
export default App
