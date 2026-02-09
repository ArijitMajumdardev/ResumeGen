import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/resume/Dashboard";
import Header from "./components/custom/Header";
import Footer from "./components/custom/Footer";
import { Toaster } from "react-hot-toast";
import { useAuthContext } from "./context/AuthProvider";
import { useEffect } from "react";

import API from "./lib/ServerAPI";
import ResumeEdit from "./pages/resume/ResumeEdit";
import ResumeView from "./pages/resume/ResumeView";
import SharedResumePage from "./pages/resume/SharedResumePage";
import InterviewDashboard from "./pages/Interview/InterviewDashboard";
import InterviewGeneration from "./pages/Interview/InterviewGeneration";
import InterviewSession from "./pages/Interview/InterviewSession";
import InterviewFeedback from "./pages/Interview/Feedback";
import ResumeAnalysis from "./pages/resume/ResumeAnalysis";
function App() {
  const { setIsLogged, setUser } = useAuthContext();

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const res = await API.get("/user-detail");
        console.log(res.data.name,);
        if (res.status == 200) {
          setUser({
            email: res.data.email,
            name: res.data.name,
            id: res.data.id,
          });
          setIsLogged(true);
        }
      } catch (error) {
        console.log("LogIn");
      }
    };

    fetchUserDetail();
  }, []);

  return (
    <>
      <Router>
        <Header />
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume/:id/edit" element={<ResumeEdit />} />
          <Route path="/my-resume/:id/view" element={<ResumeView />} />
          <Route path="/share/:id/view" element={<SharedResumePage />} />
          <Route path="/resume-analysis" element={<ResumeAnalysis />} />
          <Route path="/interview/generate" element={<InterviewGeneration />} />
          <Route path="/interview/dashboard" element={<InterviewDashboard />} />
          <Route path="/interview/:id" element={<InterviewSession />} />
          <Route
            path="/interview/:interviewId/feedback/"
            element={<InterviewFeedback />}
          />
        </Routes>
        <Footer />
      </Router>
    </>
  );
}

export default App;
