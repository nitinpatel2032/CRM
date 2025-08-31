import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, RotateCcw, Ticket as TicketIcon, CheckCircle, Clock, RefreshCcw, BarChart3, LineChart as LineChartIcon, Building } from 'lucide-react';
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';
import { Combobox } from '../Combobox';

// Helper function to format milliseconds into a readable string (e.g., 1d 2h 5m)
const formatDuration = (milliseconds) => {
    if (isNaN(milliseconds) || milliseconds <= 0) {
        return 'N/A';
    }
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours % 24 > 0) parts.push(`${hours % 24}h`);
    if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
    if (parts.length === 0 && seconds > 0) parts.push(`${seconds}s`);

    return parts.length > 0 ? parts.join(' ') : '0s';
};


// card component to display key stats
const StatCard = ({ title, value, description, icon }) => (
    <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center">
            <div className="bg-sky-100 text-sky-600 rounded-lg p-2 mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
    </div>
);

export const TicketAnalytics = ({ tickets: initialTickets = [] }) => {
    const [projectFilter, setProjectFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [channelFilter, setChannelFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');

    const { projectOptions, statusOptions, channelOptions, locationOptions } = useMemo(() => {
        const projects = new Set();
        const statuses = new Set();
        const channels = new Set();
        const locations = new Set();
        initialTickets.forEach(t => {
            if (t.projectName) projects.add(t.projectName);
            if (t.status) statuses.add(t.status);
            if (t.channel) channels.add(t.channel);
            if (t.location_name) locations.add(t.location_name);
        });
        const mapToOptions = (set) => [...Array.from(set).sort().map(item => ({ id: item, name: item }))];
        return {
            projectOptions: mapToOptions(projects),
            statusOptions: mapToOptions(statuses),
            channelOptions: mapToOptions(channels),
            locationOptions: mapToOptions(locations)
        };
    }, [initialTickets]);

    const analyzedTickets = useMemo(() => {
        if (!initialTickets) return [];
        return initialTickets.filter(ticket => {
            const projectMatch = !projectFilter || ticket.projectName === projectFilter;
            const statusMatch = !statusFilter || ticket.status === statusFilter;
            const channelMatch = !channelFilter || ticket.channel === channelFilter;
            const locationMatch = !locationFilter || ticket.location_name === locationFilter;
            const startDateMatch = !startDate || new Date(ticket.createdAt) >= new Date(startDate);
            const endDateMatch = !endDate || new Date(ticket.createdAt) <= new Date(new Date(endDate).setHours(23, 59, 59, 999));
            return projectMatch && statusMatch && startDateMatch && endDateMatch && channelMatch && locationMatch;
        });
    }, [initialTickets, projectFilter, statusFilter, startDate, endDate, channelFilter, locationFilter]);

    // --- Data processing for charts ---
    const ticketsByStatus = useMemo(() => {
        const counts = analyzedTickets.reduce((acc, ticket) => {
            acc[ticket.status] = (acc[ticket.status] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [analyzedTickets]);

    const ticketsByProject = useMemo(() => {
        const counts = analyzedTickets.reduce((acc, ticket) => {
            acc[ticket.projectName] = (acc[ticket.projectName] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [analyzedTickets]);

    const ticketsByLocation = useMemo(() => {
        const counts = analyzedTickets.reduce((acc, ticket) => {
            const location = ticket.location_name || 'Unknown';
            acc[location] = (acc[location] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [analyzedTickets]);

    const ticketsOverTime = useMemo(() => {
        const dailyData = analyzedTickets.reduce((acc, ticket) => {
            // Created tickets
            const createdDate = new Date(ticket.createdAt).toISOString().split('T')[0];
            if (!acc[createdDate]) {
                acc[createdDate] = { date: createdDate, created: 0, resolved: 0, reopened: 0 };
            }
            acc[createdDate].created += 1;

            // Resolved tickets
            if (ticket.status === 'Resolved' && ticket.updatedAt) {
                const resolvedDate = new Date(ticket.updatedAt).toISOString().split('T')[0];
                if (!acc[resolvedDate]) {
                    acc[resolvedDate] = { date: resolvedDate, created: 0, resolved: 0, reopened: 0 };
                }
                acc[resolvedDate].resolved += 1;
            }

            // Reopened tickets
            if (ticket.status === 'Reopened' && ticket.updatedAt) {
                const reopenedDate = new Date(ticket.updatedAt).toISOString().split('T')[0];
                if (!acc[reopenedDate]) {
                    acc[reopenedDate] = { date: reopenedDate, created: 0, resolved: 0, reopened: 0 };
                }
                acc[reopenedDate].reopened += 1;
            }

            return acc;
        }, {});

        return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [analyzedTickets]);

    const ticketStats = useMemo(() => {
        const total = analyzedTickets.length;
        const open = analyzedTickets.filter(t => t.status === 'Open').length;
        const inprogress = analyzedTickets.filter(t => t.status === 'In Progress').length;
        const reopen = analyzedTickets.filter(t => t.status === 'Reopened').length;
        const resolved = analyzedTickets.filter(t => t.status === 'Resolved');

        let avgTimeText = 'N/A';
        if (resolved.length > 0) {
            const totalResolutionTime = resolved.reduce((acc, t) => acc + (new Date(t.updatedAt) - new Date(t.createdAt)), 0);
            avgTimeText = formatDuration(totalResolutionTime / resolved.length);
        }

        let avgLoggingDelayText = 'N/A';
        if (total > 0) {
            const ticketsWithComplaintTime = analyzedTickets.filter(t => t.complaintTime);
            if (ticketsWithComplaintTime.length > 0) {
                const totalLoggingDelay = ticketsWithComplaintTime.reduce((acc, t) => acc + (new Date(t.createdAt) - new Date(t.complaintTime)), 0);
                avgLoggingDelayText = formatDuration(totalLoggingDelay / ticketsWithComplaintTime.length);
            }
        }

        return { total, open, inprogress, reopen, resolved: resolved.length, avgTimeText, avgLoggingDelayText };
    }, [analyzedTickets]);

    const handleResetFilters = () => {
        setProjectFilter('');
        setStatusFilter('');
        setStartDate('');
        setEndDate('');
        setChannelFilter('');
        setLocationFilter('');
    };

    const STATUS_COLORS = ['#3B82F6', '#10B981', '#F97316', '#F59E0B', '#6366F1'];
    const TYPE_COLORS = ['#14B8A6', '#F43F5E'];
    const PROJECT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#A4DE6C', '#83A6ED'];

    return (
        <div className="space-y-3">
            <div className="p-2 border rounded-lg bg-gray-50/70">
                <div className="flex items-center mb-1">
                    <SlidersHorizontal size={16} className="text-gray-600 mr-2" />
                    <h3 className="text-md font-semibold text-gray-700">Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3">
                    <div>
                        <label className="label-style">Project</label>
                        <div className="mt-1">
                            <Combobox
                                options={projectOptions}
                                value={projectFilter}
                                onChange={(val) => setProjectFilter(val || '')}
                                placeholder="All Projects"
                                optionValue="id"
                                optionLabel="name"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label-style">Status</label>
                        <div className="mt-1">
                            <Combobox
                                options={statusOptions}
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val || '')}
                                placeholder="All Statuses"
                                optionValue="id"
                                optionLabel="name"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label-style">Channel</label>
                        <div className="mt-1">
                            <Combobox
                                options={channelOptions}
                                value={channelFilter}
                                onChange={(val) => setChannelFilter(val || '')}
                                placeholder="All Channels"
                                optionValue="id"
                                optionLabel="name"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label-style">Location</label>
                        <div className="mt-1">
                            <Combobox
                                options={locationOptions}
                                value={locationFilter}
                                onChange={(val) => setLocationFilter(val || '')}
                                placeholder="All Locations"
                                optionValue="id"
                                optionLabel="name"
                            />
                        </div>
                    </div>
                    <div><label className="label-style">Created From</label><input type="date" className="input-style mt-1" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                    <div><label className="label-style">Created To</label><input type="date" className="input-style mt-1" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} /></div>
                    <div className="self-end"><button onClick={handleResetFilters} className="btn-secondary w-20"><RotateCcw size={14} className="mr-1" />Reset</button></div>
                </div>
            </div>

            {analyzedTickets.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-gray-500">No tickets match your selected analysis filters.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-2">
                        <StatCard title="Total Tickets" value={ticketStats.total} icon={<TicketIcon size={18} />} />
                        <StatCard title="Open Tickets" value={ticketStats.open} icon={<Clock size={18} />} />
                        <StatCard title="In Progress" value={ticketStats.inprogress} icon={<Clock size={18} />} />
                        <StatCard title="Resolved" value={ticketStats.resolved} icon={<CheckCircle size={18} />} />
                        <StatCard title="Reopened" value={ticketStats.reopen} icon={<RefreshCcw size={18} />} />
                        <StatCard title="Avg. Resolution" value={ticketStats.avgTimeText} description="For resolved tickets" icon={<Clock size={18} />} />
                        <StatCard title="Avg. Logging Delay" value={ticketStats.avgLoggingDelayText} description="Complaint vs. Creation" icon={<Clock size={18} />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-[320px]">
                        <div className="p-2 border rounded-lg shadow-sm">
                            <div className="flex items-center mb-2"><LineChartIcon size={16} className="text-gray-600 mr-2" /><h4 className="font-semibold text-gray-700">Ticket Trend</h4></div>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={ticketsOverTime} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="created" name="Created" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#82ca9d" strokeWidth={2} />
                                    <Line type="monotone" dataKey="reopened" name="Reopened" stroke="#ffc658" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="p-2 border rounded-lg shadow-sm">
                            <h4 className="font-semibold text-gray-700 mb-2">Tickets by Status</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={ticketsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                                        {ticketsByStatus.map((entry, index) => (<Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="p-2 border rounded-lg shadow-sm">
                            <div className="flex items-center mb-2"><Building size={16} className="text-gray-600 mr-2" /><h4 className="font-semibold text-gray-700">Tickets per Location</h4></div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={ticketsByLocation} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip cursor={{ fill: 'rgba(239, 246, 255, 0.6)' }} />
                                    <Bar dataKey="value" name="Tickets">
                                        {ticketsByLocation.map((entry, index) => (<Cell key={`cell-${index}`} fill={PROJECT_COLORS[index % PROJECT_COLORS.length]} />))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="p-2 border rounded-lg shadow-sm">
                            <div className="flex items-center mb-2"><BarChart3 size={16} className="text-gray-600 mr-2" /><h4 className="font-semibold text-gray-700">Tickets per Project</h4></div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={ticketsByProject} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip cursor={{ fill: 'rgba(239, 246, 255, 0.6)' }} />
                                    <Bar dataKey="value" name="Tickets">
                                        {ticketsByProject.map((entry, index) => (<Cell key={`cell-${index}`} fill={PROJECT_COLORS[index % PROJECT_COLORS.length]} />))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};