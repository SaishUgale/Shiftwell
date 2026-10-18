import type { FC } from 'react';
import { 
  X, 
  Building2, 
  DollarSign, 
  Calendar, 
  AlertOctagon, 
  FileSpreadsheet, 
  Clock, 
  Target, 
  ShieldAlert, 
  CheckCircle2
} from 'lucide-react';

interface CaseStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CaseStudyModal: FC<CaseStudyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white rounded-t-2xl flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white uppercase tracking-wider">
                Product Case Study
              </span>
              <span className="text-xs text-slate-400">Shiftwell B2B SaaS</span>
            </div>
            <h2 className="text-xl font-bold mt-1 tracking-tight">
              CarePoint Clinics: Shiftwell Certificate Validation
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Automated mandatory credential enforcement during shift scheduling &amp; swap approvals
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-slate-700">
          {/* Key Business Facts Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              1. Customer &amp; Commercial Context
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-blue-600 font-semibold mb-1">
                  <Building2 className="w-3.5 h-3.5" />
                  Scale
                </div>
                <div className="text-lg font-extrabold text-slate-900">40 Clinics</div>
                <div className="text-[11px] text-slate-500">Multi-location across India</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold mb-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  ARR Impact
                </div>
                <div className="text-lg font-extrabold text-slate-900">&#8377;60 Lakh</div>
                <div className="text-[11px] text-slate-500">Annual recurring revenue</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-amber-600 font-semibold mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Contract Renewal
                </div>
                <div className="text-lg font-extrabold text-slate-900">Dec 2026</div>
                <div className="text-[11px] text-slate-500">High-stakes account retention</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-indigo-600 font-semibold mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  Engineering Effort
                </div>
                <div className="text-lg font-extrabold text-slate-900">~1 Sprint</div>
                <div className="text-[11px] text-slate-500">High leverage release</div>
              </div>
            </div>
          </div>

          {/* Problem & Root Cause */}
          <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
              <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
              The Clinical Audit Incident &amp; Current Operational Workaround
            </div>
            <p className="leading-relaxed text-red-950">
              A previous regulatory/clinical audit identified <strong>two shifts covered by nurses with expired Basic Life Support (BLS) certificates</strong>. 
            </p>
            <div className="p-3 bg-white/80 rounded-lg border border-red-200 text-[11px] space-y-1 text-slate-800">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                Current Manual Workaround:
              </div>
              <p>
                The clinic manager maintains certificate expiry dates in an Excel spreadsheet and manually cross-checks them during shift scheduling and swap approvals. When managers are rushed or approvals happen ad-hoc on mobile/WhatsApp, expired or unverified credentials slip through.
              </p>
            </div>
          </div>

          {/* Product Hypothesis */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
              <Target className="w-4 h-4 text-blue-600 shrink-0" />
              Core Product Hypothesis
            </div>
            <p className="leading-relaxed text-blue-950">
              <em>"Validating mandatory credentials during scheduling and swap approval will reduce reliance on manual checks and prevent assignments with invalid required credentials."</em>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Zero assignments allowed with expired, missing, or unverified mandatory certificates.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Enforced at both initial shift allocation and peer swap approvals (no bypass).</span>
              </div>
            </div>
          </div>

          {/* Strict Non-Compliance Disclaimer */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <h4 className="font-bold text-amber-950">Regulatory Scope &amp; Compliance Statement</h4>
              <p>
                <strong>Disclaimer:</strong> This prototype demonstrates automated frontend validation logic for a Product Manager internship case study. It does not claim that this prototype proves regulatory compliance or guarantees that future incidents will be completely eliminated. Real-world compliance also depends on staff credential verification integrity, HR document ingestion, and organizational compliance culture.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Shiftwell Case Study &bull; CarePoint Clinics Account
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};
