import React, { useEffect, useState, useMemo } from 'react';
import apiService from '../../services/apiService';
import { X, Loader, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { Combobox } from '../../components/Combobox';
import ReactDataTable from '../../components/DataTableComponent';

// Helper component for status badge 
const StatusBadge = ({ status }) => {
    const styles = {
        Open: 'bg-blue-100 text-blue-800',
        Resolved: 'bg-green-100 text-green-800',
        'In Progress': 'bg-yellow-100 text-yellow-800',
        Reopened: 'bg-orange-100 text-orange-800',
        Closed: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles[status] || styles.Closed}`}>{status}</span>;
};

const TicketReport = () => {
    const initialFilters = {
        involvedUserId: '',
        ticketId: '',
        projectId: '',
        companyId: '',
        locationId: '',
        startDate: '',
        endDate: '',
        complaintBy: '',
        channel: '',
        assignedToId: '',
        resolvedById: ''
    };

    const [filters, setFilters] = useState(initialFilters);
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [reportGenerated, setReportGenerated] = useState(false);
    const [dropdownOptions, setDropdownOptions] = useState({
        users: [],
        projects: [],
        locations: [],
        companies: [],
        tickets: []
    });

    // Fetch data for filter dropdowns on component mount
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const options = await apiService.getAllDropdownValues();
                setDropdownOptions(options.data);
            } catch (err) {
                toast.error(err.message || 'Could not load filter options.');
            }
        };
        fetchOptions();
    }, []);

    // Re-fetch projects and locations if the company filter changes
    useEffect(() => {
        if (filters.companyId) {
            const fetchFilteredOptions = async () => {
                try {
                    const options = await apiService.getAllDropdownValues(filters.companyId);
                    setDropdownOptions(prev => ({
                        ...prev,
                        projects: options.projects,
                        locations: options.locations
                    }));
                } catch (err) {
                    toast.error('Could not update project/location filters.');
                }
            };
            fetchFilteredOptions();
        }
    }, [filters.companyId]);

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value || '' }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    }

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setReportGenerated(true);
        setReportData([]);
        try {
            const data = await apiService.getTicketReport(filters);
            setReportData(data.data);
        } catch (err) {
            toast.error(err.message || 'Failed to generate the report.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearFilters = () => {
        setFilters(initialFilters);
        setReportData([]);
        setReportGenerated(false);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // Define columns for ReactDataTable
    const reportColumns = useMemo(() => [
        { name: 'Ticket ID', selector: row => row.ticket_uid, sortable: true, minWidth: '150px' },
        { name: 'Title', selector: row => row.title, sortable: true, minWidth: '250px' },
        { name: 'Status', cell: row => <StatusBadge status={row.status} />, selector: row => row.status, sortable: true },
        { name: 'Project', selector: row => row.project_name, sortable: true },
        { name: 'Assigned To', selector: row => row.assigned_to_name || 'Unassigned', sortable: true },
        { name: 'Created At', cell: row => formatDateTime(row.created_at), selector: row => row.created_at, sortable: true, minWidth: '180px' },
        { name: 'Resolved At', cell: row => formatDateTime(row.resolved_at), selector: row => row.resolved_at, sortable: true, minWidth: '180px' },
    ], []);


    const channelOptions = ['Call', 'WhatsApp', 'Email'].map(c => ({ id: c, name: c }));

    return (
        <div>
            <div className="container-base container-sm">
                <div><h1 className="container-base-text">Ticket Report</h1></div>
            </div>
            <div className="card p-4 space-y-6">
                {/* Filter Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                    <Combobox placeholder="Select User" options={dropdownOptions.users} value={filters.involvedUserId} onChange={(value) => handleFilterChange('involvedUserId', value)} />
                    <Combobox placeholder="Select Company" options={dropdownOptions.companies} value={filters.companyId} onChange={(value) => handleFilterChange('companyId', value)} />
                    <Combobox placeholder="Select Project" options={dropdownOptions.projects} value={filters.projectId} onChange={(value) => handleFilterChange('projectId', value)} />
                    <Combobox placeholder="Select Location" options={dropdownOptions.locations} value={filters.locationId} onChange={(value) => handleFilterChange('locationId', value)} />
                    <Combobox placeholder="Select Ticket ID" options={dropdownOptions.tickets} value={filters.ticketId} onChange={(value) => handleFilterChange('ticketId', value)} />
                    <Combobox placeholder="Select Channel" options={channelOptions} value={filters.channel} onChange={(value) => handleFilterChange('channel', value)} />
                    <Combobox placeholder="Select Assigned User" options={dropdownOptions.users} value={filters.assignedToId} onChange={(value) => handleFilterChange('assignedToId', value)} />
                    <Combobox placeholder="Select Resolved By" options={dropdownOptions.users} value={filters.resolvedById} onChange={(value) => handleFilterChange('resolvedById', value)} />
                    <div>
                        <input type="text" name="complaintBy" value={filters.complaintBy} onChange={handleInputChange} placeholder="Complaint By..." className="input-style" />
                    </div>
                    <div>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleInputChange} className="input-style" />
                    </div>
                    <div>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleInputChange} className="input-style" />
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-4">
                    <button onClick={handleClearFilters} className="text-sm font-semibold text-gray-600 hover:text-gray-800 flex items-center gap-2">
                        <X size={16} /> Clear
                    </button>
                    <button onClick={handleGenerateReport} disabled={isLoading} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:bg-indigo-300 flex items-center gap-2">
                        {isLoading ? <Loader size={20} className="animate-spin" /> : <FileDown size={20} />}
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>

                {/* Results Section */}
                {isLoading && (
                    <div className="p-8 text-center">
                        <Loader className="animate-spin inline-block text-indigo-600" size={32} />
                        <p className="mt-2 text-sm text-gray-500">Loading report data...</p>
                    </div>
                )}

                {!isLoading && !reportGenerated && (
                    <div className="p-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
                        <p>No data to display. Please select filters and generate a report.</p>
                    </div>
                )}

                {!isLoading && reportGenerated && (
                    <ReactDataTable
                        columns={reportColumns}
                        data={reportData}
                    />
                )}
            </div>
        </div>
    );
}

export default TicketReport;