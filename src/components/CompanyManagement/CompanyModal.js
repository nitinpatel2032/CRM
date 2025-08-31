import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import apiService from '../../services/apiService';

export const CompanyModal = ({ mode, companyToEdit, closeModal, onCompanySaved }) => {
    const isEditMode = mode === 'edit';
    const [companyData, setCompanyData] = useState({ name: '', permanent_address: '', contact_no: '', mail_address: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isEditMode && companyToEdit) {
            setCompanyData({
                name: companyToEdit.name || '',
                permanent_address: companyToEdit.permanent_address || '',
                contact_no: companyToEdit.contact_no || '',
                mail_address: companyToEdit.mail_address || ''
            });
        } else {
            setCompanyData({ name: '', permanent_address: '', contact_no: '', mail_address: '' });
        }
    }, [mode, companyToEdit]);

    const handleChange = (e) => {
        setCompanyData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!companyData.name.trim()) return toast.error("Company name is required.");

        setIsSubmitting(true);
        try {
            if (isEditMode) {
                const res = await apiService.updateCompany({ id: companyToEdit.id, ...companyData });
                if (res.data.success === 1) {
                    toast.success(res.data.message);
                } else {
                    toast.error(res.data.message);
                }
            } else {
                const res = await apiService.addCompany(companyData);
                if (res.data.success === 1) {
                    toast.success(res.data.message);
                } else {
                    toast.error(res.data.message);
                }
            }
            onCompanySaved();
            closeModal();
        } catch (error) {
            toast.error(`Failed to ${isEditMode ? 'update' : 'add'} company.`);
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Allow only numbers, spaces, hyphens, parentheses, and plus sign for STD/mobile numbers
    const handleContactInput = (e) => {
        const value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
        setCompanyData(prev => ({ ...prev, contact_no: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Company' : 'Add New Company'}</h2>
                    <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-100 text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="label-style">Company Name <span className="text-red-500">*</span></label>
                        <input type="text" name="name" value={companyData.name} onChange={handleChange} className="input-style" placeholder="Company Name" required />
                    </div>
                    <div>
                        <label htmlFor="permanent_address" className="label-style">Company Address</label>
                        <textarea name="permanent_address" value={companyData.permanent_address} onChange={handleChange} className="input-style" placeholder="Company Address" />
                    </div>
                    <div className='flex grid grid-cols-2 gap-4'>
                        <div>
                            <label htmlFor="contact_no" className="label-style">Contact No</label>
                            <input
                                type="text"
                                name="contact_no"
                                value={companyData.contact_no}
                                onChange={handleContactInput}
                                className="input-style"
                                placeholder="Contact No"
                                maxLength={20}
                                inputMode="tel"
                                pattern="[0-9+\-\s()]*"
                                autoComplete="off"
                            />
                        </div>
                        <div>
                            <label htmlFor="mail_address" className="label-style">Mail Address</label>
                            <input type="email" name="mail_address" value={companyData.mail_address} onChange={handleChange} className="input-style" placeholder="Mail Address" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="submit" className="btn-primary disabled:opacity-50" disabled={isSubmitting || !companyData.name.trim() || !companyData.permanent_address.trim()}>
                            {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Company')}
                        </button>
                        <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};