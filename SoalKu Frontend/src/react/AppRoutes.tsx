import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MateriProvider } from "./context/MateriContext";
import { QuizProvider } from "./context/QuizContext";
import { MentorProvider } from "./context/MentorContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthPage } from "./components/AuthPage";
import { LandingPage } from "./pages/LandingPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SdDashboard, SmpDashboard, GuruDashboard } from "./pages/Dashboards";
import { PilihLatihanPage } from "./pages/PilihLatihanPage";
import { QuizPage } from "./pages/QuizPage";
import { SessionResultPage } from "./pages/SessionResultPage";
import { MentorReviewPage } from "./pages/MentorReviewPage";
import { EvaluationPage } from "./pages/EvaluationPage";
import { PwaInstallPrompt } from "./components/PwaInstallPrompt";

// Auth redirect wrapper: jika sudah login dan akses /login atau /register, bisa langsung diarahkan ke dashboard
const AuthRouteGuard: React.FC<{ mode?: "login" | "register" }> = ({ mode }) => {
  const { user, isAuthenticated, getDashboardRoute } = useAuth();
  if (isAuthenticated && user) {
    return <Navigate to={getDashboardRoute(user.role)} replace />;
  }
  return <AuthPage initialMode={mode} />;
};

export const AppRoutes: React.FC = () => {
  return (
    <AuthProvider>
      <MateriProvider>
        <QuizProvider>
          <MentorProvider>
            <BrowserRouter>
              <PwaInstallPrompt />
              <Routes>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Dedicated Auth Routes */}
                <Route path="/login" element={<AuthRouteGuard mode="login" />} />
                <Route path="/register" element={<AuthRouteGuard mode="register" />} />
                <Route path="/auth" element={<AuthRouteGuard />} />

                {/* Protected Dashboard Route Siswa SD */}
                <Route element={<ProtectedRoute allowedRoles={["sd"]} />}>
                  <Route path="/dashboard/sd" element={<SdDashboard />} />
                </Route>

                {/* Protected Dashboard Route Siswa SMP */}
                <Route element={<ProtectedRoute allowedRoles={["smp"]} />}>
                  <Route path="/dashboard/smp" element={<SmpDashboard />} />
                </Route>

                {/* Protected Dashboard & Review Route Guru / Mentor */}
                <Route element={<ProtectedRoute allowedRoles={["guru"]} />}>
                  <Route path="/dashboard/guru" element={<GuruDashboard />} />
                  <Route path="/mentor/review" element={<MentorReviewPage />} />
                </Route>

                {/* Protected Latihan & CBT Routes */}
                <Route element={<ProtectedRoute allowedRoles={["sd", "smp", "guru"]} />}>
                  <Route path="/latihan" element={<PilihLatihanPage />} />
                  <Route path="/latihan/pilih" element={<PilihLatihanPage />} />
                  <Route path="/latihan/quiz" element={<QuizPage />} />
                  <Route path="/latihan/hasil" element={<SessionResultPage />} />
                  <Route path="/evaluasi" element={<EvaluationPage />} />
                </Route>

                {/* 404 Not Found Page */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </MentorProvider>
        </QuizProvider>
      </MateriProvider>
    </AuthProvider>
  );
};

export default AppRoutes;
