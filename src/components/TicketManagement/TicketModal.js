import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Paperclip, X, Trash2, Phone, Mail, MessageSquare } from 'lucide-react';
import apiService from '../../services/apiService';
import { Combobox } from '../Combobox';
import { formatDateForInput } from '../../utils/formatters';

const ChannelRadioButton = ({ id, name, value, checked, onChange, label, icon }) => (
    <div>
        <input type="radio" id={id} name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
        <label
            htmlFor={id}
            className={`flex items-center justify-center p-2 text-center rounded-lg border-2 cursor-pointer transition-all ${checked ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-300 bg-white hover:border-blue-400'
                }`}
        >
            {icon}
            <span className="ml-2 text-xs">{label}</span>
        </label>
    </div>
);

export const TicketModal = ({ closeModal, onTicketSaved, ticketToEdit = null }) => {
    const isEditMode = Boolean(ticketToEdit);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectId: '',
        locationId: '',
        channel: '',
        complaintBy: '',
        complaintTime: isEditMode ? '' : formatDateForInput(new Date())
    });

    const [selectedProjectName, setSelectedProjectName] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [assignedProjects, setAssignedProjects] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [existingAttachment, setExistingAttachment] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        apiService.fetchProjects()
            .then(res => {
                const responseData = res.data;
                if (responseData.success === 1 && Array.isArray(responseData.data)) {
                    const transformed = responseData.data
                        .filter(project => project.isActive === 1)
                        .flatMap(project => {
                            return project.project_locations.map(location => ({
                                projectId: project.id,
                                locationId: location.id,
                                name: project.name,
                                location_name: location.location_name,
                                companyId: project.company_id,
                                companyName: project.companyName,
                                projectManager: project.projectManager,
                                isInternal: project.isInternal,
                                userCount: project.userCount
                            }));
                        });
                    setAssignedProjects(transformed);
                } else {
                    console.error("Unexpected response structure", responseData);
                }
            })
            .catch(err => console.error("Failed to fetch user's projects", err));
    }, []);


    useEffect(() => {
        if (isEditMode && ticketToEdit && assignedProjects.length > 0) {

            // Find the specific project-location assignment from the flattened list.
            const currentAssignment = assignedProjects.find(
                p => p.projectId === ticketToEdit.project_id && p.locationId === ticketToEdit.location_id
            );

            if (currentAssignment) {
                setSelectedProjectName(currentAssignment.name);
                setSelectedCompany({
                    id: currentAssignment.companyId,
                    name: currentAssignment.companyName
                });

                setFormData({
                    title: ticketToEdit.title || '',
                    description: ticketToEdit.description || '',
                    projectId: ticketToEdit.project_id || '',
                    locationId: ticketToEdit.location_id || '',
                    channel: ticketToEdit.channel || '',
                    complaintTime: ticketToEdit.complaint_at ? formatDateForInput(new Date(ticketToEdit.complaint_at)) : '',
                    complaintBy: ticketToEdit.complaint_by || ''
                });

                if (ticketToEdit.attachment) {
                    setExistingAttachment(ticketToEdit.attachment);
                }
            } else {
                toast.error("You may no longer have access to this ticket's project/location.");
            }
        }
    }, [isEditMode, ticketToEdit, assignedProjects]);


    const uniqueProjectsForDropdown = useMemo(() => {
        const projectsMap = new Map();
        assignedProjects.forEach(assignment => {
            if (!projectsMap.has(assignment.projectId)) {
                projectsMap.set(assignment.projectId, {
                    id: assignment.projectId,
                    name: assignment.name
                });
            }
        });
        return Array.from(projectsMap.values());
    }, [assignedProjects]);

    const availableLocationsForDropdown = useMemo(() => {
        if (!formData.projectId) return [];
        // Filter locations based on the currently selected projectId in the form data
        return assignedProjects.filter(p => p.projectId === formData.projectId);
    }, [formData.projectId, assignedProjects]);

    const isFormInvalid = useMemo(() => {
        return !formData.title.trim() || !formData.projectId || !formData.locationId || !formData.description.trim() || !formData.channel || !formData.complaintTime || !formData.complaintBy;
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'complaintTime' && value) {
            const selectedTime = new Date(value);
            const now = new Date();

            if (selectedTime > now) {
                toast.error("Future time is not allowed. Resetting to current time.");
                const formattedNow = formatDateForInput(now);
                setFormData(prev => ({ ...prev, complaintTime: formattedNow }));
                return;
            }
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProjectSelect = (projectName) => {
        const selected = assignedProjects.find(p => p.name === projectName);
        if (selected) {
            setSelectedProjectName(selected.name);
            setSelectedCompany({
                id: selected.companyId ?? null,
                name: selected.companyName
            });
            setFormData(prev => ({
                ...prev,
                projectId: selected.projectId,
                locationId: "",
            }));
        }
    };

    const handleLocationChange = (locationIdValue) => {
        setFormData(prev => ({
            ...prev,
            locationId: Number(locationIdValue)
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File is too large. Maximum size is 10MB.");
            e.target.value = '';
            return;
        }
        setExistingAttachment(null);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => setSelectedFile({ name: file.name, type: file.type, data: reader.result.split(',')[1] });
        reader.onerror = (error) => {
            console.error('Error converting file to Base64:', error);
            toast.error('Could not process file.');
        };
    };

    const clearFile = () => {
        setSelectedFile(null);
        setExistingAttachment(null);
        const fileInput = document.getElementById('file-upload-modal');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isFormInvalid) return toast.error('Please fill out all required fields.');

        setIsSubmitting(true);
        try {
            const payload = { ...formData };
            if (selectedFile) {
                payload.attachment = selectedFile;
            } else if (existingAttachment) {
                payload.attachment = {
                    name: existingAttachment.name,
                    path: existingAttachment.path
                };
            } else {
                payload.attachment = null;
            }

            if (isEditMode) {
                await apiService.updateTicket({ id: ticketToEdit.id, ...payload });
                toast.success('Ticket updated successfully!');
            } else {
                await apiService.createTicket(payload);
                toast.success('Ticket created successfully!');
            }
            onTicketSaved();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} ticket.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Ticket' : 'Create New Ticket'}</h2>
                    <button onClick={closeModal} className='p-1 rounded-full hover:bg-gray-100 text-gray-600'><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
                        <div>
                            <label className="label-style">Project <span className="text-red-500">*</span></label>
                            <Combobox options={uniqueProjectsForDropdown} value={selectedProjectName} onChange={handleProjectSelect} placeholder="-- Select Project --" optionValue="name" optionLabel="name" />
                        </div>
                        <div>
                            <label className="label-style">Location <span className="text-red-500">*</span></label>
                            <Combobox
                                options={availableLocationsForDropdown}
                                value={formData.locationId}
                                onChange={handleLocationChange}
                                placeholder="-- Select Location --"
                                optionValue="locationId"
                                optionLabel="location_name"
                                disabled={!formData.projectId}
                            />
                        </div>
                        <div>
                            <label className="label-style mb-1">Complaint Through <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-3 gap-3">
                                <ChannelRadioButton id="channel-call" name="channel" value="Call" checked={formData.channel === 'Call'} onChange={handleChange} label="Call" icon={<Phone size={13} />} />
                                <ChannelRadioButton id="channel-mail" name="channel" value="Mail" checked={formData.channel === 'Mail'} onChange={handleChange} label="Mail" icon={<Mail size={13} />} />
                                <ChannelRadioButton id="channel-whatsapp" name="channel" value="WhatsApp" checked={formData.channel === 'WhatsApp'} onChange={handleChange} label="WhatsApp" icon={<MessageSquare size={13} />} />
                            </div>
                        </div>
                        <div>
                            <label className="label-style">Client (Company)</label>
                            <input
                                type="text"
                                value={selectedCompany ? selectedCompany.name : ""}
                                className="input-style bg-gray-100"
                                disabled
                                placeholder='-- Select Project to View --'
                            />
                        </div>

                        <div>
                            <label className="label-style">Complaint Time <span className="text-red-500">*</span></label>
                            <input type="datetime-local" max={formatDateForInput(new Date())} name="complaintTime" value={formData.complaintTime} onChange={handleChange} className="input-style" required />
                        </div>
                        <div>
                            <label className="label-style">Complaint By <span className="text-red-500">*</span></label>
                            <input type="text" name="complaintBy" value={formData.complaintBy} onChange={handleChange} className="input-style" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-style">Issue Title <span className="text-red-500">*</span></label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} className="input-style" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-style">Description <span className="text-red-500">*</span></label>
                            <textarea name="description" rows="2" value={formData.description} onChange={handleChange} className="input-style" required></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-style">Attach File (Optional)</label>
                            <div className="mt-1 flex items-stretch gap-2">
                                <label htmlFor="file-upload-modal" className="relative flex-grow cursor-pointer bg-white rounded-md border border-gray-300 py-2 px-3 shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                                    <div className="flex items-center">
                                        <Paperclip className="h-5 w-5 text-gray-500" />
                                        <span className="ml-2 truncate flex-1">{selectedFile ? selectedFile.name : (existingAttachment ? existingAttachment.name : 'Select a file')}</span>
                                    </div>
                                    <input id="file-upload-modal" name="file-upload-modal" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf" />
                                </label>
                                {(selectedFile || existingAttachment) && (<button type="button" onClick={clearFile} className="p-2 rounded-full hover:bg-red-100 text-red-600 px-3" aria-label="Clear file"><Trash2 size={16} /></button>)}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Max size: 10MB (PDF, PNG, JPG)</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 mt-4">
                        <button type="submit" className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed" disabled={isFormInvalid || isSubmitting}>
                            {isSubmitting ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Save Changes' : 'Submit Ticket')}
                        </button>
                        <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};