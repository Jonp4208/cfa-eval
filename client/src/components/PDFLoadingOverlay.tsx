import React from 'react';
import { Loader2, FileText } from 'lucide-react';

interface PDFLoadingOverlayProps {
  isVisible: boolean;
  progress: number;
  step: string;
}

export default function PDFLoadingOverlay({ isVisible, progress, step }: PDFLoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          {/* Icon */}
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-[#E51636] rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Loader2 className="w-6 h-6 text-[#E51636] animate-spin" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Generating PDF
          </h3>

          {/* Step description */}
          <p className="text-gray-600 mb-6">
            {step}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-[#E51636] to-[#C41E3A] h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress percentage */}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{progress}% complete</span>
            <span className="text-[#E51636] font-medium">
              {progress === 100 ? 'Done!' : 'Please wait...'}
            </span>
          </div>

          {/* Additional info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 This may take a few seconds depending on the playbook size
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
