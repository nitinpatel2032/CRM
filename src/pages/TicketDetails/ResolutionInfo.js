import React, { useState, useRef, useEffect } from 'react';
import { User, Calendar, Clock, History, RotateCcw, X, FileText } from 'lucide-react';
import { usePermissions } from '../../context/PermissionsContext';
import { formatDateTime } from '../../utils/formatters';

const timeDiff = (startDate, endDate) => {
    let seconds = Math.floor((new Date(endDate) - new Date(startDate)) / 1000);
    if (seconds < 60) return `${seconds}s`;
    let minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    let hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${minutes % 60}m`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
};

// Custom Hook to handle clicks outside a component
const useClickOutside = (ref, callback) => {
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref, callback]);
};

// DetailItem component remains the same
const DetailItem = ({ icon, label, value }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
            {icon} {label}
        </dt>
        <dd className="mt-1 text-sm text-gray-900 font-semibold">{value || 'N/A'}</dd>
    </div>
);

// --- UPDATED COMPONENT ---
const ResolutionInfo = ({ ticket, latestResolution, isInternalUser, reopenRemarks, setReopenRemarks, handleReopen, resolutionHistory, reopenHistory }) => {
    const { permissions } = usePermissions();
    const ticketDetailsPermissions = permissions?.TicketDetails || {};

    const [showResolutionHistory, setShowResolutionHistory] = useState(false);
    const [showAllTimes, setShowAllTimes] = useState(false);
    const [showResolverHistory, setShowResolverHistory] = useState(false);
    const [showReopenHistory, setShowReopenHistory] = useState(false);

    const mainHistoryRef = useRef(null);
    const allTimesRef = useRef(null);
    const resolverHistoryRef = useRef(null);
    const reopenHistoryRef = useRef(null);

    useClickOutside(mainHistoryRef, () => setShowResolutionHistory(false));
    useClickOutside(allTimesRef, () => setShowAllTimes(false));
    useClickOutside(resolverHistoryRef, () => setShowResolverHistory(false));
    useClickOutside(reopenHistoryRef, () => setShowReopenHistory(false));

    return (
        <div className="relative rounded-lg shadow-sm overflow-hidden" ref={mainHistoryRef}>
            {isInternalUser && (
                <div className="border-l-4 border-green-500 bg-green-50/50">
                    <div className="p-4">
                        <div className="flex justify-between items-center bg-green-100 p-2 rounded-lg shadow-sm">
                            <h3 className="text-lg font-bold text-green-800">Ticket Resolved</h3>
                        </div>
                        <dl className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Last Resolved By with History */}
                            <div className="relative" ref={resolverHistoryRef}>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                        <User size={20} className="text-green-500" />
                                        <span>Resolved By</span>
                                        {resolutionHistory.length > 1 &&
                                            <button onClick={() => setShowResolverHistory(p => !p)} className="text-gray-400 hover:text-indigo-600 transition" title="View previous resolvers">
                                                <History size={14} />
                                            </button>
                                        }
                                    </dt>
                                    <dd className="mt-1 ml-7 text-sm text-gray-900 font-semibold">{latestResolution.changedByName}</dd>
                                </div>
                                {showResolverHistory && (
                                    <div className="absolute z-10 top-full mt-2 w-72 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-xl">
                                        <h4 className="font-bold pb-1 mb-1 border-b border-gray-600">Previous Resolvers</h4>
                                        <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
                                            {resolutionHistory.slice(1).map(res => (
                                                <li key={res.id} className="flex justify-between items-center">
                                                    <span>{res.changedByName}</span>
                                                    <span className="text-gray-400">{formatDateTime(res.changed_at)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Last Resolution Time with History */}
                            <div className="relative" ref={allTimesRef}>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                        <Clock size={20} className="text-green-500" />
                                        <span>Resolution Time</span>
                                    </dt>
                                    <dd className="mt-1 ml-7 text-sm text-gray-900 font-semibold">{timeDiff(ticket.complaint_at, ticket.resolved_at)}</dd>
                                </div>
                                {showAllTimes && (
                                    <div className="absolute z-10 top-full mt-2 w-52 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-xl">
                                        <h4 className="font-bold pb-1 mb-1 border-b border-gray-600">All Resolution Times</h4>
                                    </div>
                                )}
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <Calendar size={20} className="text-green-500" />
                                    <span>Resolved At</span>
                                </dt>
                                <dd className="mt-1 ml-7 text-sm text-gray-900 font-semibold">{formatDateTime(ticket.resolved_at)}</dd>
                            </div>

                            {/* Total Reopens with History */}
                            {/* <div className="relative" ref={reopenHistoryRef}>
                                {showReopenHistory && (
                                    <div className="absolute z-10 top-full mt-2 w-52 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-xl">
                                        <h4 className="font-bold pb-1 mb-1 border-b border-gray-600">Reopen History</h4>
                                        <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
                                            {reopenHistory.map(reopen => (
                                                <li key={reopen.id} className="flex justify-between items-center">
                                                    <span>{reopen.changedByName}</span>
                                                    <span className="text-gray-400">{formatDateTime(reopen.changed_at)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div> */}
                        </dl>
                        <div className="mt-4 border-t pt-3">
                            <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <FileText size={20} className="text-green-500" />
                                <h4 className="text-sm font-semibold text-gray-700">Resolution Summary</h4>
                            </dt>
                            <p className="mt-1 text-sm text-gray-800 bg-gray-50 p-3 rounded-md border">{latestResolution.remarks}</p>
                        </div>
                    </div>
                </div>
            )}

            {ticketDetailsPermissions.reopen === 1 && (
                <div className="border-l-4 border-amber-500 bg-amber-50/50 p-4 space-y-2">
                    <label className="label-style">Need to reopen?</label>
                    <textarea value={reopenRemarks} onChange={(e) => setReopenRemarks(e.target.value)} rows="2" className="input-style w-full" placeholder="Reason for reopening..." />
                    <button onClick={handleReopen} className="w-full btn-primary bg-amber-500 hover:bg-amber-600 focus:ring-amber-500"><RotateCcw size={16} />Reopen Ticket</button>
                </div>
            )}

            {/* --- HISTORY POPOVER --- */}
            {isInternalUser && showResolutionHistory && (
                <div className="w-72 absolute z-20 top-0 right-0 p-3 bg-gray-800 text-white rounded-lg shadow-xl">
                    <div className="flex justify-between items-center border-b border-gray-600 pb-1 mb-2">
                        <h4 className="font-semibold text-base">Resolution Cycle History</h4>
                        <button onClick={() => setShowResolutionHistory(false)} className="text-gray-400 hover:text-white"><X size={17} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResolutionInfo;