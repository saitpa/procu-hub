import React from 'react';
import { AttachmentFile } from '../types';
import { formatFileSize, formatThaiDate } from '../utils';
import { X, Download, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';

interface AttachmentViewerModalProps {
  attachment: AttachmentFile | null;
  onClose: () => void;
}

export const AttachmentViewerModal: React.FC<AttachmentViewerModalProps> = ({
  attachment,
  onClose,
}) => {
  if (!attachment) return null;

  const isImage =
    attachment.type.startsWith('image/') ||
    attachment.name.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.dataUrl;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 truncate">
                {attachment.name}
              </h3>
              <p className="text-xs text-slate-500">
                {formatFileSize(attachment.size)} • อัปโหลดเมื่อ {attachment.uploadedAt}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>ดาวน์โหลด</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-950/5 flex items-center justify-center min-h-[300px]">
          {isImage ? (
            <img
              src={attachment.dataUrl}
              alt={attachment.name}
              className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-md border border-slate-200/60"
            />
          ) : (
            <div className="text-center p-8 bg-white rounded-xl border border-slate-200 shadow-xs max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="font-semibold text-slate-800 text-base mb-1">
                {attachment.name}
              </h4>
              <p className="text-xs text-slate-500 mb-6">
                ไฟล์เอกสาร ({attachment.type || 'PDF/Document'}) • {formatFileSize(attachment.size)}
              </p>
              <button
                onClick={handleDownload}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>คลิกเพื่อเปิด / ดาวน์โหลดไฟล์</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
