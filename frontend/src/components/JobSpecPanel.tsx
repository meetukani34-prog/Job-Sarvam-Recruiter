"use client";

import { useState, useRef, useEffect } from "react";
import { Briefcase, MapPin, Clock, Target, FileText, Upload, X, CheckCircle2, File } from "lucide-react";

const DEFAULT_JD = {
  title: "Senior AI Engineer –\nFounding Team",
  subtitle: "Series A / Pune-Noida Hybrid",
  meta: [
    { icon: "briefcase", text: "5 – 9 Years of Experience" },
    { icon: "location", text: "Pune / Noida (Hybrid)" },
    { icon: "clock", text: "Immediate – 30 Day Notice" },
    { icon: "salary", text: "₹30L – ₹65L + Equity" },
  ],
  requirements: ["PyTorch", "CUDA Kernels", "Distributed Systems", "Vector DBs", "RAG Pipelines", "Transformer Arch"],
  insights: [
    {
      label: "What it says",
      text: '"Senior AI Engineer for founding team building next-gen retrieval intelligence."',
    },
    {
      label: "What it means",
      text: "They need someone who can architect production-grade RAG systems from scratch — not just call APIs. Expect to own embeddings, ranking models, and vector infrastructure end-to-end.",
    },
    {
      label: "Hidden signal",
      text: '"Founding team" = equity, ambiguity, and 0→1 building. They want product engineers who ship, not researchers who publish.',
    },
  ],
};

interface UploadedFile {
  name: string;
  size: number;
  content: string;
  uploadedAt: string;
}

export interface JDData {
  title: string;
  subtitle: string;
  meta: { icon: string; text: string }[];
  requirements: string[];
  insights: { label: string; text: string }[];
}

interface JobSpecPanelProps {
  onJDUploaded?: (jd: JDData) => void;
}

export default function JobSpecPanel({ onJDUploaded }: JobSpecPanelProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [jdData, setJdData] = useState<JDData>(DEFAULT_JD);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved file from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sarvam_jd_file");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUploadedFile(parsed.file);
        if (parsed.jd) setJdData(parsed.jd);
      } catch { /* ignore */ }
    }
  }, []);

  const handleFile = async (file: globalThis.File) => {
    const validTypes = [
      "text/plain",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isValid = validTypes.includes(file.type) || ['txt', 'pdf', 'doc', 'docx'].includes(ext || '');

    if (!isValid) {
      alert("Please upload a .txt, .pdf, .doc, or .docx file");
      return;
    }

    setIsUploading(true);

    // Read file content
    let content = "";
    if (file.type === "text/plain" || ext === "txt") {
      content = await file.text();
    } else {
      // For PDF/DOC/DOCX, we store metadata + note that parsing would need backend
      content = `[${file.name}] — ${(file.size / 1024).toFixed(1)}KB ${file.type || ext?.toUpperCase()} file uploaded. Content extraction requires backend processing.`;
    }

    const uploadedFileData: UploadedFile = {
      name: file.name,
      size: file.size,
      content: content.slice(0, 5000), // Cap at 5000 chars for localStorage
      uploadedAt: new Date().toISOString(),
    };

    // Simulate upload delay
    await new Promise(r => setTimeout(r, 800));

    // Parse JD
    const lower = content.toLowerCase();
    const isAI = lower.includes('ai') || lower.includes('machine learning');
    const isFrontend = lower.includes('react') || lower.includes('frontend') || lower.includes('ui');
    const isBackend = lower.includes('backend') || lower.includes('node') || lower.includes('api');
    
    let parsedTitle = "Software Engineer";
    if (isAI) parsedTitle = "Senior AI Engineer";
    else if (isFrontend) parsedTitle = "Frontend Engineer";
    else if (isBackend) parsedTitle = "Backend Engineer";
    
    const reqs = [];
    if (lower.includes('python')) reqs.push("Python");
    if (lower.includes('react')) reqs.push("React");
    if (lower.includes('node')) reqs.push("Node.js");
    if (lower.includes('sql') || lower.includes('database')) reqs.push("SQL");
    if (lower.includes('aws') || lower.includes('cloud')) reqs.push("AWS");
    if (lower.includes('docker') || lower.includes('kubernetes')) reqs.push("Docker");
    if (lower.includes('pytorch') || lower.includes('tensorflow')) reqs.push("PyTorch");
    if (reqs.length === 0) reqs.push("JavaScript", "Problem Solving", "System Design");

    const newJd: JDData = {
      title: parsedTitle,
      subtitle: file.name,
      meta: [
        { icon: "briefcase", text: lower.includes("senior") || lower.includes("lead") ? "5 – 9 Years of Experience" : "2 – 4 Years of Experience" },
        { icon: "location", text: lower.includes("remote") ? "Remote" : "Hybrid / On-site" },
        { icon: "clock", text: "Immediate" },
        { icon: "salary", text: "Competitive + Equity" },
      ],
      requirements: reqs.slice(0, 6),
      insights: [
        { label: "What it says", text: `Role focuses on ${reqs[0] || 'core engineering'} development.` },
        { label: "Hidden signal", text: "They value shipping fast over perfection. Product mindset required." }
      ]
    };

    setUploadedFile(uploadedFileData);
    setJdData(newJd);
    localStorage.setItem("sarvam_jd_file", JSON.stringify({ file: uploadedFileData, jd: newJd }));
    setIsUploading(false);
    setShowUploadArea(false);

    if (onJDUploaded) {
      onJDUploaded(newJd);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setJdData(DEFAULT_JD);
    localStorage.removeItem("sarvam_jd_file");
  };

  const MetaIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "briefcase": return <Briefcase size={14} className="text-emerald-glow" />;
      case "location": return <MapPin size={14} className="text-emerald-glow" />;
      case "clock": return <Clock size={14} className="text-emerald-glow" />;
      case "salary": return <Target size={14} className="text-emerald-glow" />;
      default: return <Briefcase size={14} className="text-emerald-glow" />;
    }
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">
          Active Job Specification
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowUploadArea(!showUploadArea)}
            className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-md bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-emerald-glow/30 transition-all"
            title="Upload new JD"
          >
            <Upload size={10} />
            Upload JD
          </button>
          <span className="flex items-center gap-1.5 badge badge-emerald">
            <span className="live-dot" />
            Live
          </span>
        </div>
      </div>

      {/* Upload Area */}
      {showUploadArea && (
        <div className="mb-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-all ${
              isDragOver
                ? "border-emerald-glow/60 bg-emerald-glow/5"
                : "border-border-subtle bg-surface/30 hover:border-border"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-emerald-glow/30 border-t-emerald-glow rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground">Processing file...</p>
              </div>
            ) : (
              <>
                <Upload size={24} className="mx-auto text-muted mb-2" />
                <p className="text-xs font-medium text-foreground mb-1">
                  Drop your JD file here
                </p>
                <p className="text-[10px] text-muted mb-3">
                  Supports .txt, .pdf, .doc, .docx
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-medium text-foreground hover:bg-surface-hover transition-colors"
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Uploaded File Badge */}
      {uploadedFile && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-emerald-glow/5 border border-emerald-glow/20 rounded-lg">
          <File size={14} className="text-emerald-glow shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{uploadedFile.name}</p>
            <p className="text-[10px] text-muted">{(uploadedFile.size / 1024).toFixed(1)}KB • Uploaded {new Date(uploadedFile.uploadedAt).toLocaleDateString()}</p>
          </div>
          <button onClick={handleRemoveFile} className="p-1 hover:bg-surface rounded transition-colors">
            <X size={12} className="text-muted hover:text-red-400" />
          </button>
        </div>
      )}

      {/* Uploaded JD Content Preview */}
      {uploadedFile && uploadedFile.content && !uploadedFile.content.startsWith('[') && (
        <div className="mb-5 bg-surface/50 border border-border-subtle rounded-xl p-4 max-h-40 overflow-y-auto">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText size={12} />
            Uploaded JD Content
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {uploadedFile.content.slice(0, 2000)}
            {uploadedFile.content.length > 2000 && "..."}
          </p>
        </div>
      )}

      {/* Active JD Display */}
      <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-300">
        <h1 className="text-xl font-bold text-foreground mb-1 whitespace-pre-line leading-tight">
          {jdData.title}
        </h1>
        <p className="text-sm text-muted-foreground mb-5 truncate">
          {jdData.subtitle}
        </p>

        <div className="space-y-3 mb-6">
          {jdData.meta.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 text-[13px] text-gray-300">
              <MetaIcon type={item.icon} />
              {item.text}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2.5">
            Hard Requirements
          </h3>
          <div className="flex flex-wrap gap-2">
            {jdData.requirements.map((req, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-emerald-glow/10 text-emerald-bright border border-emerald-glow/20"
              >
                {req}
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Weightings */}
        <div className="mb-6">
          <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">
            AI Discovery Weighting
          </h3>
          <div className="space-y-3">
            <WeightBar label="Technical Depth" pct={jdData.requirements.includes("PyTorch") || jdData.requirements.includes("AWS") ? 45 : 40} />
            <WeightBar label="Experience Fit" pct={30} />
            <WeightBar label="Behavioral Signals" pct={20} />
            <WeightBar label="Education Tier" pct={10} />
          </div>
        </div>

        {/* Decoder Insights */}
        <div className="mt-auto">
          <h3 className="flex items-center gap-1.5 text-[10px] font-semibold text-muted uppercase tracking-wider mb-3">
            <FileText size={12} />
            JD Decoded
          </h3>
          <div className="space-y-3">
            {jdData.insights.map((insight, i) => (
              <div key={i} className="pl-3 border-l-2 border-border-subtle group hover:border-emerald-glow/40 transition-colors">
                <p className="text-[10px] font-medium text-emerald-bright mb-0.5">
                  {insight.label}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {insight.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WeightBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-surface-active rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-glow to-emerald-bright"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-emerald-bright w-8 text-right">
        {pct}%
      </span>
    </div>
  );
}
