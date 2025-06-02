import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { ProtectedRoute } from '@/utils/routeProtection';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard/Dashboard';
import TaskHistory from '@/pages/TaskManagement/pages/History';
import Evaluations from '../pages/Evaluations/index';
import NewEvaluation from '../pages/Evaluations/NewEvaluation';
import { EmployeeReview } from '../pages/Evaluations/EmployeeReview';
import EnhancedEvaluationForm from '../pages/Evaluations/EnhancedEvaluationForm';
import { EvaluationHistory } from '../pages/Evaluations/EvaluationHistory';
import EvaluationsList from '../pages/Evaluations/EvaluationsList';
import Templates from '@/pages/Templates/index';
import TemplateBuilder from '../pages/Templates/TemplateBuilder';
import Settings from '../pages/Settings/index';
import Users from '../pages/users/index';
import UserProfile from '../pages/users/[id]/index';
import EditUser from '../pages/users/[id]/edit';
import ViewEvaluation from '@/pages/Evaluations/ViewEvaluation';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AnalyticsHub from '@/pages/Analytics';
import HeartsAndHands from '@/pages/Analytics/HeartsAndHands';
import DayVsNight from '@/pages/Analytics/DayVsNight';
import EvaluationTrends from '@/pages/Analytics/EvaluationTrends';
import DepartmentComparison from '@/pages/Analytics/DepartmentComparison';
// Disciplinary pages removed - functionality moved to documentation
import DocumentationPage from '@/pages/Documentation';
import NewDocument from '@/pages/Documentation/NewDocument';
import DocumentDetail from '@/pages/Documentation/[id]';
import EditDocument from '@/pages/Documentation/[id]/edit';
import TeamScores from '@/pages/Analytics/TeamScores';
import Kitchen from '@/pages/Kitchen';
import FoodSafety from '../pages/Kitchen/FoodSafety';
import CompleteChecklist from '../pages/Kitchen/FoodSafety/CompleteChecklist';
import DailyChecklist from '../pages/Kitchen/FoodSafety/DailyChecklist';
import ChecklistHistory from '../pages/Kitchen/FoodSafety/components/ChecklistHistory';
import History from '../pages/Kitchen/FoodSafety/pages/History';
import ChecklistAnalytics from '../pages/Kitchen/FoodSafety/components/ChecklistAnalytics';
import ViewCompletion from '../pages/Kitchen/FoodSafety/ViewCompletion';
import KitchenHome from '@/pages/Kitchen/Home';
import Leadership from '@/pages/Leadership';
import LeadershipDashboard from '@/pages/Leadership/Dashboard';
import Goals from '@/pages/Leadership/Goals';
import GoalDetails from '@/pages/Leadership/GoalDetails';
import DevelopmentalPlan from '@/pages/Leadership/DevelopmentalPlan';
import MyPlans from '@/pages/Leadership/MyPlans';
import PlanTasks from '@/pages/Leadership/PlanTasks';
import TrainingPrograms from '@/pages/Leadership/TrainingPrograms';
import TrainingProgramDetails from '@/pages/Leadership/TrainingProgramDetails';
import Assessments from '@/pages/Leadership/Assessments';
import AssessmentDetails from '@/pages/Leadership/AssessmentDetails';
import AssessmentTaking from '@/pages/Leadership/AssessmentTaking';
import AssessmentResults from '@/pages/Leadership/AssessmentResults';
import Subscription from '@/pages/Leadership/Subscription';
import Evaluations360 from '@/pages/Leadership/Evaluations360';
import New360Evaluation from '@/pages/Leadership/Evaluations360/New360Evaluation';
import AddEvaluators from '@/pages/Leadership/Evaluations360/AddEvaluators';
import View360Evaluation from '@/pages/Leadership/Evaluations360/View360Evaluation';
import Evaluators from '@/pages/Leadership/Evaluations360/Evaluators';
import DevelopmentPlan from '@/pages/Leadership/Evaluations360/DevelopmentPlan';
import Playbooks from '@/pages/Leadership/Playbooks';
import NewPlaybook from '@/pages/Leadership/Playbooks/NewPlaybook';
import PlaybookViewer from '@/pages/Leadership/Playbooks/PlaybookViewer';
import PlaybookEditor from '@/pages/Leadership/Playbooks/PlaybookEditor';
import SimplePlaybookEditor from '@/pages/Leadership/Playbooks/SimplePlaybookEditor';
import TeamSurveys from '@/pages/TeamSurveys';
import TeamSurveysDashboard from '@/pages/TeamSurveys/Dashboard';
import NewTeamSurvey from '@/pages/TeamSurveys/NewSurvey';
import CreateAdvanced from '@/pages/TeamSurveys/CreateAdvanced';
import TeamSurveyBuilder from '@/pages/TeamSurveys/SurveyBuilder';
import TeamSurveyResults from '@/pages/TeamSurveys/SurveyResults';
import TakeSurvey from '@/pages/TeamSurveys/TakeSurvey';
import TeamDevelopment from '@/pages/TeamDevelopment';
import TeamMyPlans from '@/pages/TeamDevelopment/MyPlans';
import TeamOverview from '@/pages/TeamDevelopment/TeamOverview';
import TeamPlanTasks from '@/pages/TeamDevelopment/PlanTasks';
import TeamDevelopmentRedirect from '@/components/TeamDevelopmentRedirect';
import Checklists from '@/pages/Kitchen/Checklists';
import KitchenChecklistHistory from '@/pages/Kitchen/Checklists/History';
import WasteTracker from '@/pages/Kitchen/WasteTracker';

import Equipment from '@/pages/Kitchen/Equipment';
import EquipmentDetail from '@/pages/Kitchen/Equipment/EquipmentDetail';

import WasteAnalytics from '@/pages/Kitchen/WasteTracker/Analytics';
import Training from '@/pages/Training';
import TrainingDashboard from '@/pages/Training/Dashboard';
import TrainingProgress from '@/pages/Training/Progress/TrainingProgress';
import TrainingPlanList from '@/pages/Training/PlanList';
import NewHires from '@/pages/Training/NewHires';
import TrainingDetails from '@/pages/Training/Progress/TrainingDetails';
import PlanDetails from '@/pages/Training/PlanDetails';
import FuturePage from '@/pages/FuturePage';
import AssignManagers from '../pages/users/AssignManagers';
import DailyChecklistHistory from '../pages/Kitchen/FoodSafety/DailyChecklistHistory';
import TemperatureHistory from '../pages/Kitchen/FoodSafety/pages/TemperatureHistory';
// Shifts functionality removed

import LandingPage from '../pages/Landing';
import FOH from '../pages/FOH'
import FOHHistory from '../pages/FOH/History'
import { SetupSheetBuilder } from '@/pages/SetupSheetBuilder';
import { SetupSheetTemplates } from '@/pages/SetupSheetTemplates';
import { SavedSetups } from '@/pages/SavedSetups';
import { SetupView } from '@/pages/SetupView';
import { EditTemplate } from '@/pages/EditTemplate';
import InvoicesPage from '@/pages/Invoices';
import AdminPage from '@/pages/Admin';
import SubscriptionManagementPage from '@/pages/Admin/SubscriptionManagement';


interface PrivateRouteProps {
  children: React.ReactNode;
  requiredFeature?: 'fohTasks' | 'setups' | 'kitchen' | 'documentation' | 'training' | 'evaluations' | 'leadership';
}

function PrivateRoute({ children, requiredFeature }: PrivateRouteProps) {
  // Use our new ProtectedRoute component
  return <ProtectedRoute requiredFeature={requiredFeature}>{children}</ProtectedRoute>;
}

export const publicRoutes = [
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/reset-password',
    element: <ResetPassword />
  }
];

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LandingPage />
          )
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* ... rest of the public routes ... */}

      {/* Protected Routes */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/foh" element={<PrivateRoute requiredFeature="fohTasks"><FOH /></PrivateRoute>} />
      <Route path="/foh/history" element={<PrivateRoute requiredFeature="fohTasks"><FOHHistory /></PrivateRoute>} />
      <Route path="/setup-sheet-templates" element={<PrivateRoute requiredFeature="setups"><SetupSheetTemplates /></PrivateRoute>} />
      <Route path="/setup-sheet-builder" element={<PrivateRoute requiredFeature="setups"><SetupSheetBuilder /></PrivateRoute>} />
      <Route path="/edit-template/:id" element={<PrivateRoute requiredFeature="setups"><EditTemplate /></PrivateRoute>} />
      <Route path="/saved-setups" element={<PrivateRoute requiredFeature="setups"><SavedSetups /></PrivateRoute>} />
      <Route path="/setup-view/:setupId" element={<PrivateRoute requiredFeature="setups"><SetupView /></PrivateRoute>} />
      <Route path="/evaluations" element={<PrivateRoute requiredFeature="evaluations"><Evaluations /></PrivateRoute>} />
      <Route path="/evaluations/new" element={<PrivateRoute requiredFeature="evaluations"><NewEvaluation /></PrivateRoute>} />
      <Route path="/evaluations/:id/review" element={<PrivateRoute requiredFeature="evaluations"><EmployeeReview /></PrivateRoute>} />
      <Route path="/evaluations/:id/acknowledge" element={<PrivateRoute requiredFeature="evaluations"><EnhancedEvaluationForm /></PrivateRoute>} />
      <Route path="/evaluations/:id/history" element={<PrivateRoute requiredFeature="evaluations"><EvaluationHistory employeeId={''} /></PrivateRoute>} />
      <Route path="/evaluations/:id/list" element={<PrivateRoute requiredFeature="evaluations"><EvaluationsList /></PrivateRoute>} />
      <Route path="/evaluations/:id" element={<PrivateRoute requiredFeature="evaluations"><ViewEvaluation /></PrivateRoute>} />


      <Route path="/kitchen" element={<PrivateRoute requiredFeature="kitchen"><Kitchen /></PrivateRoute>}>
        <Route index element={<KitchenHome />} />
        <Route path="waste-tracker" element={<WasteTracker />} />
        <Route path="waste-tracker/analytics" element={<WasteAnalytics />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="equipment/:id" element={<EquipmentDetail />} />
        <Route path="food-safety" element={<FoodSafety />} />
        <Route path="food-safety/complete/:id" element={<CompleteChecklist />} />
        <Route path="food-safety/daily" element={<DailyChecklist />} />
        <Route path="food-safety/history" element={<History />} />
        <Route path="food-safety/history/:id" element={<ChecklistHistory />} />
        <Route path="food-safety/pages/history" element={<DailyChecklistHistory />} />
        <Route path="food-safety/pages/temperature-history" element={<TemperatureHistory />} />
        <Route path="food-safety/analytics/:id" element={<ChecklistAnalytics />} />
        <Route path="food-safety/view/:id" element={<ViewCompletion />} />

        <Route path="checklists" element={<Checklists />} />
        <Route path="checklists/history" element={<KitchenChecklistHistory />} />
      </Route>

      <Route path="/food-safety" element={<PrivateRoute><FoodSafety /></PrivateRoute>} />

      <Route path="/templates" element={<PrivateRoute><Templates /></PrivateRoute>} />
      <Route path="/templates/new" element={<PrivateRoute><TemplateBuilder /></PrivateRoute>} />
      <Route path="/templates/:id/edit" element={<PrivateRoute><TemplateBuilder /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
      <Route path="/users/assign-managers" element={<PrivateRoute><AssignManagers /></PrivateRoute>} />
      <Route path="/users/:id" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
      <Route path="/users/:id/edit" element={<PrivateRoute><EditUser /></PrivateRoute>} />
      {/* Redirects for old disciplinary routes */}
      <Route path="/disciplinary" element={<Navigate to="/documentation" replace />} />
      <Route path="/disciplinary/new" element={<Navigate to="/documentation/new" replace />} />
      <Route path="/disciplinary/:id" element={<Navigate to="/documentation" replace />} />
      <Route path="/documentation" element={<PrivateRoute requiredFeature="documentation"><DocumentationPage /></PrivateRoute>} />
      <Route path="/documentation/new" element={<PrivateRoute requiredFeature="documentation"><NewDocument /></PrivateRoute>} />
      <Route path="/documentation/:id" element={<PrivateRoute requiredFeature="documentation"><DocumentDetail /></PrivateRoute>} />
      <Route path="/documentation/:id/edit" element={<PrivateRoute requiredFeature="documentation"><EditDocument /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><AnalyticsHub /></PrivateRoute>}>
        <Route path="hearts-and-hands" element={<HeartsAndHands />} />
        <Route path="team-scores" element={<TeamScores />} />
        <Route path="day-vs-night" element={<DayVsNight />} />
        <Route path="evaluation-trends" element={<EvaluationTrends />} />
        <Route path="department-comparison" element={<DepartmentComparison />} />
      </Route>
      <Route path="/training" element={<PrivateRoute requiredFeature="training"><Training /></PrivateRoute>}>
        <Route index element={<Navigate to="/training/progress" replace />} />
        <Route path="progress" element={<TrainingProgress />} />
        <Route path="progress/:id" element={<TrainingDetails />} />
        <Route path="plans" element={<TrainingPlanList />} />
        <Route path="plans/:id" element={<PlanDetails />} />
        <Route path="new-hires" element={<NewHires />} />
        <Route path="*" element={<Navigate to="/training/progress" replace />} />
      </Route>
      <Route path="/future" element={<PrivateRoute><FuturePage /></PrivateRoute>} />

      <Route path="/leadership" element={<PrivateRoute requiredFeature="leadership"><Leadership /></PrivateRoute>}>
        <Route index element={<Navigate to="/leadership/my-plans" replace />} />
        <Route path="dashboard" element={<LeadershipDashboard />} />
        <Route path="goals" element={<Goals />} />
        <Route path="goals/:id" element={<GoalDetails />} />
        <Route path="developmental-plan" element={<DevelopmentalPlan />} />
        <Route path="my-plans" element={<MyPlans />} />
        <Route path="plans/:planId/tasks" element={<PlanTasks />} />
        <Route path="training-programs" element={<TrainingPrograms />} />
        <Route path="training-programs/:id" element={<TrainingProgramDetails />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="assessments/:assessmentId/take" element={<AssessmentTaking />} />
        <Route path="assessments/:assessmentId/results" element={<AssessmentResults />} />
        <Route path="assessments/:id" element={<AssessmentDetails />} />
        <Route path="360-evaluations" element={<Evaluations360 />} />
        <Route path="360-evaluations/new" element={<New360Evaluation />} />
        <Route path="360-evaluations/:evaluationId" element={<View360Evaluation />} />
        <Route path="360-evaluations/:evaluationId/evaluators" element={<Evaluators />} />
        <Route path="360-evaluations/:evaluationId/evaluators/add" element={<AddEvaluators />} />
        <Route path="360-evaluations/:evaluationId/development-plan" element={<DevelopmentPlan />} />
        <Route path="playbooks" element={<Playbooks />} />
        <Route path="playbooks/new" element={<NewPlaybook />} />
        <Route path="playbooks/new/simple-edit" element={<SimplePlaybookEditor />} />
        <Route path="playbooks/:id" element={<PlaybookViewer />} />
        <Route path="playbooks/:id/edit" element={<PlaybookEditor />} />
        <Route path="playbooks/:id/simple-edit" element={<SimplePlaybookEditor />} />
        <Route path="subscription" element={<Subscription />} />
        <Route path="*" element={<Navigate to="/leadership/my-plans" replace />} />
      </Route>

      <Route path="/foh" element={<PrivateRoute requiredFeature="fohTasks"><FOH /></PrivateRoute>} />
      <Route path="/foh/history" element={<PrivateRoute requiredFeature="fohTasks"><FOHHistory /></PrivateRoute>} />

      <Route path="/team-surveys" element={<PrivateRoute requiredFeature="leadership"><TeamSurveys /></PrivateRoute>}>
        <Route index element={<Navigate to="/team-surveys/dashboard" replace />} />
        <Route path="dashboard" element={<TeamSurveysDashboard />} />
        <Route path="new" element={<NewTeamSurvey />} />
        <Route path="create-advanced" element={<CreateAdvanced />} />
        <Route path=":surveyId/edit" element={<TeamSurveyBuilder />} />
        <Route path=":surveyId/results" element={<TeamSurveyResults />} />
      </Route>

      {/* Anonymous survey taking route (no auth required) */}
      <Route path="/survey/:token" element={<TakeSurvey />} />

      <Route path="/team-development" element={<PrivateRoute requiredFeature="leadership"><TeamDevelopment /></PrivateRoute>}>
        <Route index element={<TeamDevelopmentRedirect />} />
        <Route path="my-plans" element={<TeamMyPlans />} />
        <Route path="overview" element={<TeamOverview />} />
        <Route path="plans/:planId/tasks" element={<TeamPlanTasks />} />
      </Route>

      {/* Shifts functionality removed */}

      {/* Redirect /goals to /leadership/goals since goals feature has been moved */}
      <Route path="/goals" element={<Navigate to="/leadership/goals" replace />} />

      {/* Admin Pages - Restricted Access */}
      <Route path="/admin/invoices" element={<PrivateRoute><InvoicesPage /></PrivateRoute>} />
      <Route path="/admin/stores" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
      <Route path="/admin/stores/:storeId/subscription" element={<PrivateRoute><SubscriptionManagementPage /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// client/src/components/Layout.tsx
