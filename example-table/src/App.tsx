// App.tsx
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Tablet from './components/Tablet/Tablet';
import CheckInType from './components/Tablet/CheckInType';
import CheckInForm from './components/Tablet/CheckInForm';
import DeliveryCheckIn from './components/Tablet/DeliveryCheckIn';
import CheckOutPage from './components/Tablet/CheckOutPage';
import PrintReceipt from './components/Tablet/PrintReceipt';
import Security from './components/Security/Security';
import Admin from './components/Admin/Admin';
import VisitorLog from "./components/Admin/VisitorLog";
import Employees from "./components/Admin/Employees";
import DefaultLayout from "./components/DefaultLayout";
// import DisplayMode from './components/Admin/DisplayMode';  // Correct path
import './index.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/tablet" element={<Tablet />} />
          <Route path="/tablet/checkin" element={<CheckInType />} />
          <Route path="/tablet/checkin/delivery" element={<DeliveryCheckIn />} />
          <Route path="/tablet/checkin/non-delivery" element={<CheckInForm />} />
          <Route path="/tablet/checkout" element={<CheckOutPage />} />
          <Route path="/tablet/print/:visitorId" element={<PrintReceipt />} />
          <Route element={<DefaultLayout />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/visitor-log" element={<VisitorLog />} />
          <Route path="/admin/employees" element={<Employees />} />
        </Route>
        <Route element={<DefaultLayout />}>
          <Route path="/security" element={<Security />} />
          <Route path="/security/visitor-log" element={<VisitorLog />} />
        </Route>
        <Route path="/security/restricted" element={<Security />} />
      </Routes>
    </Router>

  );
};

export default App;