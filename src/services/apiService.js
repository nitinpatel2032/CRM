import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use((response) => response, (error) => {
    const msg = error.response?.data?.message || error.message;
    toast.error(msg);
    if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
    }
    return Promise.reject(error);
});

const apiService = {
    // Auth
    login: (credentials) => api.post('/auth/login', credentials),
    signup: (userData) => api.post('/auth/signup', userData),
    updateUser: (userData) => api.post(`/auth/update`, userData),
    deleteUser: (id) => api.post(`/auth/delete`, { id }),
    changeUserStatus: (id, status) => api.post(`/auth/status`, { id: id, isActive: status }),
    sendPasswordResetEmail: (email) => api.post('/auth/forgot-password', email),
    resetPassword: (resetData) => api.post('/auth/reset-password', resetData),
    fetchUsersByCompany: (companyId) => api.post(`/companies/users`, { companyId }),

    createRole: (data) => api.post('/roles', data),
    updateRole: (data) => api.post(`/roles/update`, data),
    deleteRole: (roleKey) => api.post(`/roles/delete`, { id: roleKey }),
    fetchRoles: () => api.get('/roles'),
    fetchRolePermissions: (companyId, roleId) => api.get(`/permissions?companyId=${companyId}&roleId=${roleId}`),
    updateRolePermissions: (data) => api.post(`/permissions`, data),

    // Dashboard
    fetchDashboardStats: (filters = {}) => api.get('/dashboard/dashboard-stats', { params: filters }),

    // Companies
    fetchCompanies: () => api.get('/companies'),
    addCompany: (companyData) => api.post('/companies', companyData),
    updateCompany: (data) => api.post(`/companies/update`, data),
    changeCompanyStatus: (id, status) => api.post(`/companies/status`, { id, isActive: status }),
    unlinkCompanies: (linkData) => api.post('/companies/unlink', linkData),
    linkCompanies: (linkData) => api.post('/companies/link', linkData),
    addProjectAddress: (companyId, locationData) => api.post(`/companies/${companyId}/addresses`, locationData),
    fetchProjectAddresses: (companyId) => api.get(`/companies/${companyId}/addresses`),
    updateProjectAddress: (payload) => api.post(`/companies/addresses/update`, payload),
    changeProjectAddressStatus: (payload) => api.post(`/companies/addresses/status`, payload),
    deleteProjectAddress: (data) => api.post(`/companies/addresses/delete`, data),

    // Projects
    fetchProjects: () => api.get('/projects'),
    createProject: (projectData) => api.post('/projects', projectData),
    updateProject: (projectData) => api.post(`/projects/update`, projectData),
    changeProjectStatus: (status) => api.post(`/projects/status`, status),
    fetchUserByProject: (projectId) => api.get(`/projects/${projectId}/users`),

    // Users & Assignments
    assignProjectToUser: (assignmentData) => api.post('/projects/assign', assignmentData),
    unassignProjectFromUser: (assignmentData) => api.post('/projects/unassign', assignmentData),

    // Tickets
    fetchTickets: () => api.get('/tickets'),
    createTicket: (ticketData) => api.post('/tickets', ticketData),
    updateTicket: (data) => api.post(`/tickets/update`, data),
    // deleteTicket: (id) => api.post(`/tickets/delete`, { id }),

    assignTicket: (ticketId, userId) => api.post(`/tickets/${ticketId}/assign`, userId),
    fetchTicketById: (id) => api.get(`/tickets/${id}`),
    getAttachmentById: (id) => api.get(`/tickets/attachment/${id}`),
    fetchUsersByProject: (projectId) => api.get(`/projects/${projectId}/users`),
    addCommentToTicket: (ticketId, commentData) => api.post(`/tickets/${ticketId}/comments`, commentData),
    resolveTicket: (ticketId, resolutionData) => api.post(`/tickets/${ticketId}/resolve`, resolutionData),
    reopenTicket: (ticketId, remarks) => api.post(`/tickets/${ticketId}/reopen`, remarks),
    respondToTicket: (ticketId, responseData) => api.post(`/tickets/${ticketId}/respond`, responseData),
    saveRootCause: (ticketId, rootCauseData) => api.post(`/tickets/${ticketId}/root-cause`, rootCauseData),
    getTicketReport: (filters) => api.post(`tickets/ticket-report`, filters),
    getAllDropdownValues: () => api.get(`auth/dropdown-values`),
};

export default apiService;