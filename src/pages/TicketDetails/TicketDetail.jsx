import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Combobox } from '../../components/Combobox';
import { Building, Briefcase, MapPin, X } from 'lucide-react';
import apiService from '../../services/apiService';

import TicketDetailsCard from './TicketDetailsCard';
import ResolutionInfo from './ResolutionInfo';
import ActivityTimeline from './ActivityTimeline';
import { usePermissions } from '../../context/PermissionsContext';
import { formatDateForInput } from '../../utils/formatters';
import { FirstResponseCard, RootCauseCard, ResolutionCard } from './ResponseAndAnalysisCards';

// --- IMAGE VIEWER MODAL ---
const ImageViewerModal = ({ imageUrl, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
        <div className="relative max-w-4xl max-h-full p-4">
            <button onClick={onClose} className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-gray-800 hover:bg-gray-200 transition-all">
                <X size={24} />
            </button>
            <img src={imageUrl} alt="Full size attachment" className="max-w-full max-h-[90vh] object-contain rounded-lg" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/EEE/31343C?text=Image+Not+Found'; }} />
        </div>
    </div>
);

// --- HELPER FUNCTION FOR FILE HANDLING ---
const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};


const TicketDetail = () => {
    const { id } = useParams();
    const { permissions } = usePermissions();
    const ticketDetailsPermissions = permissions?.TicketDetails || {};

    // --- STATE MANAGEMENT ---
    const [ticket, setTicket] = useState(null);
    const [isInternalUser, setIsInternalUser] = useState(true);
    const [comments, setComments] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [newCommentTimestamp, setNewCommentTimestamp] = useState(formatDateForInput(new Date()));
    const [newAttachment, setNewAttachment] = useState(null);
    const [respondedBy, setRespondedBy] = useState('');
    const [respondedAt, setRespondedAt] = useState('');
    const [respondRemarks, setRespondRemarks] = useState('');
    const [rootCause, setRootCause] = useState('');
    const [rootCauseProvider, setRootCauseProvider] = useState('');
    const [rootCauseProvidedAt, setRootCauseProvidedAt] = useState('');
    const [remarks, setRemarks] = useState('');
    const [resolvedAt, setResolvedAt] = useState('');
    const [reopenRemarks, setReopenRemarks] = useState('');
    const [viewingImage, setViewingImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [teamMembers, setTeamMembers] = useState([]);
    const [selectedSE, setSelectedSE] = useState('');
    const [assignedAt, setAssignedAt] = useState(formatDateForInput(new Date()));
    const [statusHistory, setStatusHistory] = useState([]);
    const [assignmentLog, setAssignmentLog] = useState([]);
    const [resolutionMetrics, setResolutionMetrics] = useState(null);

    // --- DATA FETCHING ---
    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const ticketRes = await apiService.fetchTicketById(id);
            const currentTicketData = ticketRes.data;
            const currentTicket = currentTicketData.ticket;

            if (currentTicket && currentTicket.project_id) {
                const usersRes = await apiService.fetchUsersByProject(currentTicket.project_id);
                setTeamMembers(usersRes.data.data || []);
            }

            setTicket(currentTicket);
            setIsInternalUser(currentTicketData.isInternal === 1);
            setRespondedBy(currentTicket.first_responded_by || '');
            setRespondedAt(currentTicket.first_responded_at ? formatDateForInput(currentTicket.first_responded_at) : '');
            setRespondRemarks(currentTicket.first_respond_remarks || '');
            setRootCause(currentTicket.root_cause || '');
            setRootCauseProvider(currentTicket.root_cause_provider || '');
            setRootCauseProvidedAt(currentTicket.root_cause_provided_at ? formatDateForInput(currentTicket.root_cause_provided_at) : '');
            setStatusHistory(currentTicketData.history || []);
            setAssignmentLog(currentTicketData.assignments || []);
            setComments(currentTicketData.comments || []);
            setAttachments(currentTicketData.attachments || []);

        } catch (error) {
            toast.error("Could not load ticket details.");
            setTicket(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [id]);

    // --- ATTACHMENT CLICK HANDLER ---
    const handleViewAttachment = async (attachment) => {
        try {
            const res = await apiService.getAttachmentById(attachment.id);
            const attachmentData = res.data.data;

            const base64String = attachmentData.file_data;
            if (!base64String) {
                throw new Error('File data is missing.');
            }

            const url = `data:${attachmentData.file_type};base64,${base64String}`;
            const isImage = attachmentData.file_type.startsWith('image/');
            const isPdf = attachmentData.file_type === 'application/pdf';

            if (isImage) {
                setViewingImage(url);
            } else {
                const blob = dataURLtoBlob(url);
                const blobUrl = window.URL.createObjectURL(blob);
                if (isPdf) {
                    window.open(blobUrl, '_blank');
                } else {
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = attachment.file_name;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(blobUrl);
                }
            }
        } catch (error) {
            console.error("Failed to fetch attachment", error);
            toast.error(`Could not load ${attachment.file_name}.`);
        }
    };

    // --- OTHER HANDLER FUNCTIONS ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) { setNewAttachment(null); return; }
        if (file.size > 10 * 1024 * 1024) { toast.error("File is too large (max 10MB)."); return; }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            setNewAttachment({ name: file.name, type: file.type, data: base64String });
        };
        reader.onerror = () => toast.error('Could not process file.');
    };
    const handleAssignTicket = async () => {
        if (!selectedSE) return toast.error("Please select an employee to assign the ticket to.");
        if (!assignedAt) return toast.error("Please provide the assignment time.");
        try {
            await apiService.assignTicket(id, { userId: parseInt(selectedSE), assigned_at: assignedAt });
            toast.success("Ticket assigned successfully!");
            fetchAllData();
        } catch (error) { console.error("Failed to assign ticket", error); }
    };
    const handleAddComment = async () => {
        if (!newComment.trim()) return toast.error("Comment text cannot be empty.");
        if (!newCommentTimestamp) return toast.error("Please provide the comment time.");
        try {
            await apiService.addCommentToTicket(id, {
                text: newComment,
                attachment: newAttachment,
                commented_at: newCommentTimestamp
            });
            toast.success('Comment added!');
            setNewComment('');
            setNewAttachment(null);
            setNewCommentTimestamp(formatDateForInput(new Date()));
            fetchAllData();
        } catch (error) { console.error("Failed to add comment/attachment", error); }
    };
    const handleRespond = async () => {
        if (!respondedBy) return toast.error("Please select who responded.");
        if (!respondedAt) return toast.error("Please select the response time.");
        if (!respondRemarks.trim()) return toast.error("Response remarks cannot be empty.");
        try {
            await apiService.respondToTicket(id, { responded_by: respondedBy, responded_at: respondedAt, respond_remarks: respondRemarks });
            toast.success('Response details saved successfully!');
            fetchAllData();
        } catch (error) { console.error("Failed to respond to ticket", error); }
    };
    const handleSaveRootCause = async () => {
        if (!rootCause.trim()) return toast.error("Root cause cannot be empty.");
        if (!rootCauseProvider.trim()) return toast.error("Please enter a root cause provider.");
        if (!rootCauseProvidedAt) return toast.error("Please provide the time for the root cause analysis.");
        try {
            await apiService.saveRootCause(id, {
                root_cause: rootCause,
                root_cause_provider: rootCauseProvider,
                root_cause_provided_at: rootCauseProvidedAt
            });
            toast.success('Root cause saved successfully!');
            fetchAllData();
        } catch (error) { console.error("Failed to save root cause", error); }
    };
    const handleResolve = async () => {
        if (!remarks.trim()) return toast.error("Resolution remarks cannot be empty.");
        if (!resolvedAt) return toast.error("Please provide the resolution time.");
        try {
            await apiService.resolveTicket(id, { resolution_summary: remarks, resolved_at: resolvedAt });
            toast.success('Ticket has been resolved!');
            fetchAllData();
        } catch (error) { console.error("Failed to resolve ticket", error); }
    };
    const handleReopen = async () => {
        if (!reopenRemarks.trim()) return toast.error("Remarks are required to reopen the ticket.");
        try {
            await apiService.reopenTicket(id, { remarks: reopenRemarks });
            toast.success('Ticket has been reopened!');
            setReopenRemarks('');
            fetchAllData();
        } catch (error) { console.error("Failed to reopen ticket", error); }
    };

    // --- MEMOIZED VALUES & DERIVED STATE ---
    const userColors = useMemo(() => {
        const bgColors = ['bg-indigo-50', 'bg-sky-50', 'bg-amber-50', 'bg-rose-50', 'bg-teal-50'];
        const textColors = ['text-indigo-700', 'text-sky-700', 'text-amber-700', 'text-rose-700', 'text-teal-700'];
        const mapping = new Map();
        [...new Set(comments.map(c => c.author_name))].forEach((author, i) => {
            mapping.set(author, { bg: bgColors[i % bgColors.length], text: textColors[i % textColors.length] });
        });
        return mapping;
    }, [comments]);
    const userBgColors = useMemo(() => new Map([...userColors].map(([k, v]) => [k, v.bg])), [userColors]);
    const userTextColors = useMemo(() => new Map([...userColors].map(([k, v]) => [k, v.text])), [userColors]);

    const activityLog = useMemo(() => {
        const formattedComments = comments.map(c => ({
            type: 'comment',
            id: `c-${c.id}`,
            timestamp: new Date(c.commented_at || c.created_at),
            data: c
        }));
        const significantStatusChanges = statusHistory
            .filter(e => e.new_status === 'Resolved' || e.new_status === 'Reopened')
            .map(e => ({
                type: 'status',
                id: `s-${e.id}`,
                timestamp: new Date(e.changed_at),
                data: { ...e, status: e.new_status, author_name: e.changed_by_name }
            }));
        return [...formattedComments, ...significantStatusChanges].sort((a, b) => b.timestamp - a.timestamp);
    }, [comments, statusHistory]);

    const resolutionHistory = useMemo(() => statusHistory.filter(e => e.new_status === 'Resolved').sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at)), [statusHistory]);
    const latestResolution = resolutionHistory[0];
    const reopenHistory = useMemo(() => statusHistory.filter(e => e.new_status === 'Reopened').sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at)), [statusHistory]);

    const assignmentHistory = useMemo(() => {
        if (!assignmentLog || assignmentLog.length <= 1) return [];
        const history = assignmentLog.map(e => ({
            id: e.id,
            name: e.assigned_to_name,
            date: new Date(e.assigned_at)
        })).sort((a, b) => b.date - a.date);
        return history.slice(1);
    }, [assignmentLog]);

    const currentAssigneeId = useMemo(() => ticket?.assigned_to || null, [ticket]);

    const allEngineerOptions = useMemo(() => {
        return teamMembers.map(se => ({ value: se.id, label: se.name }));
    }, [teamMembers]);

    const assignEngineerSelectOptions = useMemo(() => {
        if (!currentAssigneeId) return allEngineerOptions;
        return allEngineerOptions.filter(opt => opt.value !== currentAssigneeId);
    }, [allEngineerOptions, currentAssigneeId]);

    const ticketWithDerivedNames = useMemo(() => {
        if (!ticket) return null;
        const responder = teamMembers.find(tm => tm.id === ticket.first_responded_by);
        return {
            ...ticket,
            respondedByName: responder ? responder.name : (ticket.first_responded_by ? 'Unknown User' : null)
        };
    }, [ticket, teamMembers]);


    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (!ticket) return <div className="p-8 text-center text-red-500">Ticket not found.</div>;

    const initialAttachments = attachments.filter(att => !att.comment_id);
    const getCommentAttachments = (commentId) => attachments.filter(att => att.comment_id === commentId);

    const StatusBadge = ({ status }) => {
        const statusStyles = {
            Resolved: 'bg-green-100 text-green-800 border-green-200',
            'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            Reopened: 'bg-orange-100 text-orange-800 border-orange-200',
            default: 'bg-blue-100 text-blue-800 border-blue-200',
        };
        const style = statusStyles[status] || statusStyles.default;
        return <span className={`px-3 py-1 text-xs font-bold rounded-full border ${style}`}>{status}</span>;
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {viewingImage && <ImageViewerModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />}

            <header className="mb-2 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <p className="text-sm font-semibold text-indigo-600">TICKET #{ticket.ticket_uid}</p>
                        <h1 className="text-xl font-bold text-gray-800">{ticket.title}</h1>
                    </div>
                    <StatusBadge status={ticket.status} />
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200/80 flex items-center gap-x-6 gap-y-2 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1.5 text-orange-500"><Building size={14} />{ticket.company_name}</span>
                    <span className="flex items-center gap-1.5 text-purple-500"><Briefcase size={14} />{ticket.project_name}</span>
                    <span className="flex items-center gap-1.5 text-red-500"><MapPin size={14} />{ticket.location_name}</span>
                </div>
            </header>

            <div className={`grid grid-cols-1 lg:grid-cols-6 gap-6`}>
                <div className={`lg:col-span-3 space-y-5`}>
                    <TicketDetailsCard
                        ticket={ticketWithDerivedNames}
                        assignmentHistory={assignmentHistory}
                        initialAttachments={initialAttachments}
                        onAttachmentClick={handleViewAttachment}
                    />

                    {ticket.status !== 'Resolved' && (
                        <>
                            {ticketDetailsPermissions.assign === 1 && (
                                <div className="card-style bg-white rounded-lg shadow-sm">
                                    <h3 className="h3-style">Assign Ticket</h3>
                                    <div className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="label-style">Assign To</label>
                                                <Combobox
                                                    options={assignEngineerSelectOptions}
                                                    value={selectedSE}
                                                    onChange={(value) => setSelectedSE(value || '')}
                                                    placeholder="-- Select an employee --"
                                                    optionValue="value"
                                                    optionLabel="label"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="assignedAt" className="label-style">Assign At</label>
                                                <input
                                                    type="datetime-local"
                                                    id="assignedAt"
                                                    value={assignedAt}
                                                    onChange={(e) => setAssignedAt(e.target.value)}
                                                    min={formatDateForInput(ticket.complaint_at)}
                                                    max={formatDateForInput(new Date())}
                                                    className="input-style w-full"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <button
                                                onClick={handleAssignTicket}
                                                className="btn-primary disabled:opacity-50"
                                                disabled={!selectedSE || !assignedAt}>
                                                Assign
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {ticketDetailsPermissions.response === 1 && (
                                <FirstResponseCard
                                    ticket={ticketWithDerivedNames}
                                    respondedBy={respondedBy}
                                    setRespondedBy={setRespondedBy}
                                    respondedAt={respondedAt}
                                    setRespondedAt={setRespondedAt}
                                    respondRemarks={respondRemarks}
                                    setRespondRemarks={setRespondRemarks}
                                    engineerSelectOptions={allEngineerOptions}
                                    handleRespond={handleRespond}
                                />
                            )}
                            {ticketDetailsPermissions.rootCause === 1 && (
                                <RootCauseCard
                                    ticket={ticket}
                                    rootCause={rootCause}
                                    setRootCause={setRootCause}
                                    rootCauseProvider={rootCauseProvider}
                                    setRootCauseProvider={setRootCauseProvider}
                                    rootCauseProvidedAt={rootCauseProvidedAt}
                                    setRootCauseProvidedAt={setRootCauseProvidedAt}
                                    handleSaveRootCause={handleSaveRootCause}
                                />
                            )}
                            <ResolutionCard
                                ticket={ticket}
                                remarks={remarks}
                                setRemarks={setRemarks}
                                resolvedAt={resolvedAt}
                                setResolvedAt={setResolvedAt}
                                handleResolve={handleResolve}
                            />
                        </>
                    )}
                    {ticket.status === 'Resolved' && latestResolution && (
                        <ResolutionInfo
                            ticket={ticket}
                            latestResolution={latestResolution}
                            isInternalUser={isInternalUser}
                            reopenRemarks={reopenRemarks}
                            setReopenRemarks={setReopenRemarks}
                            handleReopen={handleReopen}
                            resolutionHistory={resolutionHistory}
                            reopenHistory={reopenHistory}
                        />
                    )}
                </div>

                <div className={`lg:col-span-3 space-y-4`}>
                    <ActivityTimeline
                        ticketStatus={ticket.status}
                        activityLog={activityLog}
                        userBgColors={userBgColors}
                        userTextColors={userTextColors}
                        newComment={newComment}
                        setNewComment={setNewComment}
                        newCommentTimestamp={newCommentTimestamp}
                        setNewCommentTimestamp={setNewCommentTimestamp}
                        complaintAt={ticket.complaint_at}
                        newAttachment={newAttachment}
                        setNewAttachment={setNewAttachment}
                        handleFileChange={handleFileChange}
                        handleAddComment={handleAddComment}
                        getCommentAttachments={getCommentAttachments}
                        onAttachmentClick={handleViewAttachment}
                    />
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;