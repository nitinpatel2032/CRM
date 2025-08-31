import React, { useState, useRef, useEffect } from 'react';
import { User, Calendar, History, Paperclip, Clock, FileText, Megaphone, UserCheck, UserCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

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

const DetailItem = ({ icon, label, value, onHistoryClick }) => (
    <div className="flex gap-4 items-start">
        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">{icon}</div>
        <div className="flex-1">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
                {label}
                {onHistoryClick && (
                    <button onClick={onHistoryClick} className="text-gray-400 hover:text-indigo-600 transition ml-2 p-1 rounded-full hover:bg-gray-100">
                        <History size={14} />
                    </button>
                )}
            </dt>
            <dd className="mt-1 text-sm text-gray-900 font-semibold">{value || 'N/A'}</dd>
        </div>
    </div>
);


const AttachmentItem = ({ attachment, onAttachmentClick }) => {
    const handleFileClick = (e) => {
        e.preventDefault();
        onAttachmentClick(attachment);
    };

    return (
        <a
            href="#"
            onClick={handleFileClick}
            title={attachment.file_name}
            className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-medium transition-colors"
        >
            <Paperclip size={14} />
            <span className="truncate max-w-[200px]">{attachment.file_name}</span>
        </a>
    );
};

const TicketDetailsCard = ({ ticket, assignmentHistory, initialAttachments, onAttachmentClick }) => {
    const [showAssigneeHistory, setShowAssigneeHistory] = useState(false);
    const assigneeHistoryRef = useRef(null);

    useClickOutside(assigneeHistoryRef, () => setShowAssigneeHistory(false));

    return (
        <div className="card-style bg-white rounded-lg shadow-sm overflow-hidden">
            <h3 className="h3-style">Details</h3>

            <dl className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-3">
                <DetailItem icon={<User size={20} className="text-sky-600" />} label="Created By" value={ticket.created_by_name} />
                <DetailItem icon={<Clock size={20} className="text-red-600" />} label="Complaint Time" value={formatDateTime(ticket.complaint_at)} />
                <DetailItem icon={<Megaphone size={20} className="text-amber-600" />} label="Complaint Through" value={ticket.channel} />
                <DetailItem icon={<UserCircle size={20} className="text-red-600" />} label="Complaint By" value={ticket.complaint_by} />

                {ticket.assigned_to_name && <div className="relative" ref={assigneeHistoryRef}>
                    <DetailItem
                        icon={<UserCheck size={20} className="text-teal-600" />}
                        label="Assigned To"
                        value={ticket.assigned_to_name}
                        onHistoryClick={assignmentHistory.length > 0 ? () => setShowAssigneeHistory(p => !p) : null}
                    />
                    {showAssigneeHistory && assignmentHistory.length > 0 && (
                        <div className="absolute z-10 top-full mt-2 w-60 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl">
                            <h4 className="font-bold pb-1 mb-1 border-b border-gray-600">Assignment History</h4>
                            <ul className="space-y-1.5 mt-2">{assignmentHistory.map(i => <li key={i.id} className="flex justify-between items-center"><span>{i.name}</span> <span className="text-gray-400 text-right">{formatDateTime(i.date)}</span></li>).reverse()}</ul>
                        </div>
                    )}
                </div>}

                {ticket.first_responded_by && (
                    <>
                        <DetailItem icon={<User size={20} className="text-emerald-600" />} label="First Responded By" value={ticket.respondedByName} />
                        <DetailItem icon={<Clock size={20} className="text-emerald-600" />} label="First Responded At" value={ticket.first_responded_at ? formatDateTime(ticket.first_responded_at) : 'N/A'} />
                        <DetailItem icon={<FileText size={20} className="text-emerald-600" />} label="First Response Remarks" value={ticket.first_respond_remarks} />
                    </>
                )}

                {ticket.root_cause && (
                    <>
                        <DetailItem icon={<FileText size={20} className="text-orange-600" />} label="Root Cause" value={ticket.root_cause} />
                        <DetailItem icon={<User size={20} className="text-orange-600" />} label="Root Cause Provider" value={ticket.root_cause_provider} />
                        <DetailItem icon={<Calendar size={20} className="text-orange-600" />} label="Root Cause Provided At" value={ticket.root_cause_provided_at ? formatDateTime(ticket.root_cause_provided_at) : 'N/A'} />
                    </>
                )}
            </dl>

            <div className={`border-t p-4 flex justify-between items-start gap-6 border-gray-200 ${initialAttachments.length > 0 ? 'flex-col md:flex-row' : ''}`}>
                <div>
                    <h4 className="text-sm font-semibold text-gray-700">Initial Complaint</h4>
                    <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{ticket.description}</p>
                </div>
                {initialAttachments.length > 0 && (
                    <div className="flex-shrink-0">
                        <h4 className="text-sm font-semibold text-gray-700">Attachments</h4>
                        <div className="flex flex-wrap gap-3 mt-1">
                            {initialAttachments.map(att => <AttachmentItem key={att.id} attachment={att} onAttachmentClick={onAttachmentClick} />)}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default TicketDetailsCard;