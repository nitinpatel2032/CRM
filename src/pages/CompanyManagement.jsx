import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { PlusCircle, Building2 } from 'lucide-react';
import apiService from '../services/apiService';
import { usePermissions } from '../context/PermissionsContext';

import { CompanyModal } from '../components/CompanyManagement/CompanyModal';
import { ManageLocationsModal } from '../components/CompanyManagement/ManageLocationsModal';
import { LinkCompanyModal } from '../components/CompanyManagement/LinkCompanyModal';
import { StatusConfirmationModal } from '../components/ConfirmationModal';
import ReactDataTable from '../components/DataTableComponent';

const CompanyManagement = () => {
    const { permissions } = usePermissions();
    const companiesPermissions = permissions?.Companies || {};

    const [allCompanies, setAllCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalCompany, setModalCompany] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [companyForStatusChange, setCompanyForStatusChange] = useState(null);

    const loadCompanies = () => {
        setIsLoading(true);
        apiService.fetchCompanies()
            .then(res => {
                if (res.data && res.data.success === 1) {
                    const companies = Array.isArray(res.data.data) ? res.data.data.map(company => ({
                        ...company,
                        linked_companies: Array.isArray(company.linked_companies)
                            ? company.linked_companies
                            : (typeof company.linked_companies === 'string'
                                ? company.linked_companies.split('; ').map(name => ({ name }))
                                : []),
                        project_locations: Array.isArray(company.project_locations)
                            ? company.project_locations
                            : (typeof company.project_locations === 'string'
                                ? company.project_locations.split('; ').map(location_name => ({ location_name }))
                                : [])
                    })) : [];
                    setAllCompanies(companies);
                } else {
                    console.error("Failed to fetch companies", res.data?.message || 'Unknown error');
                }
            })
            .catch(err => console.error("Failed to fetch companies", err))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => { loadCompanies(); }, []);

    const headers = [
        { name: 'Name', selector: row => row.name, sortable: true, grow: 1 },
        { name: 'Address', selector: row => row.permanent_address, sortable: true, grow: 1 },
        {
            name: 'Locations',
            selector: row => row.project_locations,
            sortable: true,
            cell: row => {
                const items = Array.isArray(row.project_locations) ? row.project_locations : [];
                return (
                    <div className="relative group inline-block">
                        <span className="cursor-pointer underline decoration-dotted text-indigo-600 font-semibold">
                            {items.length}
                        </span>
                        {items.length > 0 && (
                            <div className="absolute top-full left-0 mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 z-20 w-max max-w-xs">
                                <ul className="list-disc list-inside space-y-1">
                                    {items.map((item, index) => (
                                        <li key={index}>{item.location_name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            },
            grow: 1,
        },
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
            grow: 1
        }
    ]

    const openModal = (type, company = null) => { setModalCompany(company); setModalType(type); };
    const closeModal = () => { setModalCompany(null); setModalType(null); };

    const confirmStatusChange = async () => {
        if (!companyForStatusChange) return;
        const newStatus = !companyForStatusChange.isActive;
        try {
            await apiService.changeCompanyStatus(companyForStatusChange.id, newStatus);
            toast.success(`Company successfully ${newStatus ? 'activated' : 'deactivated'}.`);
            loadCompanies();
        } catch (error) {
            toast.error("Failed to update company status.");
        } finally {
            setCompanyForStatusChange(null);
        }
    };

    const statusChangeDetails = Array.isArray(companyForStatusChange?.linked_companies) && companyForStatusChange.linked_companies.length > 0 ? (
        <div className="text-sm p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="font-semibold text-yellow-800">This will affect the following linked companies:</p>
            <ul className="list-disc list-inside mt-1 text-yellow-700">
                {companyForStatusChange.linked_companies.map(linked => <li key={linked.name}>{linked.name}</li>)}
            </ul>
        </div>
    ) : null;

    return (
        <div>
            {modalType === 'add' && <CompanyModal mode="add" closeModal={closeModal} onCompanySaved={loadCompanies} />}
            {modalType === 'edit' && <CompanyModal mode="edit" companyToEdit={modalCompany} closeModal={closeModal} onCompanySaved={loadCompanies} />}
            {modalType === 'locations' && <ManageLocationsModal company={modalCompany} closeModal={closeModal} onLocationsUpdated={loadCompanies} />}
            {modalType === 'link' && <LinkCompanyModal sourceCompany={modalCompany} allCompanies={allCompanies} closeModal={closeModal} onLinksUpdated={loadCompanies} />}

            <StatusConfirmationModal isOpen={!!companyForStatusChange} onClose={() => setCompanyForStatusChange(null)} onConfirm={confirmStatusChange} title="Confirm Status Change" message={`Are you sure you want to ${companyForStatusChange?.isActive ? 'deactivate' : 'activate'} "${companyForStatusChange?.name}"?`} details={statusChangeDetails} />

            <div className="container-base container-sm">
                <h1 className="container-base-text">Company Management</h1>
                {companiesPermissions.create === 1 && (
                    <button onClick={() => openModal('add')} className="container-base-button container-base-button-sm">
                        <PlusCircle className="w-5 h-5 mr-2" /> Add Company
                    </button>
                )}
            </div>

            {isLoading ? <p>Loading companies...</p> : allCompanies.length === 0 ? (
                <div className="text-center py-16 card">
                    <Building2 className="w-16 h-16 mx-auto text-gray-300" />
                    <p className="mt-4 text-lg font-semibold">No companies yet!</p>
                    <p className="text-gray-500">Click "Add Company" to get started.</p>
                </div>
            ) : (
                <div className="card p-4 space-y-4">
                    <ReactDataTable
                        columns={headers}
                        data={allCompanies}
                        permissions={companiesPermissions}
                        onEdit={(company) => openModal('edit', company)}
                        onManageLocations={(company) => openModal('locations', company)}
                        onManageLinks={(company) => openModal('link', company)}
                        //  onDelete={(company) => console.log('Delete', company)}  // delete logic
                        //  onView={(company) => console.log('View', company)}      // view logic
                        onStatusChange={(company) => setCompanyForStatusChange(company)}
                    />
                </div>
            )}
        </div>
    );
};

export default CompanyManagement;