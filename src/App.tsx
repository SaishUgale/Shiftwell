import { useState } from 'react';
import { Header } from './components/Header';
import { Overview } from './components/Overview';
import { StaffCredentials } from './components/StaffCredentials';
import { ShiftAssignment } from './components/ShiftAssignment';
import { ValidationActivity } from './components/ValidationActivity';
import { CaseStudyModal } from './components/CaseStudyModal';
import { AcceptanceTestModal } from './components/AcceptanceTestModal';
import { INITIAL_STAFF, INITIAL_ACTIVITY_LOG, CLINIC_LOCATIONS } from './data/mockData';
import type { StaffMember, CredentialRecord, ActivityLogEntry } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<'overview' | 'staff' | 'assignment' | 'activity'>('overview');
  const [selectedClinic, setSelectedClinic] = useState<string>(CLINIC_LOCATIONS[0]);
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(INITIAL_ACTIVITY_LOG);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('STF-101');
  const [isCaseStudyOpen, setIsCaseStudyOpen] = useState<boolean>(false);
  const [isTestMatrixOpen, setIsTestMatrixOpen] = useState<boolean>(false);

  // Update staff credential in local state (simulated edit)
  const handleUpdateStaffCredential = (
    staffId: string,
    credentialId: string,
    updates: Partial<CredentialRecord>
  ) => {
    setStaffList((prev) =>
      prev.map((staff) => {
        if (staff.id !== staffId) return staff;
        return {
          ...staff,
          credentials: staff.credentials.map((cred) => {
            if (cred.id !== credentialId) return cred;
            return { ...cred, ...updates };
          }),
        };
      })
    );
  };

  // Add a newly uploaded/simulated credential to staff
  const handleAddCredential = (staffId: string, newCredential: CredentialRecord) => {
    setStaffList((prev) =>
      prev.map((staff) => {
        if (staff.id !== staffId) return staff;
        return {
          ...staff,
          credentials: [...staff.credentials, newCredential],
        };
      })
    );
  };

  // Reset staff data back to default mock data
  const handleResetStaffData = () => {
    setStaffList(INITIAL_STAFF);
    alert('Mock staff records have been reset to default case study state.');
  };

  // Add new event to activity audit trail
  const handleAddActivityLog = (
    entry: Omit<ActivityLogEntry, 'id' | 'timestamp' | 'formattedTime' | 'isSimulated'>
  ) => {
    const now = new Date();
    const newLog: ActivityLogEntry = {
      ...entry,
      id: `ACT-${Date.now().toString().slice(-4)}`,
      timestamp: now.toISOString(),
      formattedTime: `${now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} IST`,
      isSimulated: true,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Jump from roster to assignment with staff preselected
  const handleSelectStaffForAssignment = (staffId: string) => {
    setSelectedStaffId(staffId);
    setCurrentTab('assignment');
  };

  // Run acceptance test from test matrix modal
  const handleRunTest = (testNumber: number) => {
    setCurrentTab('assignment');
    switch (testNumber) {
      case 1:
        setSelectedStaffId('STF-101');
        break;
      case 2:
        setSelectedStaffId('STF-102');
        break;
      case 3:
        setSelectedStaffId('STF-103');
        break;
      case 4:
        setSelectedStaffId('STF-104');
        break;
      case 5:
        setSelectedStaffId('STF-102');
        break;
      case 6:
        setSelectedStaffId('STF-101');
        break;
      case 7:
        setSelectedStaffId('STF-105');
        break;
      case 8:
        setSelectedStaffId('STF-106');
        break;
    }
  };

  const blockedCount = activityLogs.filter((l) => l.outcome === 'Blocked').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navigation & Brand Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedClinic={selectedClinic}
        setSelectedClinic={setSelectedClinic}
        onOpenCaseStudy={() => setIsCaseStudyOpen(true)}
        onOpenTestMatrix={() => setIsTestMatrixOpen(true)}
        blockedCount={blockedCount}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'overview' && (
          <Overview
            staffList={staffList}
            activityLogs={activityLogs}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenCaseStudy={() => setIsCaseStudyOpen(true)}
            onSelectStaffForAssignment={handleSelectStaffForAssignment}
          />
        )}

        {currentTab === 'staff' && (
          <StaffCredentials
            staffList={staffList}
            onUpdateStaffCredential={handleUpdateStaffCredential}
            onAddCredential={handleAddCredential}
            onResetStaffData={handleResetStaffData}
            onAssignShiftForStaff={handleSelectStaffForAssignment}
          />
        )}

        {currentTab === 'assignment' && (
          <ShiftAssignment
            staffList={staffList}
            selectedStaffId={selectedStaffId}
            setSelectedStaffId={setSelectedStaffId}
            selectedClinic={selectedClinic}
            onAddActivityLog={handleAddActivityLog}
            onOpenTestMatrix={() => setIsTestMatrixOpen(true)}
          />
        )}

        {currentTab === 'activity' && (
          <ValidationActivity
            activityLogs={activityLogs}
          />
        )}
      </main>

      {/* Case Study Problem & Business Context Modal */}
      <CaseStudyModal
        isOpen={isCaseStudyOpen}
        onClose={() => setIsCaseStudyOpen(false)}
      />

      {/* Acceptance Test Suite Modal */}
      <AcceptanceTestModal
        isOpen={isTestMatrixOpen}
        onClose={() => setIsTestMatrixOpen(false)}
        onRunTest={handleRunTest}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Shiftwell</span>
            <span className="text-slate-400">&bull;</span>
            <span>Healthcare Operations SaaS &bull; CarePoint Clinics Demo</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>&#8377;60L ARR Account</span>
            <span>&bull;</span>
            <span>40 Facilities Across India</span>
            <span>&bull;</span>
            <span>Evaluation Reference Date: 18 Oct 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
