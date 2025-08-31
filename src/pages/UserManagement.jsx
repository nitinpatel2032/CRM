import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import apiService from '../services/apiService';
import { usePermissions } from '../context/PermissionsContext';

// Component Imports
import { UserModal } from '../components/UserManagement/UserModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import ReactDataTable from '../components/DataTableComponent';

const MODAL_MODES = {
    CREATE: 'create',
    EDIT: 'edit',
};

const tableHeaders = [
    { name: 'Name', selector: row => row.name, sortable: true, grow: 1 },
    { name: 'Email', selector: row => row.email, sortable: true, grow: 3 },
    { name: 'Company', selector: row => row.company_name, sortable: true, grow: 2 },
    { name: 'Role', selector: row => row.role, sortable: true, grow: 1 },
    {
        name: 'Status',
        selector: row => row.isActive,
        sortable: false,
        cell: row => (
            <span
                className={`px-2 py-1 rounded-full text-xs font-semibold
                ${row.isActive == '1' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
            >
                {row.isActive == '1' ? 'Active' : 'Inactive'}
            </span>
        ),
        width: '120px'
    }
];

const useUsers = (companyId) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await apiService.fetchUsersByCompany(companyId);
            const fetchedUsers = Array.isArray(res.data?.data) ? res.data.data : [];
            setUsers(fetchedUsers);
        } catch (err) {
            console.error("Failed to fetch users", err);
            const errorMessage = err.response?.data?.message || "Could not load users.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, isLoading, reloadUsers: fetchUsers };
};

const UserManagement = () => {
    const currentUser = useMemo(() => JSON.parse(localStorage.getItem('currentUser')), []);

    const { permissions } = usePermissions();
    const userPermissions = useMemo(() => permissions?.Users || {}, [permissions]);

    const { users, isLoading, reloadUsers } = useUsers(currentUser.companyId);

    const [modalState, setModalState] = useState({ isOpen: false, mode: MODAL_MODES.CREATE, user: null });
    const [userToDelete, setUserToDelete] = useState(null);
    const [statusChangeInfo, setStatusChangeInfo] = useState(null);

    const openModal = useCallback((mode, user = null) => {
        setModalState({ isOpen: true, mode, user });
    }, []);

    const closeModal = useCallback(() => {
        setModalState({ isOpen: false, mode: MODAL_MODES.CREATE, user: null });
    }, []);

    const handleDeleteUser = useCallback((user) => {
        setUserToDelete(user);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!userToDelete) return;
        try {
            await apiService.deleteUser(userToDelete.id);
            toast.success('User deleted successfully.');
            reloadUsers();
        } catch (error) {
            toast.error("Failed to delete user.");
        } finally {
            setUserToDelete(null);
        }
    }, [userToDelete, reloadUsers]);

    const promptStatusChange = useCallback((user) => {
        const newStatus = !user.isActive;
        setStatusChangeInfo({
            user,
            newStatus,
            currentStatusName: user.isActive ? 'Active' : 'Inactive',
            newStatusName: newStatus ? 'Active' : 'Inactive'
        });
    }, []);

    const handleConfirmStatusChange = useCallback(async () => {
        if (!statusChangeInfo) return;
        try {
            await apiService.changeUserStatus(statusChangeInfo.user.id, statusChangeInfo.newStatus);
            toast.success(`Status for "${statusChangeInfo.user.name}" updated.`);
            reloadUsers();
        } catch (error) {
            toast.error("Failed to update user status.");
            console.error("Failed to change user status", error);
        } finally {
            setStatusChangeInfo(null);
        }
    }, [statusChangeInfo, reloadUsers]);

    const viewUser = useCallback((row) => {
        // open a read-only version of the modal.
        console.log('Viewing user:', row);
    }, []);

    const onUserSaved = useCallback(() => {
        closeModal();
        reloadUsers();
    }, [closeModal, reloadUsers]);

    return (
        <div>
            {modalState.isOpen && <UserModal mode={modalState.mode} user={modalState.user} closeModal={closeModal} onUserSaved={onUserSaved} />}

            <ConfirmationModal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete User"
                message={`Are you sure you want to delete the user "${userToDelete?.name}"? This action cannot be undone.`}
            />

            <ConfirmationModal
                isOpen={!!statusChangeInfo}
                onClose={() => setStatusChangeInfo(null)}
                onConfirm={handleConfirmStatusChange}
                title="Change User Status"
                message={`Change status of "${statusChangeInfo?.user.name}" from ${statusChangeInfo?.currentStatusName} to ${statusChangeInfo?.newStatusName}?`}
            />

            <div className="container-base container-sm">
                <h1 className="container-base-text">User Management</h1>
                {userPermissions.create === 1 && (
                    <button onClick={() => openModal(MODAL_MODES.CREATE)} className="container-base-button container-base-button-sm">
                        <UserPlus className="w-5 h-5 mr-2" />Create User
                    </button>
                )}
            </div>

            {isLoading ? <p>Loading users...</p> : users.length === 0 ? (
                <div className="text-center py-16 card">
                    <UserPlus className="w-16 h-16 mx-auto text-gray-300" />
                    <p className="mt-4 text-lg font-semibold">No users created yet!</p>
                    <p className="text-gray-500">Click "Create User" to get started.</p>
                </div>
            ) : (
                <div className="card p-4 space-y-4">
                    <ReactDataTable
                        columns={tableHeaders}
                        data={users}
                        onEdit={(row) => openModal(MODAL_MODES.EDIT, row)}
                        onView={viewUser}
                        onDelete={handleDeleteUser}
                        onStatusChange={promptStatusChange}
                        permissions={userPermissions}
                    />
                </div>
            )}
        </div>
    );
};

export default UserManagement;