import React, { useState } from 'react';
import { X } from 'lucide-react';
import { subMonths, format } from 'date-fns';

export const ExportModal = ({ isOpen, onClose, onExport, exportType }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [datePreset, setDatePreset] = useState('all_time');

    if (!isOpen) return null;

    const handleDatePresetChange = (e) => {
        const preset = e.target.value;
        setDatePreset(preset);

        const today = new Date();
        const dateFormat = 'yyyy-MM-dd';

        if (preset === 'all_time') {
            setStartDate('');
            setEndDate('');
        } else if (preset === 'last_month') {
            setStartDate(format(subMonths(today, 1), dateFormat));
            setEndDate(format(today, dateFormat));
        } else if (preset === 'last_3_months') {
            setStartDate(format(subMonths(today, 3), dateFormat));
            setEndDate(format(today, dateFormat));
        } else if (preset === 'custom') {
            setStartDate('');
            setEndDate('');
        }
    };

    const handleConfirm = () => {
        onExport({ startDate, endDate });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Export {exportType}</h2>
                    <button onClick={onClose} className='p-1 rounded-full hover:bg-gray-100 text-gray-600'><X size={20} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="label-style">Select Report Date Range</label>
                        <p className="text-xs text-gray-500 mb-2">This will filter tickets by their creation date.</p>

                        <div className="flex flex-wrap items-end gap-4">
                            {/* Date Preset Dropdown */}
                            <div className="flex-shrink-0">
                                <label className="label-style text-sm">Select Filter</label>
                                <select value={datePreset} onChange={handleDatePresetChange} className="input-style w-full sm:w-auto">
                                    <option value="all_time">All Time</option>
                                    <option value="last_month">Last Month</option>
                                    <option value="last_3_months">Last 3 Months</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>

                            {/* Custom Date Inputs */}
                            {datePreset === 'custom' && (
                                <>
                                    <div className="flex-1 min-w-[140px]">
                                        <label className="label-style text-sm">Start Date</label>
                                        <input type="date" className="input-style mt-1" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                    </div>
                                    <div className="flex-1 min-w-[140px]">
                                        <label className="label-style text-sm">End Date</label>
                                        <input type="date" className="input-style mt-1" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-6 mt-4 border-t">
                    <button type="button" onClick={handleConfirm} className="btn-primary">Download Report</button>
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                </div>
            </div>
        </div>
    );
};