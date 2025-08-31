import React from 'react';
import { Download, BarChart2 } from 'lucide-react';

export const ExportControls = ({ onAnalyticsClick, onExportClick }) => {
    return (
        <div className="flex-shrink-0 flex items-center text-sm gap-2">
            <button onClick={onAnalyticsClick} className="btn-secondary btn-sm">
                <BarChart2 size={16} className='mr-1' /> Analytics
            </button>
            <button onClick={() => onExportClick('Excel')} className="btn-secondary btn-sm">
                <Download size={16} className="mr-1" /> Excel
            </button>
            <button onClick={() => onExportClick('PDF')} className="btn-secondary btn-sm">
                <Download size={16} className="mr-1" /> PDF
            </button>
        </div>
    );
};