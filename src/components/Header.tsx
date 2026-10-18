import type { FC } from 'react';
import { ShieldCheck, MapPin, Calendar, Info, FlaskConical, CheckSquare2 } from 'lucide-react';
import { CLINIC_LOCATIONS } from '../data/mockData';


interface HeaderProps {
  currentTab: 'overview' | 'staff' | 'assignment' | 'activity';
  setCurrentTab: (tab: 'overview' | 'staff' | 'assignment' | 'activity') => void;
  selectedClinic: string;
  setSelectedClinic: (clinic: string) => void;
  onOpenCaseStudy: () => void;
  onOpenTestMatrix: () => void;
  blockedCount: number;
}

export const Header: FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  selectedClinic,
  setSelectedClinic,
  onOpenCaseStudy,
  onOpenTestMatrix,
  blockedCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      {/* Top Banner: Case Study Context Bar */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs border-b border-slate-800 flex flex-wrap items-center justify-between text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-blue-400 font-medium">
            <FlaskConical className="w-3.5 h-3.5 text-blue-400" />
            PM Case Study Prototype
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline">Customer: <strong className="text-slate-200">CarePoint Clinics</strong> (40 locations &bull; &#8377;60L ARR &bull; Renewal Dec 2026)</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenCaseStudy}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs underline underline-offset-2"
          >
            <Info className="w-3.5 h-3.5 text-blue-400" />
            View Business Context &amp; Hypotheses
          </button>
          <button
            type="button"
            onClick={onOpenTestMatrix}
            className="flex items-center gap-1 bg-blue-900/60 hover:bg-blue-800 text-blue-200 px-2 py-0.5 rounded border border-blue-700/60 transition-colors cursor-pointer text-xs font-medium"
          >
            <CheckSquare2 className="w-3.5 h-3.5 text-blue-300" />
            8 Acceptance Tests
          </button>
          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-mono font-medium">
            Demo Date: 18 Oct 2026
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Account */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner text-white font-bold text-lg tracking-wider">
                S
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-white">Shiftwell</span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Clinical
                  </span>
                </div>
                <div className="text-xs text-slate-400">Healthcare Shift &amp; Credential Ops</div>
              </div>
            </div>

            <div className="hidden lg:block h-6 w-px bg-slate-800" />

            {/* Account pill */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300 font-medium">CarePoint Clinics Account</span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-slate-400">40 Active Facilities</span>
            </div>
          </div>

          {/* Location selector and demo indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <label htmlFor="clinic-select" className="sr-only">Clinic Location</label>
              <select
                id="clinic-select"
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
              >
                {CLINIC_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-slate-900 text-slate-200">
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Sun, 18 Oct 2026</span>
            </div>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex space-x-1 border-t border-slate-800/80 overflow-x-auto py-1" aria-label="Main Navigation">
          <button
            type="button"
            onClick={() => setCurrentTab('overview')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('staff')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'staff'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Staff &amp; Credentials
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('assignment')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'assignment'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Shift Assignment &amp; Validation
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('activity')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'activity'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Validation Activity
            {blockedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/30 text-red-300 border border-red-500/40">
                {blockedCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
