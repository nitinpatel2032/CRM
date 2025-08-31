import React, { useState, useEffect, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Save, PlusCircle, Edit, Trash2, X, ChevronDown } from 'lucide-react';
import apiService from '../services/apiService';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Combobox } from '../components/Combobox';

// --- MODAL FOR CREATING AND EDITING ROLES ---
const RoleModal = ({ mode, role, companies, onClose, onSave }) => {
    const [formData, setFormData] = useState({ name: '', company_id: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && role) {
            setFormData({ name: role.name, company_id: role.company_id });
        } else {
            setFormData({ name: '', company_id: '' });
        }
    }, [mode, role]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Handler for the company combobox
    const handleCompanySelect = (companyId) => {
        setFormData(prev => ({ ...prev, company_id: companyId || '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.company_id) {
            return toast.error("Both role name and company are required.");
        }
        setIsSubmitting(true);
        try {
            if (mode === 'create') {
                const res = await apiService.createRole(formData);
                if (res.data.success === 1) {
                    toast.success(res.data.message || 'Role created successfully!');
                } else {
                    toast.error(res.data.message || 'Role creation failed.');
                }
            } else {
                const res = await apiService.updateRole({ id: role.id, name: formData.name });
                if (res.data.success === 1) {
                    toast.success(res.data.message || 'Role updated successfully!');
                } else {
                    toast.error(res.data.message || 'Role updation failed.');
                }
            }
            onSave();
            onClose();
        } catch (error) {
            const errorMessage = error.response?.data?.message || `Failed to ${mode} role.`;
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{mode === 'create' ? 'Create New Role' : 'Edit Role'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label-style">Company</label>
                        <Combobox
                            options={companies}
                            value={formData.company_id}
                            onChange={handleCompanySelect}
                            disabled={mode === 'edit'}
                            placeholder="Select a company..."
                            optionValue="id"
                            optionLabel="name"
                        />
                    </div>
                    <div>
                        <label className="label-style">Role Name</label>
                        <input name="name" type="text" value={formData.name} onChange={handleChange} className="input-style" placeholder="e.g., Regional Manager" required />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="submit" className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting || !formData.name || !formData.company_id}>{isSubmitting ? 'Saving...' : 'Save Role'}</button>
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- CONFIGURATION AND HELPER COMPONENTS ---
const PERMISSION_CONFIG = {
    pages: [
        { key: 'Permissions', name: 'Permissions Control' },
        { key: 'Dashboard', name: 'Dashboard' },
        { key: 'Companies', name: 'Company Management' },
        { key: 'Users', name: 'User Management' },
        { key: 'Projects', name: 'Project Management' },
        { key: 'Tickets', name: 'Ticket Management' },
        { key: 'TicketDetails', name: 'Ticket Details' },
    ],


    actions: [
        { key: 'view', name: 'View', applicableTo: ['Tickets', 'TicketDetails'] },
        { key: 'create', name: 'Create' },
        { key: 'edit', name: 'Edit' },
        { key: 'delete', name: 'Delete', applicableTo: ['Tickets', 'TicketDetails', 'Users'] },
        { key: 'status_change', name: 'Status' },
        { key: 'assign', name: 'Assign', applicableTo: ['Projects', 'Tickets', 'TicketDetails'] },
        { key: 'response', name: 'Response', applicableTo: ['TicketDetails'] },
        { key: 'reopen', name: 'Reopen', applicableTo: ['TicketDetails'] },
        { key: 'rootCause', name: 'Root cause', applicableTo: ['TicketDetails'] },
        { key: 'location', name: 'Location', applicableTo: ['Companies'] },
        { key: 'link', name: 'Link', applicableTo: ['Companies'] },
    ],
};

const HeaderCheckbox = ({ checked, indeterminate, onChange }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current) {
            ref.current.checked = checked;
            ref.current.indeterminate = indeterminate;
        }
    }, [checked, indeterminate]);
    return <input type="checkbox" ref={ref} onChange={onChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />;
};


// --- MAIN PERMISSIONS PAGE COMPONENT ---
const Permissions = () => {
    const [companies, setCompanies] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [rolePermissions, setRolePermissions] = useState(null);

    const [roleModal, setRoleModal] = useState({ isOpen: false, mode: 'create', role: null });
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [isRolesSectionCollapsed, setIsRolesSectionCollapsed] = useState(true);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const [companiesRes, rolesRes] = await Promise.all([
                apiService.fetchCompanies(),
                apiService.fetchRoles()
            ]);
            setCompanies(companiesRes.data.data);
            setRoles(rolesRes.data.data);
        } catch (error) {
            toast.error('Failed to load initial data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedCompanyId && selectedRoleId) {
            const fetchPermissions = async () => {
                setIsLoading(true);
                setRolePermissions(null);
                try {
                    const response = await apiService.fetchRolePermissions(selectedCompanyId, selectedRoleId);
                    const frontendState = {};
                    if (response.data && response.data.data && response.data.data.length > 0) {
                        const permissionsFromServer = response.data.data[0].permissions;
                        for (const pageKey in permissionsFromServer) {
                            const actionsFromServer = permissionsFromServer[pageKey];
                            frontendState[pageKey] = [];
                            for (const actionKey in actionsFromServer) {
                                if (actionsFromServer[actionKey] === 1) {
                                    frontendState[pageKey].push(actionKey);
                                }
                            }
                        }
                    }
                    setRolePermissions(frontendState);
                } catch (error) {
                    const selectedRole = roles.find(r => r.id === selectedRoleId);
                    toast.error(`Failed to load permissions for ${selectedRole?.name || 'the selected role'}.`);
                    setRolePermissions({});
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPermissions();
        } else {
            setRolePermissions(null);
        }
    }, [selectedCompanyId, selectedRoleId, roles]);

    useEffect(() => {
        setSelectedRoleId(null);
    }, [selectedCompanyId]);

    const roleOptions = useMemo(() => {
        if (!selectedCompanyId) return [];
        return roles.filter(r => r.company_id === selectedCompanyId);
    }, [selectedCompanyId, roles]);

    const handlePermissionChange = (pageKey, actionKey) => {
        setRolePermissions(prev => {
            const newPermissions = JSON.parse(JSON.stringify(prev || {}));
            if (!newPermissions[pageKey]) newPermissions[pageKey] = [];
            const currentActions = newPermissions[pageKey];
            const hasPermission = currentActions.includes(actionKey);
            if (hasPermission) {
                newPermissions[pageKey] = currentActions.filter(action => action !== actionKey);
            } else {
                newPermissions[pageKey].push(actionKey);
            }
            return newPermissions;
        });
    };

    const handleSelectAllForRow = (pageKey) => {
        const applicableActions = PERMISSION_CONFIG.actions.filter(a => !a.applicableTo || a.applicableTo.includes(pageKey)).map(a => a.key);
        const currentActions = rolePermissions?.[pageKey] || [];
        const allSelected = applicableActions.every(key => currentActions.includes(key));
        setRolePermissions(prev => {
            const newPermissions = { ...(prev || {}) };
            newPermissions[pageKey] = allSelected ? [] : applicableActions;
            return newPermissions;
        });
    };

    const handleSelectAllForColumn = (actionKey) => {
        const actionConfig = PERMISSION_CONFIG.actions.find(a => a.key === actionKey);
        const applicablePages = actionConfig.applicableTo || PERMISSION_CONFIG.pages.map(p => p.key);
        const isAllSelected = applicablePages.every(pageKey => rolePermissions?.[pageKey]?.includes(actionKey));
        setRolePermissions(prev => {
            const newPermissions = { ...(prev || {}) };
            applicablePages.forEach(pageKey => {
                if (!newPermissions[pageKey]) newPermissions[pageKey] = [];
                const currentActions = newPermissions[pageKey];
                const hasAction = currentActions.includes(actionKey);
                if (isAllSelected) {
                    if (hasAction) newPermissions[pageKey] = currentActions.filter(a => a !== actionKey);
                } else {
                    if (!hasAction) newPermissions[pageKey].push(actionKey);
                }
            });
            return newPermissions;
        });
    };

    const handleSaveChanges = async () => {
        if (!selectedCompanyId || !selectedRoleId || !rolePermissions) {
            toast.error("Please select a company and a role before saving.");
            return;
        }
        setIsSaving(true);
        const payloadPermissions = {};
        PERMISSION_CONFIG.pages.forEach(page => {
            const pageKey = page.key;
            const pageActions = rolePermissions[pageKey] || [];
            payloadPermissions[pageKey] = {};
            PERMISSION_CONFIG.actions.forEach(action => {
                if (!action.applicableTo || action.applicableTo.includes(pageKey)) {
                    payloadPermissions[pageKey][action.key] = pageActions.includes(action.key) ? 1 : 0;
                }
            });
        });
        const payload = {
            company_id: selectedCompanyId,
            role_id: selectedRoleId,
            permissions: payloadPermissions
        };
        try {
            await apiService.updateRolePermissions(payload);
            const company = companies.find(c => c.id === selectedCompanyId);
            const role = roles.find(r => r.id === selectedRoleId);
            toast.success(`Permissions for ${role?.name} at ${company?.name} updated successfully!`);
        } catch (error) {
            toast.error('Failed to save permissions.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDeleteRole = async () => {
        if (!roleToDelete) return;
        try {
            await apiService.deleteRole(roleToDelete.id);
            toast.success(`Role "${roleToDelete.name}" deleted.`);
            setRoleToDelete(null);
            loadInitialData();
        } catch (error) {
            toast.error("Failed to delete role.");
        }
    };

    const rolesByCompany = useMemo(() => {
        return roles.reduce((acc, role) => {
            const companyName = role.company_name || 'Unassigned';
            if (!acc[companyName]) acc[companyName] = [];
            acc[companyName].push(role);
            return acc;
        }, {});
    }, [roles]);

    const currentRolePermissions = rolePermissions || {};

    return (
        <div>
            {roleModal.isOpen && (
                <RoleModal
                    mode={roleModal.mode}
                    role={roleModal.role}
                    companies={companies}
                    onClose={() => setRoleModal({ isOpen: false, mode: 'create', role: null })}
                    onSave={loadInitialData}
                />
            )}
            <ConfirmationModal
                isOpen={!!roleToDelete}
                onClose={() => setRoleToDelete(null)}
                onConfirm={handleConfirmDeleteRole}
                title="Delete Role"
                message={`Are you sure you want to delete the role "${roleToDelete?.name}"? This action cannot be undone.`}
            />

            <div className="container-base container-sm mt-1">
                <div><h1 className="container-base-text">Roles & Permissions</h1></div>
            </div>

            <div className="card p-4 mb-6">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsRolesSectionCollapsed(prev => !prev)}>
                    <h2 className="text-lg font-semibold text-gray-800">Manage Roles</h2>
                    <div className="flex items-center gap-x-2">
                        <button onClick={(e) => { e.stopPropagation(); setRoleModal({ isOpen: true, mode: 'create', role: null }); }} className="container-base-button container-base-button-sm">
                            <PlusCircle className="w-5 h-5 mr-2" /> Create Role
                        </button>
                        <ChevronDown className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${isRolesSectionCollapsed ? '' : 'rotate-180'}`} />
                    </div>
                </div>

                {!isRolesSectionCollapsed && (
                    <div className="mt-4 space-y-4 max-h-72 overflow-y-auto pr-2">
                        {Object.keys(rolesByCompany).sort().map(companyName => (
                            <div key={companyName}>
                                <h3 className="text-md font-bold text-gray-600 border-b pb-1 mb-2">{companyName}</h3>
                                <ul className="space-y-0">
                                    {rolesByCompany[companyName].map(role => (
                                        <li key={role.id} className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-50">
                                            <span className="text-gray-800">{role.name}</span>
                                            <div className="space-x-2">
                                                <button onClick={() => setRoleModal({ isOpen: true, mode: 'edit', role })} className="p-2 rounded-full hover:bg-blue-100 text-blue-600" title="Edit Role"><Edit size={17} /></button>
                                                <button onClick={() => setRoleToDelete(role)} className="p-2 rounded-full hover:bg-red-100 text-red-600" title="Delete Role"><Trash2 size={17} /></button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="card p-4">
                <div className="container-base container-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Manage Permissions</h2>
                    <div className="flex items-center gap-x-2">
                        <button onClick={handleSaveChanges} className="container-base-button container-base-button-sm disabled:opacity-50" disabled={isSaving || !rolePermissions}>
                            <Save className="w-5 h-5 mr-2" /> {isSaving ? 'Saving...' : 'Save Permissions'}
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="label-style">Select a Company</label>
                        <div className="w-64">
                            <Combobox
                                options={companies}
                                value={selectedCompanyId}
                                onChange={setSelectedCompanyId}
                                placeholder="Select a company..."
                                optionValue="id"
                                optionLabel="name"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label-style">Select a Role</label>
                        <div className="w-64">
                            <Combobox
                                options={roleOptions}
                                value={selectedRoleId}
                                onChange={setSelectedRoleId}
                                placeholder="Select a role..."
                                disabled={!selectedCompanyId}
                                optionValue="id"
                                optionLabel="name"
                            />
                        </div>
                    </div>
                </div>

                {isLoading && (selectedCompanyId && selectedRoleId) && <p className="text-center p-4">Loading permissions...</p>}

                {rolePermissions && !isLoading && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="th-style sticky left-0 bg-gray-100 w-1/4">Page / Feature</th>
                                    {PERMISSION_CONFIG.actions.map(action => {
                                        const applicablePages = action.applicableTo || PERMISSION_CONFIG.pages.map(p => p.key);
                                        const allPagesHaveAction = applicablePages.every(pKey => currentRolePermissions[pKey]?.includes(action.key));
                                        const somePagesHaveAction = applicablePages.some(pKey => currentRolePermissions[pKey]?.includes(action.key));
                                        return (
                                            <th key={action.key} className="th-style text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <HeaderCheckbox checked={allPagesHaveAction} indeterminate={somePagesHaveAction && !allPagesHaveAction} onChange={() => handleSelectAllForColumn(action.key)} />
                                                    <span>{action.name}</span>
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {PERMISSION_CONFIG.pages.map(page => {
                                    const applicableActions = PERMISSION_CONFIG.actions.filter(a => !a.applicableTo || a.applicableTo.includes(page.key));
                                    const pageActions = currentRolePermissions[page.key] || [];
                                    const allActionsForPage = applicableActions.length > 0 && applicableActions.every(a => pageActions.includes(a.key));
                                    const someActionsForPage = pageActions.length > 0 && !allActionsForPage;
                                    return (
                                        <tr key={page.key}>
                                            <td className="td-style font-semibold sticky left-0 bg-white">
                                                <div className="flex items-center space-x-2">
                                                    <HeaderCheckbox checked={allActionsForPage} indeterminate={someActionsForPage} onChange={() => handleSelectAllForRow(page.key)} />
                                                    <span>{page.name}</span>
                                                </div>
                                            </td>
                                            {PERMISSION_CONFIG.actions.map(action => {
                                                if (action.applicableTo && !action.applicableTo.includes(page.key)) {
                                                    return <td key={action.key} className="td-style text-center bg-gray-50"></td>;
                                                }
                                                return (
                                                    <td key={action.key} className="td-style text-center">
                                                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={pageActions.includes(action.key)} onChange={() => handlePermissionChange(page.key, action.key)} />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Permissions;