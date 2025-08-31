import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import apiService from '../../services/apiService';
import { Combobox } from '../Combobox';

const PROJECT_STATUS = {
    ACTIVE: 'Active',
    ON_HOLD: 'On Hold',
    COMPLETED: 'Completed',
};

export const ProjectModal = ({ projectToEdit, closeModal, onProjectUpdated, companies }) => {
    const [projectData, setProjectData] = useState({ name: '', companyId: '', locationId: [], pmId: '', status: PROJECT_STATUS.ACTIVE });
    const [projectLocations, setProjectLocations] = useState([]);
    const [projectManagers, setProjectManagers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isEditMode = !!projectToEdit;

    const isFormInvalid = useMemo(() => {
        const isLocationInvalid = isEditMode ? !projectData.locationId : projectData.locationId.length === 0;
        return !projectData.name.trim() || !projectData.companyId || isLocationInvalid || !projectData.pmId;
    }, [projectData, isEditMode]);

    const fetchDependentDropdowns = useCallback(async (companyId) => {
        if (!companyId) {
            setProjectLocations([]);
            setProjectManagers([]);
            return;
        }
        try {
            const [locationsRes, usersRes] = await Promise.all([
                apiService.fetchProjectAddresses(companyId),
                apiService.fetchUsersByCompany(currentUser.companyId)
            ]);
            setProjectLocations(locationsRes.data.data || []);
            const users = Array.isArray(usersRes.data?.data) ? usersRes.data.data : [];
            setProjectManagers(users);
        } catch (error) {
            toast.error("Error fetching company details.");
        }
    }, [currentUser.companyId]);

    const handleCompanyChange = (selectedCompanyId) => {
        setProjectData(prev => ({ ...prev, companyId: selectedCompanyId, locationId: isEditMode ? '' : [], pmId: '' }));
        fetchDependentDropdowns(selectedCompanyId);
    };

    useEffect(() => {
        if (isEditMode && projectToEdit) {
            setProjectData({
                name: projectToEdit.name,
                companyId: projectToEdit.company_id,
                locationId: projectToEdit.project_locations
                    ? projectToEdit.project_locations.map(location => location.id)
                    : [],
                pmId: projectToEdit.project_manager,
                status: projectToEdit.status || PROJECT_STATUS.ACTIVE,
            });
            fetchDependentDropdowns(projectToEdit.company_id);
        } else {
            setProjectData({ name: '', companyId: '', locationId: [], pmId: '', status: PROJECT_STATUS.ACTIVE });
        }
    }, [isEditMode, projectToEdit, fetchDependentDropdowns]);

    useEffect(() => {
    }, [companies, projectLocations, projectManagers]);

    const handleComboboxChange = (fieldName, value) => {
        setProjectData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (isFormInvalid) return toast.error('All fields are required.');
        setIsSubmitting(true);
        try {
            const payload = {
                ...projectData,
                locationId: Array.isArray(projectData.locationId)
                    ? projectData.locationId.join(',')
                    : projectData.locationId
            };

            if (isEditMode) {
                await apiService.updateProject({ id: projectToEdit.id, ...payload });
                toast.success('Project updated successfully!');
            } else {
                await apiService.createProject(payload);
                toast.success('Project created successfully!');
            }
            onProjectUpdated();
            closeModal();
        } catch (error) {
            toast.error(`Failed to ${isEditMode ? 'update' : 'create'} project.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-lg font-bold text-gray-800">{isEditMode ? 'Edit Project' : 'Add Project'}</h2>
                    <button onClick={closeModal} className='p-1 rounded-full hover:bg-gray-100 text-gray-600'><X size={20} /></button>
                </div>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label-style">Project name <span className="text-red-500">*</span></label>
                            <input type="text" name="name" value={projectData.name} onChange={(e) => handleComboboxChange('name', e.target.value)} placeholder="Project Name" className="input-style" required />
                        </div>
                        <div>
                            <label className="label-style">Company <span className="text-red-500">*</span></label>
                            <Combobox options={companies || []} value={projectData.companyId} onChange={handleCompanyChange} placeholder="-- Select Company --" optionValue="id" optionLabel="name" />
                        </div>
                        <div>
                            <label className="label-style">Project location <span className="text-red-500">*</span></label>
                            <Combobox multiple options={projectLocations || []} value={projectData.locationId} onChange={(value) => handleComboboxChange('locationId', value)} disabled={!projectData.companyId || projectLocations.length === 0} placeholder={!projectData.companyId ? '-- Select Company First --' : (isEditMode ? '-- Select Location --' : '-- Select Locations --')} optionValue="id" optionLabel="location_name" />
                        </div>
                        <div>
                            <label className="label-style">Project manager <span className="text-red-500">*</span></label>
                            <Combobox options={projectManagers || []} value={projectData.pmId} onChange={(value) => handleComboboxChange('pmId', value)} disabled={!projectData.companyId} placeholder={!projectData.companyId ? '-- Select Company First --' : '-- Select Project Manager --'} optionValue="id" optionLabel="name" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="submit" className="btn-primary disabled:opacity-50" disabled={isFormInvalid || isSubmitting}>
                            {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Project')}
                        </button>
                        <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};