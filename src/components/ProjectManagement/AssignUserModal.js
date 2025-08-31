import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { X, Trash2 } from 'lucide-react';
import apiService from '../../services/apiService';
import { ConfirmationModal } from '../ConfirmationModal';
import { Combobox } from '../Combobox';

export const AssignUserModal = ({ project, closeModal, onAssignmentChange }) => {
    const [availableUsers, setAvailableUsers] = useState([]);
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const [userToUnassign, setUserToUnassign] = useState(null);

    const fetchData = useCallback(async () => {
        if (!project.id) return;
        setIsLoading(true);
        try {
            const [companyUsersRes, projectUsersRes] = await Promise.all([
                apiService.fetchUsersByCompany(currentUser.companyId),
                apiService.fetchUserByProject(project.id),
            ]);
            const projectUsers = Array.isArray(projectUsersRes.data?.data) ? projectUsersRes.data.data : [];
            const alreadyAssigned = projectUsers.map(user => ({ ...user, companyName: user.company_name || 'Unknown Company' }));
            const assignedUserIds = new Set(alreadyAssigned.map(user => user.id));
            const companyUsers = Array.isArray(companyUsersRes.data?.data) ? companyUsersRes.data.data : [];
            const allActiveUsers = companyUsers.filter(user => user.isActive);

            setAssignedUsers(alreadyAssigned);
            setAvailableUsers(allActiveUsers.filter(user => !assignedUserIds.has(user.id)));
        } catch (error) {
            toast.error("Could not load user data.");
        } finally {
            setIsLoading(false);
        }
    }, [project.id, currentUser.companyId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAssign = async () => {
        if (selectedUserIds.length === 0) return toast.error('Please select at least one user.');
        try {
            await Promise.all(selectedUserIds.map(userId => apiService.assignProjectToUser({ userId: userId, projectId: project.id })));
            toast.success(`${selectedUserIds.length} user(s) assigned successfully!`);
            setSelectedUserIds([]);
            fetchData();
            onAssignmentChange();
        } catch (error) {
            toast.error('One or more assignments failed.');
        }
    };

    const handleConfirmUnassign = async () => {
        if (!userToUnassign) return;
        try {
            await apiService.unassignProjectFromUser({ userId: userToUnassign.id, projectId: project.id });
            toast.success('User unassigned successfully!');
            fetchData();
            onAssignmentChange();
        } catch (error) {
            toast.error('Failed to unassign user.');
        } finally {
            setUserToUnassign(null);
        }
    };

    const groupedAssignedUsers = useMemo(() => assignedUsers.reduce((acc, user) => {
        const companyKey = user.companyName || 'Unknown Company';
        if (!acc[companyKey]) acc[companyKey] = [];
        acc[companyKey].push(user);
        return acc;
    }, {}), [assignedUsers]);

    return (
        <>
            <ConfirmationModal isOpen={!!userToUnassign} onClose={() => setUserToUnassign(null)} onConfirm={handleConfirmUnassign} title="Unassign User" message={`Unassign ${userToUnassign?.name} from this project?`} />
            <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-60">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4">
                    <div className="flex justify-between items-center border-b pb-3">
                        <h3 className="text-lg font-medium text-gray-800">Users for <span className="font-medium text-yellow-600 underline">{project.name}</span></h3>
                        <button onClick={closeModal} className='p-1 rounded-full hover:bg-gray-100'><X size={20} /></button>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Employees</label>
                        {isLoading ? <p>Loading...</p> : Object.keys(groupedAssignedUsers).length > 0 ? (
                            <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                                {Object.entries(groupedAssignedUsers).map(([companyName, users]) => (
                                    <div key={companyName} className="border-b pb-2 last:border-b-0">
                                        <h4 className="text-xs font-bold uppercase text-gray-500">
                                            {companyName} <span className="text-gray-800 font-medium">({users.length})</span>
                                        </h4>
                                        {users.map(user => (
                                            <div key={user.id} className="flex items-center justify-between bg-gray-50 px-3 py-1 rounded-md mt-1">
                                                <span>{user.name} ({user.role})</span>
                                                {user.company_id === currentUser.companyId && (
                                                    <button onClick={() => setUserToUnassign(user)} className="p-2 rounded-full hover:bg-red-100 text-red-600" title="Unassign User"><Trash2 size={16} /></button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : <p className="italic">No employee assigned yet.</p>}
                    </div>
                    <div className="mt-6 border-t pt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                        <div className="flex flex-col gap-3">
                            <Combobox multiple options={availableUsers} value={selectedUserIds} onChange={setSelectedUserIds} placeholder={isLoading ? 'Loading...' : 'Select employees...'} disabled={isLoading || availableUsers.length === 0} optionValue="id" optionLabel="name" />
                            <div className="flex gap-2 justify-end">
                                <button onClick={handleAssign} className="btn-primary disabled:opacity-50" disabled={selectedUserIds.length === 0 || isLoading}>Assign</button>
                                <button type="button" onClick={closeModal} className="btn-secondary" disabled={isLoading}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};