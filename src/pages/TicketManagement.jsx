import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Link } from "react-router-dom";
// Component Imports
import { TicketModal } from '../components/TicketManagement/TicketModal';
import { TicketReportModal } from '../components/TicketManagement/TicketReportModal';
import { TicketAnalyticsModal } from '../components/TicketManagement/TicketAnalyticsModal';
import { TicketFilters } from '../components/TicketManagement/TicketFilters';
import { ExportControls } from '../components/TicketManagement/ExportControls';
import { ExportModal } from '../components/TicketManagement/ExportModal';
// Context, Services, and Utils
import apiService from '../services/apiService';
import { usePermissions } from '../context/PermissionsContext';
import { exportToExcel, exportToPdf } from '../utils/exportUtils';
import { PlusCircle, Ticket } from 'lucide-react';
import ReactDataTable from '../components/DataTableComponent';

const TicketManagement = () => {
  const { permissions } = usePermissions();
  const ticketPermissions = permissions?.Tickets || {};
  const onlyEdit = { edit: ticketPermissions.edit };

  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isCreateEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [viewingTicketId, setViewingTicketId] = useState(null);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState(null); // 'Excel' or 'PDF'

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createdStartFilter, setCreatedStartFilter] = useState('');
  const [createdEndFilter, setCreatedEndFilter] = useState('');
  const [resolvedStartFilter, setResolvedStartFilter] = useState('');
  const [resolvedEndFilter, setResolvedEndFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    setLoading(true);
    apiService.fetchTickets()
      .then(res => {
        let tickets = [];
        if (res && res.data) {
          const data = res.data;
          if (data && typeof data === 'object' && 'success' in data && Array.isArray(data.data)) {
            tickets = data.data;
          } else if (Array.isArray(data)) {
            tickets = data;
          }
        } else if (res && typeof res === 'object' && 'success' in res && Array.isArray(res.data)) {
          tickets = res.data;
        } else if (Array.isArray(res)) {
          tickets = res;
        }
        if (tickets.length > 0) {
          setAllTickets(tickets);
        } else {
          toast.error("No tickets found.");
          setAllTickets([]);
        }
      })
      .catch(() => toast.error("Failed to fetch tickets."))
      .finally(() => setLoading(false));
  };

  const headers = [
    {
      name: 'Ticket Id',
      selector: row => row.ticket_uid,
      sortable: true,
      cell: row => (
        <Link
          to={`/tickets/${row.id}`}
          className="text-blue-500 font-bold hover:underline"
          state={{ ticket: row }}
        >
          {row.ticket_uid}
        </Link>
      ),
      grow: 2,
    },
    { name: 'Project', selector: row => row.project_name, sortable: true, grow: 1 },
    { name: 'Location', selector: row => row.location_name, sortable: true, grow: 1 },
    {
      name: 'Created At',
      selector: row => row.created_at,
      sortable: true,
      cell: row => {
        const date = new Date(row.created_at);
        return date.toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
      grow: 2,
    },
    {
      name: 'Resolved At',
      selector: row => row.status === 'Resolved' ? row.resolved_at : '---',
      sortable: true,
      cell: row => {
        if (row.status !== 'Resolved' || !row.resolved_at) return '---';
        const date = new Date(row.resolved_at);
        return date.toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
      grow: 2
    },
    {
      name: 'Resolution Time',
      selector: row => row.status === 'Resolved' && row.resolved_at && row.complaint_at
        ? new Date(row.resolved_at) - new Date(row.complaint_at)
        : null,
      sortable: true,
      cell: row => {
        if (row.status !== 'Resolved' || !row.resolved_at || !row.complaint_at) return '---';

        const start = new Date(row.complaint_at);
        const end = new Date(row.resolved_at);
        const diffMs = end - start;

        if (diffMs < 0) return '---';

        const diffMins = Math.floor(diffMs / (1000 * 60));
        const days = Math.floor(diffMins / (60 * 24));
        const hours = Math.floor((diffMins % (60 * 24)) / 60);
        const minutes = diffMins % 60;

        let formatted = '';
        if (days > 0) formatted += `${days}d `;
        if (hours > 0) formatted += `${hours}h `;
        if (minutes > 0) formatted += `${minutes}m`;

        return formatted.trim() || '0m';
      },
      grow: 2,
    },
    {
      name: 'Status',
      minWidth: '120px',
      selector: row => row.status,
      sortable: true,
      cell: row => {
        let statusClass = '';
        switch (row.status) {
          case 'Open': statusClass = 'bg-blue-100 text-blue-700'; break;
          case 'In Progress': statusClass = 'bg-yellow-100 text-yellow-700'; break;
          case 'Resolved': statusClass = 'bg-green-100 text-green-700'; break;
          case 'Reopened': statusClass = 'bg-red-100 text-red-700'; break;
          default: statusClass = 'bg-gray-100 text-gray-700';
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
            {row.status}
          </span>
        );
      },
      grow: 1,
    }
  ];

  const { projectFilterOptions, locationFilterOptions, statusOptions } = useMemo(() => {
    const uniqueProjects = new Set();
    const uniqueLocations = new Set();
    allTickets.forEach(t => {
      if (t.project_name) uniqueProjects.add(t.project_name);
      if (t.location_name) uniqueLocations.add(t.location_name);
    });
    const mapToOptions = (set, defaultLabel) => [
      { id: '', name: defaultLabel },
      ...Array.from(set).sort().map(item => ({ id: item, name: item }))
    ];
    return {
      projectFilterOptions: mapToOptions(uniqueProjects, 'All Projects'),
      locationFilterOptions: mapToOptions(uniqueLocations, 'All Locations'),
      statusOptions: [
        { id: '', name: 'All Statuses' },
        { id: 'Open', name: 'Open' },
        { id: 'In Progress', name: 'In Progress' },
        { id: 'Resolved', name: 'Resolved' },
        { id: 'Reopened', name: 'Reopened' },
      ],
    };
  }, [allTickets]);

  const filteredTickets = useMemo(() => {
    let results = [...allTickets];
    if (searchQuery)
      results = results.filter(t =>
      (t.ticket_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    if (projectFilter) results = results.filter(t => t.project_name === projectFilter);
    if (locationFilter) results = results.filter(t => t.location_name === locationFilter);
    if (statusFilter) results = results.filter(t => t.status === statusFilter);
    if (createdStartFilter) results = results.filter(t => new Date(t.created_at) >= new Date(createdStartFilter));
    if (createdEndFilter) {
      const endOfDay = new Date(createdEndFilter);
      endOfDay.setHours(23, 59, 59, 999);
      results = results.filter(t => new Date(t.created_at) <= endOfDay);
    }
    if (resolvedStartFilter) results = results.filter(t => t.status === 'Resolved' && t.updated_at && new Date(t.updated_at) >= new Date(resolvedStartFilter));
    if (resolvedEndFilter) {
      const endOfDay = new Date(resolvedEndFilter);
      endOfDay.setHours(23, 59, 59, 999);
      results = results.filter(t => t.status === 'Resolved' && t.updated_at && new Date(t.updated_at) <= endOfDay);
    }
    return results;
  }, [
    searchQuery, projectFilter, locationFilter, statusFilter,
    createdStartFilter, createdEndFilter, resolvedStartFilter, resolvedEndFilter, allTickets
  ]);

  const openCreateModal = () => { setEditingTicket(null); setCreateEditModalOpen(true); };
  const openEditModal = (ticket) => { setEditingTicket(ticket); setCreateEditModalOpen(true); };
  // const openReportModal = (id) => { setViewingTicketId(id); setIsReportModalOpen(true); };

  const handleOpenExportModal = (type) => {
    setExportType(type);
    setIsExportModalOpen(true);
  };

  const handleConfirmExport = async ({ startDate, endDate }) => {
    setIsExportModalOpen(false);
    let ticketsForExport = [...allTickets];

    if (startDate) ticketsForExport = ticketsForExport.filter(t => new Date(t.created_at) >= new Date(startDate));
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      ticketsForExport = ticketsForExport.filter(t => new Date(t.created_at) <= endOfDay);
    }

    if (ticketsForExport.length === 0) {
      toast.error("No tickets found for the selected date range.");
      return;
    }

    if (exportType === 'Excel') {
      await exportToExcel(ticketsForExport);
    } else if (exportType === 'PDF') {
      await exportToPdf(ticketsForExport);
    }
  };

  return (
    <div>
      {isCreateEditModalOpen && (
        <TicketModal
          closeModal={() => setCreateEditModalOpen(false)}
          onTicketSaved={loadTickets}
          ticketToEdit={editingTicket}
        />
      )}
      {isReportModalOpen && (
        <TicketReportModal
          ticketId={viewingTicketId}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
      {isAnalyticsModalOpen && (
        <TicketAnalyticsModal
          onClose={() => setIsAnalyticsModalOpen(false)}
          tickets={filteredTickets}
        />
      )}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleConfirmExport}
        exportType={exportType}
      />

      <div className="container-base container-sm">
        <h1 className="container-base-text">Ticket Management</h1>
        {ticketPermissions.create === 1 && (
          <button
            onClick={openCreateModal}
            className="container-base-button container-base-button-sm"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> New Ticket
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : allTickets.length === 0 ? (
        <div className="text-center py-16 card">
          <Ticket className="w-16 h-16 mx-auto text-gray-300" />
          <p className="mt-4 text-lg font-semibold">No tickets yet!</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-4 space-y-4">
          <TicketFilters
            filters={{
              searchQuery, projectFilter, locationFilter, statusFilter,
              createdStartFilter, createdEndFilter, resolvedStartFilter, resolvedEndFilter
            }}
            setters={{
              setSearchQuery, setProjectFilter, setLocationFilter, setStatusFilter,
              setCreatedStartFilter, setCreatedEndFilter, setResolvedStartFilter, setResolvedEndFilter
            }}
            options={{ projectFilterOptions, locationFilterOptions, statusOptions }}
            showAdvancedFilters={showAdvancedFilters}
            setShowAdvancedFilters={setShowAdvancedFilters}
          />
          <div className="flex justify-end">
            <ExportControls
              onAnalyticsClick={() => setIsAnalyticsModalOpen(true)}
              onExportClick={handleOpenExportModal}
            />
          </div>
          <ReactDataTable
            columns={headers}
            data={filteredTickets}
            permissions={onlyEdit}
            onEdit={openEditModal}
          />
        </div>
      )}
    </div>
  );
};

export default TicketManagement;