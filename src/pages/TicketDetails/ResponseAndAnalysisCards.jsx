import React, { useState, useEffect } from 'react';
import { Edit, User, Calendar, Save, Zap, FileText, CheckCircle2, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Combobox } from '../../components/Combobox';
import { formatDateTime, formatDateForInput } from '../../utils/formatters';

const DetailItem = ({ icon, label, value }) => (
    <div className="flex gap-3">
        {icon}
        <div className="flex-1 min-w-0">
            <dt className="text-sm font-medium text-gray-500 flex items-center">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 font-semibold break-words whitespace-pre-wrap">{value || 'N/A'}</dd>
        </div>
    </div>
);

// --- First Response Card (No changes) ---
export const FirstResponseCard = ({
    ticket,
    respondedBy,
    setRespondedBy,
    respondedAt,
    setRespondedAt,
    respondRemarks,
    setRespondRemarks,
    engineerSelectOptions,
    handleRespond
}) => {
    const hasExistingResponse = !!ticket.first_responded_by;
    const [isEditing, setIsEditing] = useState(!hasExistingResponse);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsEditing(!hasExistingResponse);
    }, [hasExistingResponse]);

    const handleCancel = () => {
        setRespondedBy(ticket.first_responded_by || '');
        setRespondedAt(ticket.first_responded_at ? formatDateForInput(ticket.first_responded_at) : '');
        setRespondRemarks(ticket.first_respond_remarks || '');
        setIsEditing(false);
        setIsOpen(false);
    };

    return (
        <div className="card-style bg-white rounded-lg shadow-sm">
            <h3
                className="h3-style flex justify-between items-center text-blue-800 bg-blue-50 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    First Response
                    {hasExistingResponse && <CheckCircle2 size={18} className="text-green-600" />}
                </div>

                {hasExistingResponse && !isEditing && isOpen && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                    >
                        <Edit size={16} /> Edit
                    </button>
                )}
            </h3>

            {isOpen && (
                <>
                    {hasExistingResponse && !isEditing ? (
                        <div className="p-4 text-sm text-gray-700 space-y-3">
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-3">
                                <DetailItem icon={<User size={20} className="text-blue-500" />} label="Responded By" value={ticket.respondedByName} />
                                <DetailItem icon={<Calendar size={20} className="text-blue-500" />} label="Responded At" value={ticket.first_responded_at ? formatDateTime(ticket.first_responded_at) : 'N/A'} />
                            </dl>
                            <DetailItem icon={<FileText size={20} className="text-blue-500" />} label="Remarks" value={ticket.first_respond_remarks} />
                        </div>
                    ) : (
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="label-style">Responded By</label>
                                    <Combobox
                                        options={engineerSelectOptions}
                                        value={respondedBy}
                                        onChange={(value) => setRespondedBy(value || '')}
                                        placeholder="Select employee..."
                                        optionValue="value"
                                        optionLabel="label"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="respondedAt" className="label-style">Responded At</label>
                                    <input
                                        type="datetime-local"
                                        id="respondedAt"
                                        min={formatDateForInput(ticket.complaint_at)}
                                        max={formatDateForInput(new Date())}
                                        value={respondedAt}
                                        onChange={(e) => setRespondedAt(e.target.value)}
                                        className="input-style"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-4 space-y-1">
                                <label htmlFor="respondRemarks" className="label-style">Remarks</label>
                                <textarea
                                    id="respondRemarks"
                                    value={respondRemarks}
                                    onChange={(e) => setRespondRemarks(e.target.value)}
                                    className="input-style"
                                    placeholder="Enter response remarks..."
                                    rows="2"
                                    required
                                />
                            </div>
                            <div className="flex gap-2 mt-4 justify-end">
                                <button
                                    onClick={handleRespond}
                                    className="btn-primary gap-2 disabled:opacity-50"
                                    disabled={!respondedAt || !respondedBy || !respondRemarks}
                                >
                                    {hasExistingResponse ? 'Save Changes' : 'Submit'}
                                </button>
                                {hasExistingResponse && (
                                    <button onClick={handleCancel} className="btn-secondary">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// --- Root Cause Card (UPDATED) ---
export const RootCauseCard = ({
    ticket,
    rootCause,
    setRootCause,
    rootCauseProvider,
    setRootCauseProvider,
    rootCauseProvidedAt,
    setRootCauseProvidedAt,
    handleSaveRootCause
}) => {
    const hasExistingRootCause = !!ticket.root_cause;
    const [isEditing, setIsEditing] = useState(!hasExistingRootCause);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsEditing(!hasExistingRootCause);
    }, [hasExistingRootCause]);

    const handleCancel = () => {
        setRootCause(ticket.root_cause || '');
        setRootCauseProvider(ticket.root_cause_provider || '');
        setRootCauseProvidedAt(ticket.root_cause_provided_at ? formatDateForInput(ticket.root_cause_provided_at) : '');
        setIsEditing(false);
        setIsOpen(false);
    };

    return (
        <div className="card-style bg-white rounded-lg shadow-sm">
            <h3
                className="h3-style flex justify-between items-center text-indigo-800 bg-indigo-50 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    Root Cause Analysis
                    {hasExistingRootCause && <CheckCircle2 size={18} className="text-green-600" />}
                </div>

                {hasExistingRootCause && !isEditing && isOpen && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setRootCause(ticket.root_cause || '');
                            setRootCauseProvider(ticket.root_cause_provider || '');
                            setRootCauseProvidedAt(ticket.root_cause_provided_at ? formatDateForInput(ticket.root_cause_provided_at) : '');
                            setIsEditing(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                    >
                        <Edit size={16} /> Edit
                    </button>
                )}
            </h3>

            {isOpen && (
                <>
                    {hasExistingRootCause && !isEditing ? (
                        <div className="p-4 text-sm text-gray-700 space-y-3">
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                                <DetailItem icon={<User size={20} className="text-indigo-500" />} label="Provider" value={ticket.root_cause_provider} />
                                <DetailItem icon={<Calendar size={20} className="text-indigo-500" />} label="Provided At" value={ticket.root_cause_provided_at ? formatDateTime(ticket.root_cause_provided_at) : 'N/A'} />
                            </dl>
                            <DetailItem icon={<Zap size={20} className="text-indigo-500" />} label="Root Cause" value={ticket.root_cause} />
                        </div>
                    ) : (
                        <div className="p-4 space-y-4">
                            <div className="space-y-1">
                                <label htmlFor="rootCause" className="label-style">Root Cause</label>
                                <textarea
                                    id="rootCause"
                                    value={rootCause}
                                    onChange={(e) => setRootCause(e.target.value)}
                                    className="input-style w-full"
                                    placeholder="Enter the root cause of the issue..."
                                    rows="2"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label htmlFor="rootCauseProvider" className="label-style">Root Cause Provider</label>
                                    <input
                                        type="text"
                                        id="rootCauseProvider"
                                        value={rootCauseProvider}
                                        onChange={(e) => setRootCauseProvider(e.target.value)}
                                        className="input-style w-full"
                                        placeholder="Enter provider name..."
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="rootCauseProvidedAt" className="label-style">Provided At</label>
                                    <input
                                        type="datetime-local"
                                        id="rootCauseProvidedAt"
                                        value={rootCauseProvidedAt}
                                        onChange={(e) => setRootCauseProvidedAt(e.target.value)}
                                        min={formatDateForInput(ticket.complaint_at)}
                                        max={formatDateForInput(new Date())}
                                        className="input-style w-full"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2 justify-end">
                                <button
                                    onClick={handleSaveRootCause}
                                    className="btn-primary gap-2 disabled:opacity-50"
                                    disabled={!rootCause.trim() || !rootCauseProvider.trim() || !rootCauseProvidedAt}
                                >
                                    {hasExistingRootCause ? 'Save Changes' : 'Submit'}
                                </button>
                                {hasExistingRootCause && (
                                    <button onClick={handleCancel} className="btn-secondary">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// --- Resolution Card (No changes) ---
export const ResolutionCard = ({
    ticket,
    remarks,
    setRemarks,
    resolvedAt,
    setResolvedAt,
    handleResolve
}) => {
    const minResolutionTime = ticket.first_responded_at || ticket.complaint_at;

    const handleResolvedAtChange = (e) => {
        const selectedTime = new Date(e.target.value);
        const baselineTime = new Date(minResolutionTime);

        if (selectedTime < baselineTime) {
            const errorMessage = ticket.first_responded_at
                ? "Resolved At cannot be before Response Time."
                : "Resolved At cannot be before Complaint Time.";
            toast.error(errorMessage);
            setResolvedAt(formatDateForInput(minResolutionTime));
        } else {
            setResolvedAt(e.target.value);
        }
    };

    return (
        <div className="card-style bg-white rounded-lg shadow-sm overflow-hidden">
            <h3 className="h3-style text-green-800 bg-green-50">
                Resolution
            </h3>
            <div className="p-4 space-y-4">
                <div className="space-y-1">
                    <label htmlFor="resolutionRemarks" className="label-style">Resolution Remarks</label>
                    <textarea
                        id="resolutionRemarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows="3"
                        className="input-style w-full"
                        placeholder="Enter a detailed resolution summary..."
                        required
                    />
                </div>
                <div className='flex flex-col sm:flex-row justify-between items-end gap-4'>
                    <div className="w-full sm:w-auto">
                        <label htmlFor="resolvedAt" className="label-style">Resolved At</label>
                        <input
                            type="datetime-local"
                            id="resolvedAt"
                            value={resolvedAt}
                            min={formatDateForInput(minResolutionTime)}
                            max={formatDateForInput(new Date())}
                            onChange={handleResolvedAtChange}
                            className="input-style w-full"
                            required
                        />
                    </div>
                    <button
                        onClick={handleResolve}
                        className="w-full sm:w-auto btn-primary py-2 bg-green-600 hover:bg-green-700 focus:ring-green-500 gap-2 disabled:opacity-50"
                        disabled={!remarks || !resolvedAt}
                    >
                        <CheckCircle size={16} /> Mark as Resolved
                    </button>
                </div>
            </div>
        </div>
    );
};