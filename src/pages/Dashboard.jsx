import React, { useState, useEffect, useMemo } from 'react';
import apiService from '../services/apiService';
import { Building, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Combobox } from '../components/Combobox';

const StatCard = ({ title, value, icon, color }) => (
    <div className={`card p-4 flex items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
        <div className={`p-3 rounded-full ${color.bg}`}>
            {React.cloneElement(icon, { size: 24, className: color.text })}
        </div>
        <div className="ml-4">
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const PerformanceCard = ({ period, created, resolved }) => (
    <div className="card p-4 space-y-3">
        <h3 className="font-semibold text-center text-gray-600">{period}</h3>
        <div className="flex justify-around">
            <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{created}</p>
                <p className="text-sm text-gray-500">Created</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{resolved}</p>
                <p className="text-sm text-gray-500">Resolved</p>
            </div>
        </div>
    </div>
);


const Dashboard = () => {
    const [generalStats, setGeneralStats] = useState(null);
    const [ticketStats, setTicketStats] = useState(null);
    const [historicalStats, setHistoricalStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const [companies, setCompanies] = useState([]);
    const [projects, setProjects] = useState([]);
    const [filters, setFilters] = useState({ companyId: null, projectId: null });

    // Load data on component mount
    useEffect(() => {
        setLoading(true);
        const promises = [
            apiService.fetchDashboardStats(),
            apiService.fetchCompanies(),
            apiService.fetchProjects(),
        ];

        Promise.all(promises).then((results) => {
            setGeneralStats(results[0].data.generalStats);
            setHistoricalStats(results[0].data.historicalStats);
            setTicketStats(results[0].data.ticketStats);
            setCompanies(results[1].data.data);
            setProjects(results[2].data.data);
        }).catch(err => console.error("Failed to load dashboard data", err))
            .finally(() => setLoading(false));
    }, []);

    const handleFilterChange = (name, value) => {
        const newFilters = { ...filters, [name]: value || null };
        // Reset project filter if company changes
        if (name === 'companyId') {
            newFilters.projectId = null;
        }
        setFilters(newFilters);
    };

    const chartData = useMemo(() => ticketStats ? [
        { name: 'Open', count: ticketStats.open, fill: '#ef4444' }, // Red
        { name: 'In Progress', count: ticketStats.inProgress, fill: '#f59e0b' }, // Amber
        { name: 'Resolved', count: ticketStats.resolved, fill: '#10b981' }, // Emerald
    ] : [], [ticketStats]);

    const filteredProjects = useMemo(() => filters.companyId
        ? projects.filter(p => p.company_id === parseInt(filters.companyId))
        : projects
        , [filters.companyId, projects]);

    if (loading) return <div className="text-center p-8">Loading dashboard...</div>;

    // Options for comboboxes, including an "All" option
    const companyOptions = [{ id: '', name: 'All Companies' }, ...companies];
    const projectOptions = [{ id: '', name: 'All Projects' }, ...filteredProjects];

    return (
        <div>
            <div className="container-base container-sm mb-6 mt-1">
                <div><h1 className="container-base-text">Dashboard</h1></div>
            </div>

            {/* --- FILTERS --- */}
            <div className="card p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Combobox
                        options={companyOptions}
                        value={filters.companyId}
                        onChange={(value) => handleFilterChange('companyId', value)}
                        optionValue="id"
                        optionLabel="name"
                        placeholder="Filter by Company"
                    />
                    <Combobox
                        options={projectOptions}
                        value={filters.projectId}
                        onChange={(value) => handleFilterChange('projectId', value)}
                        disabled={!filters.companyId}
                        optionValue="id"
                        optionLabel="name"
                        placeholder="Filter by Project"
                    />
                </div>
            </div>

            {/* --- KEY METRICS --- */}
            <div className='mb-8'>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Key Metrics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard title="Open Tickets" value={ticketStats?.open || 0} icon={<AlertCircle />} color={{ bg: 'bg-red-100', text: 'text-red-600' }} />
                    <StatCard title="In Progress" value={ticketStats?.inProgress || 0} icon={<Clock />} color={{ bg: 'bg-yellow-100', text: 'text-yellow-600' }} />
                    <StatCard title="Resolved" value={ticketStats?.resolved || 0} icon={<CheckCircle />} color={{ bg: 'bg-green-100', text: 'text-green-600' }} />
                    <StatCard title="Companies" value={generalStats?.totalCompanies || 0} icon={<Building />} color={{ bg: 'bg-blue-100', text: 'text-blue-600' }} />
                    <StatCard title="Users" value={generalStats?.totalUsers || 0} icon={<Users />} color={{ bg: 'bg-indigo-100', text: 'text-indigo-600' }} />
                </div>
            </div>

            {/* --- PERFORMANCE OVERVIEW --- */}
            <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Performance Overview</h2>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Left Column: Chart */}
                    <div className="lg:col-span-3 card p-4">
                        <h3 className="font-semibold text-gray-800 mb-4">Ticket Status Breakdown</h3>
                        <div className="w-full h-80">
                            <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} />
                                    <Bar dataKey="count" barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right Column: Historical Stats */}
                    <div className="lg:col-span-2 space-y-4">
                        <PerformanceCard period="Today" created={historicalStats?.createdToday || 0} resolved={historicalStats?.resolvedToday || 0} />
                        <PerformanceCard period="This Week" created={historicalStats?.createdThisWeek || 0} resolved={historicalStats?.resolvedThisWeek || 0} />
                        <PerformanceCard period="This Month" created={historicalStats?.createdThisMonth || 0} resolved={historicalStats?.resolvedThisMonth || 0} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;