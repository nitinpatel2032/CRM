import React, { useState } from 'react';
import { Combobox } from '../Combobox';
import { Search, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { subMonths, format } from 'date-fns';

export const TicketFilters = ({
    filters,
    setters,
    options,
    showAdvancedFilters,
    setShowAdvancedFilters,
}) => {
    const [datePreset, setDatePreset] = useState('custom');

    const handleDatePresetChange = (e) => {
        const preset = e.target.value;
        setDatePreset(preset);
        const today = new Date();
        const dateFormat = 'yyyy-MM-dd';

        if (preset === 'all_time') {
            setters.setCreatedStartFilter('');
            setters.setCreatedEndFilter('');
            return;
        }
        if (preset === 'custom') return;

        let monthsToSubtract = 0;
        if (preset === 'last_month') monthsToSubtract = 1;
        if (preset === 'last_3_months') monthsToSubtract = 3;

        const startDate = format(subMonths(today, monthsToSubtract), dateFormat);
        setters.setCreatedStartFilter(startDate);
        setters.setCreatedEndFilter(format(today, dateFormat));
    };

    const handleResetFilters = () => {
        setters.setSearchQuery('');
        setters.setProjectFilter('');
        setters.setLocationFilter('');
        // setters.setStatusFilter(''); // This line is now removed to preserve the status filter
        setters.setCreatedStartFilter('');
        setters.setCreatedEndFilter('');
        setters.setResolvedStartFilter('');
        setters.setResolvedEndFilter('');
        setShowAdvancedFilters(false);
        setDatePreset('custom');
    };

    return (
        <div className="space-y-4 w-full">
            {/* --- PRIMARY FILTERS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 items-center">
                <div className="relative sm:col-span-2 md:col-span-3 lg:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search ID or Title..." className="input-style pl-10 w-full" value={filters.searchQuery} onChange={e => setters.setSearchQuery(e.target.value)} />
                </div>
                <Combobox options={options.projectFilterOptions} value={filters.projectFilter} onChange={setters.setProjectFilter} placeholder="All Projects" />
                <Combobox options={options.locationFilterOptions} value={filters.locationFilter} onChange={setters.setLocationFilter} placeholder="All Locations" />
                <Combobox options={options.statusOptions} value={filters.statusFilter} onChange={setters.setStatusFilter} placeholder="All Statuses" />

                {/* --- ACTION BUTTONS --- */}
                <div className="flex items-center justify-start sm:justify-end gap-2">
                    <button onClick={handleResetFilters} title="Reset Filters" className="btn-secondary text-sm justify-center px-2 py-1.5 flex-grow sm:flex-grow-0">
                        <RefreshCw className="w-4 h-4 mr-1" /> Reset
                    </button>
                    <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} title="Toggle Advanced Filters" className="btn-secondary text-sm justify-center px-2 py-1.5 flex-grow sm:flex-grow-0">
                        {showAdvancedFilters ? 'Less' : 'More'}
                        {showAdvancedFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                    </button>
                </div>
            </div>

            {/* --- ADVANCED FILTERS --- */}
            {showAdvancedFilters && (
                <div className="p-3 bg-gray-50/70 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        {/* Created Date Preset */}
                        <div className="md:col-span-1">
                            <label className="label-style">Date Preset</label>
                            <select value={datePreset} onChange={handleDatePresetChange} className="input-style mt-1 w-full">
                                <option value="custom">Custom</option>
                                <option value="last_month">Last Month</option>
                                <option value="last_3_months">Last 3 Months</option>
                                <option value="all_time">All Time</option>
                            </select>
                        </div>

                        {/* Created Date Range */}
                        <div className="md:col-span-2">
                            <label className="label-style">Created Between</label>
                            <div className="flex items-center gap-2">
                                <input type="date" className="input-style w-full disabled:bg-gray-100" value={filters.createdStartFilter} onChange={e => setters.setCreatedStartFilter(e.target.value)} disabled={datePreset !== 'custom'} onClick={() => setDatePreset('custom')} />
                                <span className="text-gray-500 flex-shrink-0">-</span>
                                <input type="date" className="input-style w-full disabled:bg-gray-100" value={filters.createdEndFilter} onChange={e => setters.setCreatedEndFilter(e.target.value)} min={filters.createdStartFilter} disabled={datePreset !== 'custom'} onClick={() => setDatePreset('custom')} />
                            </div>
                        </div>

                        {/* Resolved Date Range */}
                        <div className="md:col-span-2">
                            <label className="label-style">Resolved Between</label>
                            <div className="flex items-center gap-2">
                                <input type="date" className="input-style w-full" value={filters.resolvedStartFilter} onChange={e => setters.setResolvedStartFilter(e.target.value)} />
                                <span className="text-gray-500 flex-shrink-0">-</span>
                                <input type="date" className="input-style w-full" value={filters.resolvedEndFilter} onChange={e => setters.setResolvedEndFilter(e.target.value)} min={filters.resolvedStartFilter} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};