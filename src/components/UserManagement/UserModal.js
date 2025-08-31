import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { X, Eye, EyeOff } from 'lucide-react';
import apiService from '../../services/apiService';
import { Combobox } from '../Combobox';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter';

const initialFormData = {
    name: '',
    email: '',
    password: '',
    role: '',
    companyId: '',
    projectIds: []
};

// The fixed domain remains a constant.
const FIXED_EMAIL_DOMAIN = '@maxworthsystems.com';

const VALIDATION_SCHEMA = {
    name: {
        required: 'Name is required.',
        minLength: { value: 3, message: 'Name must be at least 3 characters.' },
        maxLength: { value: 50, message: 'Name cannot exceed 50 characters.' }
    },
    email: {
        required: 'Email is required.',
        maxLength: { value: 50, message: 'Email cannot exceed 50 characters.' },
        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format.' }
    },
    password: {
        required: 'Password is required.',
        minLength: { value: 6, message: 'Password must be at least 6 characters.' },
        maxLength: { value: 20, message: 'Password cannot exceed 20 characters.' },
        pattern: { value: /^(?=.*[A-Za-z])(?=.*\d)/, message: 'Password must contain at least one letter and one number.' }
    },
    role: { required: 'Role is required.' },
    companyId: { required: 'A company must be selected.' },
    projectIds: {
        maxLength: { value: 10, message: 'A user can be assigned to a maximum of 10 projects.' }
    }
};

export const UserModal = memo(({ mode, user, closeModal, onUserSaved }) => {
    const isEditMode = mode === 'edit';
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});


    const [showPassword, setShowPassword] = useState(false);
    const [selectOptions, setSelectOptions] = useState({ companies: [], roles: [], projects: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const currentUser = useMemo(() => JSON.parse(localStorage.getItem('currentUser')), []);

    useEffect(() => {
        // Data fetching logic 
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const promises = [
                    apiService.fetchRoles(),
                    apiService.fetchProjects(),
                ];
                if (currentUser.role === 'Admin') {
                    promises.push(apiService.fetchCompanies());
                }
                const [rolesRes, projectsRes, companiesRes] = await Promise.all(promises);
                setSelectOptions({
                    roles: Array.isArray(rolesRes.data?.data) ? rolesRes.data.data : [],
                    projects: Array.isArray(projectsRes.data?.data) ? projectsRes.data.data : [],
                    companies: companiesRes && Array.isArray(companiesRes.data?.data) ? companiesRes.data.data : [],
                });
            } catch (error) {
                console.error("Failed to fetch modal data", error);
                toast.error("Could not load required data for the form.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [currentUser.role]);

    useEffect(() => {
        if (isEditMode && user) {
            const projectIdsArray = user.project_ids ? user.project_ids.split(',').map(id => parseInt(id.trim(), 10)) : [];
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                role: user.role || '',
                companyId: user.company_id || '',
                projectIds: projectIdsArray,
            });
        } else {
            setFormData({ ...initialFormData, companyId: currentUser.companyId || '' });
        }
        setErrors({});
    }, [mode, user, currentUser.companyId, isEditMode]);

    // Validation logic 
    const validate = useCallback((data) => {
        const newErrors = {};
        const { name, email, role, companyId, projectIds, password } = data;

        // Name validation
        if (!name.trim()) newErrors.name = VALIDATION_SCHEMA.name.required;
        else if (name.length < VALIDATION_SCHEMA.name.minLength.value) newErrors.name = VALIDATION_SCHEMA.name.minLength.message;

        // Email validation
        if (!email.trim()) newErrors.email = VALIDATION_SCHEMA.email.required;
        else if (!VALIDATION_SCHEMA.email.pattern.value.test(email)) newErrors.email = VALIDATION_SCHEMA.email.pattern.message;

        // Password validation (for create mode)
        if (mode === 'create') {
            if (!password) newErrors.password = VALIDATION_SCHEMA.password.required;
            else if (password.length < VALIDATION_SCHEMA.password.minLength.value) newErrors.password = VALIDATION_SCHEMA.password.minLength.message;
            else if (!VALIDATION_SCHEMA.password.pattern.value.test(password)) newErrors.password = VALIDATION_SCHEMA.password.pattern.message;
        }
        if (!role) newErrors.role = VALIDATION_SCHEMA.role.required;
        if (!companyId) newErrors.companyId = VALIDATION_SCHEMA.companyId.required;
        if (projectIds.length > VALIDATION_SCHEMA.projectIds.maxLength.value) newErrors.projectIds = VALIDATION_SCHEMA.projectIds.maxLength.message;

        return newErrors;
    }, [mode]);

    // handler for the email input
    const handleEmailChange = useCallback((e) => {
        let value = e.target.value;

        // First, handle the auto-completion logic as before.
        if (value.endsWith('@')) {
            const username = value.slice(0, -1);
            if (username && !username.includes('@')) {
                value = `${username}${FIXED_EMAIL_DOMAIN}`;
            }
        }

        // Second, handle the rule to prevent typing after the domain.
        const domainIndex = value.indexOf(FIXED_EMAIL_DOMAIN);
        if (domainIndex !== -1) {
            // If the domain exists, check for any characters typed after it.
            const charactersAfterDomain = value.substring(domainIndex + FIXED_EMAIL_DOMAIN.length);
            if (charactersAfterDomain.length > 0) {
                // If there are characters, truncate them, effectively blocking the input.
                value = value.substring(0, domainIndex + FIXED_EMAIL_DOMAIN.length);
            }
        }

        setFormData(prev => ({ ...prev, email: value }));

        if (errors.email) {
            setErrors(prev => ({ ...prev, email: undefined }));
        }
    }, [errors]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [errors]);

    const handleComboboxChange = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [errors]);

    const toggleShowPassword = useCallback(() => setShowPassword(prev => !prev), []);

    // Submission logic 
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate(formData);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            toast.error('Please fix the errors before submitting.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = { ...formData };
            if (isEditMode && !payload.password) delete payload.password;

            if (isEditMode) {
                await apiService.updateUser({ id: user.id, ...payload });
                toast.success(`User ${formData.email} updated successfully!`);
            } else {
                await apiService.signup(payload);
                toast.success(`User ${formData.email} created successfully!`);
            }
            onUserSaved();
        } catch (error) {
            const errorMessage = error.response?.data?.message || `Failed to ${mode} user.`;
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderRoleOption = (role) => role.name.replace(/([A-Z])/g, ' $1').trim();
    const renderProjectOption = (project) => `${project.name}`;

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div className="bg-white p-6 rounded-lg shadow-xl">Loading form...</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-lg font-bold text-gray-800">{isEditMode ? 'Edit User' : 'Create New User'}</h2>
                    <button onClick={closeModal} className='p-1 rounded-full hover:bg-gray-100 text-gray-600'><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label-style">Name <span className="text-red-500">*</span></label>
                            <input name="name" type="text" value={formData.name} onChange={handleChange} className="input-style" maxLength={VALIDATION_SCHEMA.name.maxLength.value} />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="label-style">Email <span className="text-red-500">*</span></label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleEmailChange}
                                className="input-style"
                                placeholder={`e.g., username${FIXED_EMAIL_DOMAIN}`}
                                maxLength={VALIDATION_SCHEMA.email.maxLength.value}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        {mode === 'create' && (
                            <div>
                                <label className="label-style">Password <span className="text-red-500">*</span></label>
                                <div className="relative mt-1">
                                    <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} className="input-style" maxLength={VALIDATION_SCHEMA.password.maxLength.value} />
                                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400" onClick={toggleShowPassword}>
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                {formData.password && !errors.password && <PasswordStrengthMeter password={formData.password} name={formData.name} />}
                            </div>
                        )}
                        <div>
                            <label className="label-style">Role <span className="text-red-500">*</span></label>
                            <Combobox options={selectOptions.roles} value={formData.role} onChange={(value) => handleComboboxChange('role', value)} placeholder="Select Role" optionValue="name" renderOption={renderRoleOption} />
                            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                        </div>
                        <div>
                            <label className="label-style">Company <span className="text-red-500">*</span></label>
                            {currentUser.role === 'Admin' ? (
                                <>
                                    <Combobox options={selectOptions.companies} value={formData.companyId} onChange={(value) => handleComboboxChange('companyId', value)} placeholder="Select company" optionValue="id" optionLabel="name" />
                                    {errors.companyId && <p className="text-red-500 text-xs mt-1">{errors.companyId}</p>}
                                </>
                            ) : (
                                <input type="text" value={isEditMode && user ? user.company_name : currentUser.company} className="input-style bg-gray-100" disabled />
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-style">Assign to Project(s) <span className="text-gray-400 text-xs ml-1">(Optional, max 10)</span></label>
                            <Combobox multiple options={selectOptions.projects} value={formData.projectIds} onChange={(value) => handleComboboxChange('projectIds', value)} placeholder="Select Projects" optionValue="id" renderOption={renderProjectOption} />
                            {errors.projectIds && <p className="text-red-500 text-xs mt-1">{errors.projectIds}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="submit" className="btn-primary disabled:opacity-50" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create User')}
                        </button>
                        <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
});