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
      <div className="bg-slate-950 px-3 sm:px-4 py-1.5 text-xs border-b border-slate-800 flex items-center justify-between text-slate-400 gap-1.5 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1.5 text-blue-400 font-medium">
            <FlaskConical className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="hidden sm:inline">PM Case Study Prototype</span>
            <span className="sm:hidden">Prototype</span>
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="hidden md:inline">Customer: <strong className="text-slate-200">CarePoint Clinics</strong> (40 locations &bull; &#8377;60L ARR &bull; Renewal Dec 2026)</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onOpenCaseStudy}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px] sm:text-xs underline underline-offset-2"
          >
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="hidden sm:inline">View Business Context</span>
            <span className="sm:hidden">Context</span>
          </button>
          <button
            type="button"
            onClick={onOpenTestMatrix}
            className="flex items-center gap-1 bg-blue-900/60 hover:bg-blue-800 text-blue-200 px-1.5 sm:px-2 py-0.5 rounded border border-blue-700/60 transition-colors cursor-pointer text-[11px] sm:text-xs font-medium"
          >
            <CheckSquare2 className="w-3.5 h-3.5 text-blue-300 shrink-0" />
            <span className="hidden sm:inline">8 Acceptance Tests</span>
            <span className="sm:hidden">8 Tests</span>
          </button>
          <span className="hidden sm:inline-block bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-mono font-medium">
            18 Oct 2026
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Logo & Account */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner text-white font-bold text-base sm:text-lg tracking-wider shrink-0">
                S
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-white">Shiftwell</span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-semibold px-1 sm:px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Clinical
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 truncate max-w-[150px] sm:max-w-none">
                  Healthcare Shift &amp; Credential Ops
                </div>
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
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs text-slate-200 max-w-[145px] sm:max-w-none">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <label htmlFor="clinic-select" className="sr-only">Clinic Location</label>
              <select
                id="clinic-select"
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
                className="bg-transparent text-slate-200 text-[11px] sm:text-xs font-medium focus:outline-none cursor-pointer truncate max-w-[110px] sm:max-w-none"
              >
                {CLINIC_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-slate-900 text-slate-200">
                    {loc.replace('CarePoint - ', '')}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden md:flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Sun, 18 Oct 2026</span>
            </div>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex space-x-1 border-t border-slate-800/80 overflow-x-auto no-scrollbar py-1" aria-label="Main Navigation">
          <button
            type="button"
            onClick={() => setCurrentTab('overview')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
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
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              currentTab === 'staff'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="hidden sm:inline">Staff &amp; Credentials</span>
            <span className="sm:hidden">Staff</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('assignment')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              currentTab === 'assignment'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Shift Assignment &amp; Validation</span>
            <span className="sm:hidden">Assignment</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('activity')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              currentTab === 'activity'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="hidden sm:inline">Validation Activity</span>
            <span className="sm:hidden">Activity</span>
            {blockedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500/30 text-red-300 border border-red-500/40">
                {blockedCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
