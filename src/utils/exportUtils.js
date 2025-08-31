import toast from 'react-hot-toast';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import apiService from '../services/apiService';
import { formatDateTime, formatDateForInput } from './formatters';
import { calculateResolutionTime } from './ticketUtils';

// --- EXCEL EXPORT LOGIC ---
export const exportToExcel = async (ticketsToExport) => {
    const loadingToast = toast.loading('Preparing enhanced Excel export...');
    try {
        const promises = ticketsToExport.map(ticket => apiService.fetchTicketById(ticket.id).then(res => res.data));
        const detailedTickets = await Promise.all(promises);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Tickets Report');

        worksheet.columns = [
            { header: 'Ticket ID', key: 'ticket_id' }, { header: 'Title', key: 'title' },
            { header: 'Status', key: 'status' }, { header: 'Description', key: 'description' },
            { header: 'Project', key: 'projectName' }, { header: 'Location', key: 'locationName' },
            { header: 'Company', key: 'companyName' }, { header: 'Complaint By', key: 'complaint_by' },
            { header: 'Complaint Channel', key: 'channel' }, { header: 'Complaint Time', key: 'complaint_at' },
            { header: 'Created By', key: 'createdByName' }, { header: 'Created At', key: 'createdAt' },
            { header: 'Responded By', key: 'respondedByName' }, { header: 'Responded At', key: 'respondedAt' },
            { header: 'Response Remarks', key: 'respond_remarks' }, { header: 'Resolved By', key: 'updatedByName' },
            { header: 'Root Cause', key: 'root_cause' }, { header: 'Root Cause Provider', key: 'root_cause_provider' },
            { header: 'Resolved At', key: 'resolvedAt' }, { header: 'Resolution Time', key: 'resolutionTime' }
        ];

        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.font = { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        const rows = detailedTickets.map(t => ({
            ...t,
            complaint_at: formatDateTime(t.complaint_at), createdAt: formatDateTime(t.createdAt),
            respondedAt: formatDateTime(t.respondedAt),
            resolvedAt: t.status === 'Resolved' ? formatDateTime(t.updatedAt) : '---',
            resolutionTime: calculateResolutionTime(t.complaint_at, t.updatedAt, t.status)
        }));
        worksheet.addRows(rows);

        worksheet.columns.forEach(column => {
            let maxColumnLength = 0;
            maxColumnLength = column.header.length > maxColumnLength ? column.header.length : maxColumnLength;
            column.eachCell({ includeEmpty: true }, cell => {
                const cellLength = cell.value ? cell.value.toString().length : 0;
                if (cellLength > maxColumnLength) { maxColumnLength = cellLength; }
            });
            column.width = maxColumnLength < 12 ? 12 : (maxColumnLength > 50 ? 50 : maxColumnLength + 4);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Tickets_Report_${formatDateForInput(new Date()).split('T')[0]}.xlsx`);
        toast.success("Excel export successful!");

    } catch (error) {
        toast.error("Failed to generate Excel export.");
    } finally {
        toast.dismiss(loadingToast);
    }
};

// --- PDF EXPORT LOGIC ---
export const exportToPdf = async (ticketsToExport) => {
    const loadingToast = toast.loading('Preparing PDF export...');
    try {
        const promises = ticketsToExport.map(ticket => apiService.fetchTicketById(ticket.id).then(res => res.data));
        const detailedTickets = await Promise.all(promises);
        const doc = new jsPDF({ orientation: 'landscape' });

        const tableColumn = [
            'Ticket ID', 'Title', 'Status', 'Project', 'Location', 'Company', 'Complaint By', 'Channel',
            'Complaint Time', 'Created By', 'Created At', 'Responded By', 'Responded At', 'Root Cause', 'Root Cause Provider',
            'Resolved At', 'Resolution Time'
        ];
        const tableRows = detailedTickets.map(t => [
            t.ticket_id, t.title, t.status, t.projectName, t.locationName, t.companyName, t.complaint_by,
            t.channel, formatDateTime(t.complaint_at), t.createdByName, formatDateTime(t.createdAt),
            t.respondedByName, formatDateTime(t.respondedAt), t.root_cause, t.root_cause_provider,
            t.status === 'Resolved' ? formatDateTime(t.updatedAt) : '---',
            calculateResolutionTime(t.complaint_at, t.updatedAt, t.status)
        ]);

        doc.setFontSize(12);
        doc.text("Detailed Ticket Report", 14, 16);

        autoTable(doc, {
            head: [tableColumn], body: tableRows, startY: 20, theme: 'striped',
            headStyles: { fillColor: [22, 160, 133], fontSize: 6 },
            styles: { fontSize: 5, cellPadding: 1.5 },
        });

        doc.save(`Tickets_Report_${formatDateForInput(new Date()).split('T')[0]}.pdf`);
        toast.success("PDF export successful!");

    } catch (error) {
        toast.error("Failed to generate PDF.");
    } finally {
        toast.dismiss(loadingToast);
    }
};