import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PlusCircle, FolderKanban } from 'lucide-react';
import apiService from '../services/apiService';
import { usePermissions } from '../context/PermissionsContext';

// Component Imports
import { ProjectModal } from '../components/ProjectManagement/ProjectModal';
import { AssignUserModal } from '../components/ProjectManagement/AssignUserModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import ReactDataTable from '../components/DataTableComponent';

const ProjectManagement = () => {
    const { permissions } = usePermissions();
    const projectPermissions = permissions?.Projects || {};
    const [allProjects, setAllProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [statusChangeInfo, setStatusChangeInfo] = useState(null);

    const statusValueToName = useMemo(
        () => ({ 1: 'Active', 0: 'On Hold', 2: 'Completed' }),
        []
    );

    const loadProjects = useCallback(() => {
        setIsLoading(true);
        Promise.all([apiService.fetchProjects(), apiService.fetchCompanies()])
            .then(([projectsRes, companiesRes]) => {
                // Process projects response
                const projects = projectsRes.data.data.map(project => ({
                    ...project,
                    location_names: project.project_locations
                        ? project.project_locations.map(loc => loc.location_name).join(', ')
                        : 'N/A',
                }));

                setAllProjects(projects.sort((a, b) => a.name.localeCompare(b.name)));

                // Process companies response
                const companies = companiesRes.data.data.map(company => ({
                    ...company,
                    project_locations: company.project_locations || [],
                })).filter(company => company.isActive !== 0 && company.linked_companies !== null);

                setCompanies(companies);
            })
            .catch(() => toast.error('Could not fetch project data.'))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const headers = [
        { name: 'Project', selector: row => row.name, sortable: true, grow: 2 },
        { name: 'Company', selector: row => row.companyName, sortable: true, grow: 1 },
        {
            name: 'Locations',
            selector: row => row.location_names,
            sortable: true,
            cell: row => {
                const items = row.location_names
                    ? row.location_names.split(',').filter(Boolean)
                    : [];
                return (
                    <div className="relative group inline-block">
                        <span className="cursor-pointer underline decoration-dotted text-indigo-600 font-semibold">
                            {items.length}
                        </span>
                        {items.length > 0 && (
                            <div className="absolute top-full left-0 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 z-20 w-max max-w-xs">
                                <ul className="list-disc list-inside space-y-1">
                                    {items.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            },
            grow: 1,
            allowOverflow: true,
        },
        { name: 'Project Manager', selector: row => row.projectManager, sortable: true, grow: 2 },
        { name: 'Engineers', selector: row => row.userCount, sortable: true },
        {
            name: 'Status',
            selector: row => row.isActive,
            cell: row => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${row.isActive == '1'
                        ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}
                >
                    {row.isActive == '1' ? 'Active' : 'Inactive'}
                </span>
            ),
            width: '120px',
        },
    ];

    const openModal = (type, project = null) => {
        setModalType(type);
        setSelectedProject(project);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setModalType(null);
        setSelectedProject(null);
    };

    const promptStatusChange = project => {
        const newStatusValue = project.isActive === 1 ? 0 : 1;
        setStatusChangeInfo({
            project,
            newStatusValue,
            currentStatusName: statusValueToName[project.isActive],
            newStatusName: statusValueToName[newStatusValue],
        });
    };

    const handleConfirmStatusChange = async () => {
        if (!statusChangeInfo) return;
        try {
            const res = await apiService.changeProjectStatus({
                id: statusChangeInfo.project.id,
                isActive: statusChangeInfo.newStatusValue,
            });
            if (res.data[0].success === 1) {
                toast.error(res.data[0].message || 'Project status updated successfully!');
            } else {
                toast.success(res.data[0].message || 'Project status updation failed.');
            }
            loadProjects();
        } catch {
            toast.error('Failed to update project status.');
        } finally {
            setStatusChangeInfo(null);
        }
    };

    const renderModals = () => {
        if (isModalOpen) {
            switch (modalType) {
                case 'add':
                case 'edit':
                    return (
                        <ProjectModal
                            projectToEdit={selectedProject}
                            closeModal={closeModal}
                            onProjectUpdated={loadProjects}
                            companies={companies}
                        />
                    );
                case 'assign':
                    return (
                        <AssignUserModal
                            project={selectedProject}
                            closeModal={closeModal}
                            onAssignmentChange={loadProjects}
                        />
                    );
                default:
                    return null;
            }
        }
        if (statusChangeInfo) {
            return (
                <ConfirmationModal
                    isOpen={true}
                    onClose={() => setStatusChangeInfo(null)}
                    onConfirm={handleConfirmStatusChange}
                    title="Change Project Status"
                    message={`Change status of "${statusChangeInfo.project.name}" from ${statusChangeInfo.currentStatusName} to ${statusChangeInfo.newStatusName}?`}
                />
            );
        }
        return null;
    };

    return (
        <div>
            {renderModals()}
            <div className="container-base container-sm">
                <h1 className="container-base-text">Project Management</h1>
                {projectPermissions.create === 1 && (
                    <button
                        onClick={() => openModal('add')}
                        className="container-base-button container-base-button-sm"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" /> Add Project
                    </button>
                )}
            </div>

            {isLoading ? (
                <p>Loading...</p>
            ) : allProjects.length === 0 ? (
                <div className="text-center py-16 card">
                    <FolderKanban className="w-16 h-16 mx-auto text-gray-300" />
                    <p className="mt-4 text-lg font-semibold">No projects created yet</p>
                </div>
            ) : (
                <div className="card p-4 space-y-4">
                    <ReactDataTable
                        columns={headers}
                        data={allProjects}
                        permissions={projectPermissions}
                        onEdit={project => openModal('edit', project)}
                        onStatusChange={promptStatusChange}
                        onAssign={project => openModal('assign', project)}
                    />
                </div>
            )}
        </div>
    );
};

export default ProjectManagement;