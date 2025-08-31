import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Unlink } from 'lucide-react';
import apiService from '../../services/apiService';
import { Combobox } from '../Combobox';
import { ConfirmationModal } from '../ConfirmationModal';

export const LinkCompanyModal = ({ sourceCompany, allCompanies, closeModal, onLinksUpdated }) => {
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [companyToUnlink, setCompanyToUnlink] = useState(null);

    const linkedCompanies = Array.isArray(sourceCompany.linked_companies) ? sourceCompany.linked_companies : [];

    const linkableCompanies = allCompanies.filter(company => {
        const isAlreadyLinked = linkedCompanies.some(linked => linked.id === company.id);
        return company.id !== sourceCompany.id && !isAlreadyLinked;
    });

    const handleLink = async () => {
        if (!selectedCompanyId) return toast.error("Please select a company to link.");
        try {
            await apiService.linkCompanies({ companyId1: sourceCompany.id, companyId2: selectedCompanyId });
            toast.success("Companies linked successfully!");
            onLinksUpdated();
            closeModal();
        } catch (error) { console.error("Failed to link companies", error); }
    };

    const handleConfirmUnlink = async () => {
        if (!companyToUnlink) return;
        try {
            await apiService.unlinkCompanies({ companyId1: sourceCompany.id, companyId2: companyToUnlink.id });
            toast.success(`Unlinked from ${companyToUnlink.name}.`);
            onLinksUpdated();
            closeModal();
        } catch (error) {
            toast.error("Failed to unlink company.");
        } finally {
            setCompanyToUnlink(null);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                    <div className="flex justify-between items-center border-b pb-3">
                        <h3 className="text-lg font-medium">Links for <span className="font-medium text-purple-600 underline">{sourceCompany.name}</span></h3>
                        <button onClick={closeModal} className='p-1 rounded-full hover:bg-gray-100'><X size={20} /></button>
                    </div>

                    <div className="mt-4">
                        <h4 className="label-style mb-2">Currently Linked Companies : <span className='font-medium text-gray-800'>{linkedCompanies.length}</span></h4>
                        {linkedCompanies.length > 0 ? (
                            <ul className="space-y-2 max-h-32 overflow-y-auto pr-2">
                                {linkedCompanies.map(c => (
                                    <li key={c.id} className="flex items-center justify-between bg-gray-50 px-3 py-1 rounded-md">
                                        <span>{c.name}</span>
                                        <button onClick={() => setCompanyToUnlink(c)} className="p-2 rounded-full hover:bg-red-100 text-red-600" title={`Unlink ${c.name}`}>
                                            <Unlink size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-gray-500">Not linked with any other companies.</p>}
                    </div>

                    <div className="mt-6 border-t pt-4">
                        <label className="label-style mb-1">Link with a new Company</label>
                        <Combobox value={selectedCompanyId} onChange={setSelectedCompanyId} options={linkableCompanies} placeholder="Search and select a company..." />
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button onClick={handleLink} className="btn-primary disabled:opacity-50" disabled={!selectedCompanyId}>Create Link</button>
                        <button onClick={closeModal} className="btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>

            <ConfirmationModal isOpen={!!companyToUnlink} onClose={() => setCompanyToUnlink(null)} onConfirm={handleConfirmUnlink} title="Unlink Company" message={`Unlink ${sourceCompany.name} from ${companyToUnlink?.name}?`} />
        </>
    );
};