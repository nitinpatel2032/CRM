import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Loader } from 'lucide-react';
import apiService from '../../services/apiService';
import { formatDateTime } from '../../utils/formatters';
import { getStatusBadge, calculateResolutionTime } from '../../utils/ticketUtils';

const InfoRow = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 py-2">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="col-span-2 text-sm text-gray-900">{value || '---'}</dd>
    </div>
);

export const TicketReportModal = ({ ticketId, onClose }) => {
    const [ticketData, setTicketData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (ticketId) {
            setLoading(true);
            apiService.fetchTicketById(ticketId)
                .then(res => setTicketData(res.data))
                .catch(err => toast.error("Failed to fetch ticket details."))
                .finally(() => setLoading(false));
        }
    }, [ticketId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <h2 className="text-lg font-bold text-gray-800">Ticket Report</h2>
                    <button onClick={onClose} className='p-1 rounded-full hover:bg-gray-100 text-gray-600'><X size={20} /></button>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader className="animate-spin text-blue-600" size={32} />
                    </div>
                ) : !ticketData ? (
                    <div className="text-center py-10">
                        <p>Could not load ticket data.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-md text-gray-800 border-b pb-2 mb-2">Ticket Details</h3>
                            <dl className="divide-y divide-gray-200">
                                <InfoRow label="Ticket ID" value={ticketData.ticket_id} />
                                <InfoRow label="Title" value={ticketData.title} />
                                <InfoRow label="Status" value={<span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(ticketData.status)}`}>{ticketData.status}</span>} />
                                <InfoRow label="Description" value={<p className="whitespace-pre-wrap">{ticketData.description}</p>} />
                                <InfoRow label="Created By" value={ticketData.createdByName} />
                                <InfoRow label="Created At" value={formatDateTime(ticketData.createdAt)} />
                            </dl>
                        </div>
                        <div>
                            <h3 className="font-semibold text-md text-gray-800 border-b pb-2 mb-2">Complaint & Project Details</h3>
                            <dl className="divide-y divide-gray-200">
                                <InfoRow label="Project" value={ticketData.projectName} />
                                <InfoRow label="Location" value={ticketData.locationName} />
                                <InfoRow label="Company" value={ticketData.companyName} />
                                <InfoRow label="Complaint By" value={ticketData.complaint_by} />
                                <InfoRow label="Complaint Channel" value={ticketData.channel} />
                                <InfoRow label="Complaint Time" value={formatDateTime(ticketData.complaint_at)} />
                            </dl>
                        </div>
                        <div>
                            <h3 className="font-semibold text-md text-gray-800 border-b pb-2 mb-2">First Response Details</h3>
                            <dl className="divide-y divide-gray-200">
                                <InfoRow label="Responded By" value={ticketData.respondedByName} />
                                <InfoRow label="Responded At" value={formatDateTime(ticketData.respondedAt)} />
                                <InfoRow label="Response Remarks" value={<p className="whitespace-pre-wrap">{ticketData.respond_remarks}</p>} />
                            </dl>
                        </div>
                        <div>
                            <h3 className="font-semibold text-md text-gray-800 border-b pb-2 mb-2">Root Cause Analysis</h3>
                            <dl className="divide-y divide-gray-200">
                                <InfoRow label="Root Cause" value={ticketData.root_cause} />
                                <InfoRow label="Provider Name" value={ticketData.rootCauseProviderName} />
                            </dl>
                        </div>
                        <div>
                            <h3 className="font-semibold text-md text-gray-800 border-b pb-2 mb-2">Resolution Details</h3>
                            <dl className="divide-y divide-gray-200">
                                <InfoRow label="Resolved By" value={ticketData.updatedByName} />
                                <InfoRow label="Resolved At" value={ticketData.status === 'Resolved' ? formatDateTime(ticketData.updatedAt) : '---'} />
                                <InfoRow label="Resolution Time" value={calculateResolutionTime(ticketData.complaint_at, ticketData.updatedAt, ticketData.status)} />
                            </dl>
                        </div>
                        <div className="flex justify-end">
                            <button type="button" onClick={onClose} className="btn-secondary">Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};