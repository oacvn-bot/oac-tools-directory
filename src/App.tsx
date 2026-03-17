import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import { ExternalLink, BookOpen, AlertCircle, UploadCloud, Send, Menu, X, CheckCircle2, Bug, Image, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Tool {
  name: string;
  link: string;
  guide: string;
}

function FeedbackForm({ toolName, onSuccess, compact = false }: { toolName?: string, onSuccess?: () => void, compact?: boolean }) {
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from<File>(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !feedback.trim()) return;

    setFeedbackStatus('submitting');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('feedback', feedback);
      files.forEach(file => {
        formData.append('screenshot', file);
      });
      formData.append('tool', toolName || 'Global');

      const webhookUrl = 'https://n8n.oachiring.com/webhook/tool-feedback';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setFeedbackStatus('success');
      setName('');
      setFeedback('');
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      if (onSuccess) {
        setTimeout(() => {
          setFeedbackStatus('idle');
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFeedbackStatus('error');
      setTimeout(() => setFeedbackStatus('idle'), 3000);
    }
  };

  return (
    <div className={compact ? "" : "bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10"}>
      {!compact && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Submit Feedback / Report Error</h2>
          <p className="mt-2 text-slate-600">Help us improve our tools by sharing your experience or reporting issues.</p>
        </div>
      )}

      {feedbackStatus === 'success' ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center ${compact ? 'py-6' : 'py-12'}`}
        >
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h3>
          <p className="text-slate-600 mb-8">Your feedback has been successfully submitted. We appreciate your input!</p>
          {!compact && (
            <button
              onClick={() => setFeedbackStatus('idle')}
              className="inline-flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              Submit Another
            </button>
          )}
        </motion.div>
      ) : (
        <form onSubmit={handleSubmitFeedback} className="space-y-6 text-left">
          <div>
            <label htmlFor={`name-${toolName || 'global'}`} className="block text-sm font-medium text-slate-700 mb-1">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id={`name-${toolName || 'global'}`}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-slate-50 focus:bg-white"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor={`feedback-${toolName || 'global'}`} className="block text-sm font-medium text-slate-700 mb-1">
              Feedback / Inquiry <span className="text-red-500">*</span>
            </label>
            <textarea
              id={`feedback-${toolName || 'global'}`}
              required
              rows={compact ? 3 : 4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-slate-50 focus:bg-white resize-none"
              placeholder={compact ? "Describe the issue with this tool..." : "Describe your feedback or the issue you encountered..."}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Screenshots (Optional)
            </label>
            <div 
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400 bg-slate-50'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
            >
              <div className="space-y-1 text-center">
                <UploadCloud className={`mx-auto h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                <div className="flex text-sm text-slate-600 justify-center">
                  <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    Upload a file
                    <input
                      id={`file-upload-${toolName || 'global'}`}
                      name="file-upload"
                      type="file"
                      multiple
                      className="sr-only"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 flex items-center truncate max-w-[80%]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </p>
                    <button 
                      type="button" 
                      onClick={() => removeFile(index)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={feedbackStatus === 'submitting'}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {feedbackStatus === 'submitting' ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              <span className="flex items-center">
                <Send className="w-5 h-5 mr-2" />
                Submit Feedback
              </span>
            )}
          </button>
          
          {feedbackStatus === 'error' && (
            <p className="text-sm text-red-600 text-center mt-2">There was an error submitting your feedback. Please try again.</p>
          )}
        </form>
      )}
    </div>
  );
}

function ToolCard({ tool, onGuideClick, index }: { tool: Tool, onGuideClick: (guide: string) => void, index: number, key?: React.Key }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-slate-100 transition-all duration-200 flex flex-col h-full group"
    >
      <div className="flex-1">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">{tool.name}</h3>
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <a 
          href={tool.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 inline-flex justify-center items-center px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Open Tool
          <ExternalLink className="ml-2 w-4 h-4" />
        </a>
        <button 
          onClick={() => onGuideClick(tool.guide)}
          className="flex-1 inline-flex justify-center items-center px-4 py-2.5 rounded-xl bg-white text-blue-600 border border-blue-200 text-sm font-medium hover:bg-blue-50 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          User Guide
        </button>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100">
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className={`w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isExpanded 
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          }`}
        >
          {isExpanded ? (
            <>
              <X className="w-4 h-4 mr-2" /> Close Form
            </>
          ) : (
            <>
              <Bug className="w-4 h-4 mr-2" /> Report Issue / Feedback
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-5 mt-2 border-t border-slate-50">
              <FeedbackForm toolName={tool.name} onSuccess={() => setIsExpanded(false)} compact={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface FeedbackRecord {
  id: string;
  name: string;
  tool: string;
  feedback: string;
  screenshot: string;
  pic: string;
  status: boolean;
}

function getDirectImageUrl(url: string): string {
  const driveRegex = /drive\.google\.com\/file\/d\/([^/]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=s0`;
  }
  return url;
}

function Thumbnail({ url, originalUrl, onClick, alt }: { url: string, originalUrl: string, onClick: () => void, alt: string }) {
  const [error, setError] = useState(false);
  
  return (
    <div className="flex flex-col items-center gap-1">
      <button 
        onClick={onClick}
        className="inline-block relative group"
        title="View Screenshot"
      >
        <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center hover:border-blue-400 transition-colors">
          {error ? (
            <ImageOff className="w-4 h-4 text-slate-400" />
          ) : (
            <img 
              src={url} 
              alt={alt} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer" 
              onError={() => {
                setError(true);
              }}
            />
          )}
        </div>
      </button>
      <a 
        href={originalUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5"
        title="Open Original"
      >
        <ExternalLink className="w-3 h-3" />
        Original
      </a>
    </div>
  );
}

function LightboxImage({ url, originalUrl, alt, zoomLevel, index }: { url: string, originalUrl: string, alt: string, zoomLevel: number, index: number }) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [url]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-white/50">
        <ImageOff className="w-16 h-16 mb-4" />
        <p>Image failed to load</p>
        <a 
          href={originalUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open Original Link
        </a>
      </div>
    );
  }

  return (
    <motion.img 
      key={index}
      initial={{ opacity: 0, scale: 0.9, x: 0, y: 0 }}
      animate={{ opacity: 1, scale: zoomLevel, ...(zoomLevel <= 1 ? { x: 0, y: 0 } : {}) }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      src={url} 
      alt={alt}
      className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl ${zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
      referrerPolicy="no-referrer"
      style={{ transformOrigin: 'center center' }}
      drag={zoomLevel > 1}
      dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
      draggable={false}
      onError={() => {
        setError(true);
      }}
    />
  );
}

function FixerDashboard() {
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filterTool, setFilterTool] = useState('All');
  const [filterPic, setFilterPic] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Lightbox state
  const [lightboxImages, setLightboxImages] = useState<{original: string, converted: string}[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSR7IoGKgzHxxVbvPjpH6Uv1-7OzxHaSriFauuuSYfHbr5udQhv1UCA5YdyDa8JeqLPAZP9aqCwsyH6/pub?output=csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedFeedbacks = results.data.map((row: any, index: number) => ({
              id: `${row['Name'] || 'anon'}-${row['Feedback'] || 'nofeedback'}-${index}`,
              name: row['Name'] || '',
              tool: row['Tool'] || 'Global',
              feedback: row['Feedback'] || '',
              screenshot: row['Screenshots'] || row['Screenshot'] || '',
              pic: row['PIC'] || '', 
              status: row['Status'] === 'TRUE' || row['Status'] === 'Done' || false,
            }));
            setFeedbacks(parsedFeedbacks);
            setLoading(false);
          },
          error: (error: any) => {
            console.error('Error parsing feedback CSV:', error);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const handleUpdate = async (id: string, field: 'pic' | 'status', value: string | boolean) => {
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
    setSavingId(id);

    const record = feedbacks.find(f => f.id === id);
    if (!record) {
      setSavingId(null);
      return;
    }

    try {
      const payload = {
        feedback: record.feedback,
        pic: field === 'pic' ? value : record.pic,
        status: field === 'status' ? value : record.status,
      };

      const webhookUrl = 'https://n8n.oachiring.com/webhook/update-feedback';
      
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const uniqueTools = ['All', ...Array.from(new Set(feedbacks.map(f => f.tool || 'Global'))).sort()];

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchTool = filterTool === 'All' || (f.tool || 'Global') === filterTool;
    const matchPic = filterPic === 'All' || (filterPic === 'Unassigned' ? !f.pic : f.pic === filterPic);
    const matchStatus = filterStatus === 'All' || (filterStatus === 'Done' ? f.status : !f.status);
    return matchTool && matchPic && matchStatus;
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <h2 className="text-xl font-bold text-slate-900">Fixer Dashboard</h2>
          <span className="text-sm text-slate-500 sm:hidden">{filteredFeedbacks.length} records</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select 
            value={filterTool} 
            onChange={e => setFilterTool(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 outline-none"
          >
            {uniqueTools.map(t => <option key={t} value={t}>{t === 'All' ? 'All Tools' : t}</option>)}
          </select>
          
          <select 
            value={filterPic} 
            onChange={e => setFilterPic(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 outline-none"
          >
            <option value="All">All PICs</option>
            <option value="anh Đức">anh Đức</option>
            <option value="Coby">Coby</option>
            <option value="Matthew">Matthew</option>
            <option value="Unassigned">Unassigned</option>
          </select>
          
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Done">Done</option>
          </select>
          
          <span className="text-sm text-slate-500 hidden sm:flex items-center ml-2">{filteredFeedbacks.length} records</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
              <th className="p-4 whitespace-nowrap">Tool</th>
              <th className="p-4 whitespace-nowrap">Name</th>
              <th className="p-4">Feedback</th>
              <th className="p-4 whitespace-nowrap">Screenshots</th>
              <th className="p-4 whitespace-nowrap">PIC</th>
              <th className="p-4 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredFeedbacks.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-sm text-slate-900 font-medium">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {row.tool || 'Global'}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600">{row.name}</td>
                <td className="p-4 text-sm text-slate-600 max-w-md truncate" title={row.feedback}>
                  {row.feedback}
                </td>
                <td className="p-4">
                  {row.screenshot ? (
                    <div className="flex flex-wrap gap-2">
                      {row.screenshot.split(/[\n,]+/).map((url, i, arr) => {
                        const cleanUrl = url.trim();
                        if (!cleanUrl) return null;
                        const displayUrl = getDirectImageUrl(cleanUrl);
                        const allUrls = arr.map(u => ({
                          original: u.trim(),
                          converted: getDirectImageUrl(u.trim())
                        })).filter(u => u.original);
                        
                        return (
                          <Thumbnail 
                            key={i}
                            url={displayUrl}
                            originalUrl={cleanUrl}
                            alt={`Screenshot ${i + 1}`}
                            onClick={() => {
                              setLightboxImages(allUrls);
                              setLightboxIndex(i);
                              setIsLightboxOpen(true);
                              setZoomLevel(1);
                            }}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">None</span>
                  )}
                </td>
                <td className="p-4">
                  <select 
                    className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:opacity-50"
                    value={row.pic}
                    onChange={(e) => handleUpdate(row.id, 'pic', e.target.value)}
                    disabled={savingId === row.id}
                  >
                    <option value="">Unassigned</option>
                    <option value="anh Đức">anh Đức</option>
                    <option value="Coby">Coby</option>
                    <option value="Matthew">Matthew</option>
                  </select>
                </td>
                <td className="p-4">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                      checked={row.status}
                      onChange={(e) => handleUpdate(row.id, 'status', e.target.checked)}
                      disabled={savingId === row.id}
                    />
                    <span className={`ml-3 text-sm font-medium ${row.status ? 'text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full' : 'text-slate-600'}`}>
                      {savingId === row.id ? 'Saving...' : (row.status ? 'Done' : 'Pending')}
                    </span>
                  </label>
                </td>
              </tr>
            ))}
            {filteredFeedbacks.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No feedback records found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isLightboxOpen && lightboxImages.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm"
          >
            <div className="absolute top-4 right-4 flex items-center gap-4 z-50" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors ml-4"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {lightboxImages.length > 1 && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(prev => (prev > 0 ? prev - 1 : lightboxImages.length - 1));
                    setZoomLevel(1);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                  title="Previous"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(prev => (prev < lightboxImages.length - 1 ? prev + 1 : 0));
                    setZoomLevel(1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                  title="Next"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            <div 
              className="relative w-full h-full flex items-center justify-center p-8"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsLightboxOpen(false);
                }
              }}
              onWheel={(e) => {
                if (e.deltaY < 0) {
                  setZoomLevel(prev => Math.min(4, prev + 0.1));
                } else {
                  setZoomLevel(prev => Math.max(0.2, prev - 0.1));
                }
              }}
            >
              <LightboxImage 
                url={lightboxImages[lightboxIndex].converted}
                originalUrl={lightboxImages[lightboxIndex].original}
                alt={`Screenshot ${lightboxIndex + 1}`}
                zoomLevel={zoomLevel}
                index={lightboxIndex}
              />
            </div>
            
            {lightboxImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-md z-50">
                {lightboxIndex + 1} / {lightboxImages.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'directory' | 'dashboard'>('directory');

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSZBe2BZKa2ggyxc3ky0x0R-WyYiOm63ZqmnAFvrxVEi7303a_C3np1OdHcf1iQrEm1EfPEQxnQjCjb/pub?output=csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedTools = results.data.map((row: any) => ({
              name: row['Tool'] || '',
              link: row['Link'] || '',
              guide: row['Guide'] || '',
            }));
            setTools(parsedTools);
            setLoading(false);
          },
          error: (error: any) => {
            console.error('Error parsing CSV:', error);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error fetching tools:', error);
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  const handleGuideClick = (guideLink: string) => {
    if (guideLink && guideLink.trim() !== '') {
      window.open(guideLink, '_blank');
    } else {
      setIsModalOpen(true);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => scrollToSection('home')}>
              <img 
                src="https://lh3.googleusercontent.com/d/1R8DanGbfO8Y39LlCbcQHXPNbvfKOwvdD" 
                alt="Company Logo" 
                className="h-8 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <button 
                onClick={() => { setCurrentView('directory'); setTimeout(() => scrollToSection('home'), 100); }} 
                className={`text-sm font-medium transition-colors ${currentView === 'directory' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
              >
                Directory
              </button>
              <button 
                onClick={() => setCurrentView('dashboard')} 
                className={`text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
              >
                Fixer Dashboard
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-500 hover:text-blue-600 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-4 space-y-1">
                <button onClick={() => { setCurrentView('directory'); setTimeout(() => scrollToSection('home'), 100); }} className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${currentView === 'directory' ? 'text-blue-600 bg-blue-50' : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'}`}>Directory</button>
                <button onClick={() => setCurrentView('dashboard')} className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${currentView === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'}`}>Fixer Dashboard</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24">
        {currentView === 'directory' ? (
          <>
            {/* Hero Section */}
            <section id="home" className="text-center pt-10 pb-8">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight"
              >
                Internal Tool Directory
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto"
              >
                Access all company tools, resources, and guides in one centralized hub. Report issues or submit feedback to help us improve.
              </motion.p>
            </section>

            {/* Tools Grid Section */}
            <section id="tools" className="scroll-mt-24">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900">All Tools</h2>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse h-48"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                  {tools.map((tool, index) => (
                    <ToolCard key={index} tool={tool} index={index} onGuideClick={handleGuideClick} />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <section id="dashboard" className="pt-4">
            <FixerDashboard />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-4 text-center text-slate-500 text-sm">
          <img 
            src="https://lh3.googleusercontent.com/d/1R8DanGbfO8Y39LlCbcQHXPNbvfKOwvdD" 
            alt="Company Logo" 
            className="h-6 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
            referrerPolicy="no-referrer"
          />
          <p>&copy; {new Date().getFullYear()} Internal Tool Directory. All rights reserved.</p>
        </div>
      </footer>

      {/* No Guide Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-xl z-50 p-8 text-center"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Guide Not Available</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Currently, this tool doesn't have a guide yet, please be patient! :3
              </p>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              >
                Got it, thanks!
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
