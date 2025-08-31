import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {
  Trash2,
  SquarePen,
  RotateCcw,
  Eye,
  FileSliders,
  Power,
  UserPlus,
  Link as LinkIcon,
  MapPin,
  Search,
  FileDown,
  DatabaseZap,
} from "lucide-react";

// ActionButtons Component 
const ActionButtons = ({
  row,
  permissions,
  onEdit,
  onDelete,
  onCreateInvoice,
  onManageLinks,
  onManageLocations,
  onView,
  onStatusChange,
  onAssign,
}) => {
  const ActionButton = ({ onClick, icon, title, colorClass }) => (
    <button
      onClick={() => onClick(row)}
      className={`p-1.5 rounded-full transition-colors duration-200 ${colorClass}`}
      title={title}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex items-center gap-2">
      {(permissions.edit === 1 && row.isActive === 1) && (
        <ActionButton
          onClick={onEdit}
          icon={<SquarePen className="w-4 h-4" />}
          title="Edit"
          colorClass="text-blue-600 hover:bg-blue-100"
        />
      )}
      {permissions.status_change === 1 && (
        <ActionButton
          onClick={onStatusChange}
          icon={<Power className="w-4 h-4" />}
          title="Change Status"
          colorClass={row.isActive == 0 ? "text-gray-400 hover:bg-gray-200" : "text-yellow-600 hover:bg-yellow-100"}
        />
      )}
      {permissions.view === 1 && (
        <ActionButton
          onClick={onView}
          icon={<Eye className="w-4 h-4" />}
          title="View"
          colorClass="text-green-600 hover:bg-green-100"
        />
      )}
      {permissions.delete === 1 && (
        <ActionButton
          onClick={onDelete}
          icon={<Trash2 className="w-4 h-4" />}
          title="Delete"
          colorClass="text-red-600 hover:bg-red-100"
        />
      )}
      {permissions.canCreateInvoice === 1 && (
        <ActionButton
          onClick={onCreateInvoice}
          icon={<FileSliders className="w-4 h-4" />}
          title="Create Invoice"
          colorClass="text-cyan-600 hover:bg-cyan-100"
        />
      )}
      {(permissions.location === 1 && row.isActive === 1) && (
        <ActionButton
          onClick={onManageLocations}
          icon={<MapPin className="w-4 h-4" />}
          title="Manage Locations"
          colorClass="text-indigo-600 hover:bg-indigo-100"
        />
      )}
      {(permissions.assign === 1 && row.isActive === 1) && (
        <ActionButton
          onClick={onAssign}
          icon={<UserPlus className="w-4 h-4" />}
          title="Assign"
          colorClass="text-teal-600 hover:bg-teal-100"
        />
      )}
      {permissions.link === 1 && (
        <ActionButton
          onClick={onManageLinks}
          icon={<LinkIcon className="w-4 h-4" />}
          title="Manage Links"
          colorClass="text-purple-600 hover:bg-purple-100"
        />
      )}
    </div>
  );
};

// Main DataTable Component
const ReactDataTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  onCreateInvoice,
  onManageLinks,
  onManageLocations,
  onView,
  onStatusChange,
  onAssign,
  permissions = {},
}) => {
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowId, setSelectedRowId] = useState(null);

  useEffect(() => {
    const savedPage = localStorage.getItem("datatable_page");
    const savedRow = localStorage.getItem("datatable_row");
    if (savedPage) setCurrentPage(Number(savedPage));
    if (savedRow) setSelectedRowId(savedRow);
  }, []);

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(filterText.toLowerCase())
    )
  );

  const exportToExcel = () => {
    const exportData = filterText.trim() ? filteredData : data;
    if (exportData.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = columns.map((col) => col.name);
    const rows = exportData.map((row) =>
      columns.map((col) =>
        col.selector ? (typeof col.selector === "function" ? col.selector(row) : row[col.selector]) : ""
      )
    );
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "data.xlsx");
  };

  const handleReset = () => {
    if (filterText) {
      setResetPaginationToggle(!resetPaginationToggle);
      setFilterText("");
    }
  };

  const enhancedColumns = [
    ...columns.map((col) => ({
      ...col,
      cell: col.cell
        ? col.cell
        : (row) => {
          const value = col.selector ? (typeof col.selector === 'function' ? col.selector(row) : row[col.selector]) : '';
          return <div title={value}>{value}</div>;
        },
    })),
    {
      name: "Actions",
      cell: (row) => (
        <div
          onClick={() => {
            setSelectedRowId(row.id);
            localStorage.setItem("datatable_row", row.id);
          }}
        >
          <ActionButtons
            row={row}
            permissions={permissions}
            onEdit={onEdit}
            onDelete={onDelete}
            onCreateInvoice={onCreateInvoice}
            onManageLinks={onManageLinks}
            onManageLocations={onManageLocations}
            onView={onView}
            onStatusChange={onStatusChange}
            onAssign={onAssign}
          />
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: "220px",
    },
  ];

  const customStyles = {
    headRow: {
      style: { backgroundColor: "#f9fafb", borderBottomWidth: '2px', borderBottomColor: '#e5e7eb' },
    },
    headCells: {
      style: { padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#4b5563' },
    },
    rows: {
      style: { minHeight: '52px', '&:not(:last-of-type)': { borderBottomWidth: '1px', borderBottomColor: '#e5e7eb' } },
      highlightOnHoverStyle: { backgroundColor: '#f3f4f6', transitionDuration: '0.2s', transitionProperty: 'background-color' },
    },
    cells: {
      style: { paddingLeft: '16px', paddingRight: '16px', whiteSpace: 'normal', wordBreak: 'break-word' },
    },
    pagination: { style: { borderTop: '1px solid #e5e7eb', color: '#6b7280' } },
  };

  const NoDataComponent = () => (
    <div className="flex flex-col items-center justify-center text-center p-10">
      <DatabaseZap className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700">No Data Available</h3>
      <p className="text-gray-500 mt-1">There are no records to display at this time.</p>
    </div>
  );

  return (
    <div>
      {/* Header with Search and Export */}
      <div className="px-0 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b">
        <div className="relative w-full sm:grow ">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search all columns..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="p-2 pl-10 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          {filterText && (
            <button
              onClick={handleReset}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Reset Search"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={exportToExcel}
          className="rounded flex items-center gap-1"
          title="Export Data"
        >
          <img
            src="/images/excel.png"
            className="w-10 sm:w-8 xs:w-6 hover:scale-110 transition-transform duration-200"
            alt="Export"
          />
        </button>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto w-full">
        <DataTable
          columns={enhancedColumns}
          data={filteredData}
          pagination
          paginationResetDefaultPage={resetPaginationToggle}
          paginationDefaultPage={currentPage}
          onChangePage={(page) => {
            setCurrentPage(page);
            localStorage.setItem("datatable_page", page);
          }}
          highlightOnHover
          pointerOnHover
          responsive
          customStyles={customStyles}
          noDataComponent={<NoDataComponent />}
          keyField="id"
          conditionalRowStyles={[
            {
              when: (row) => row.id === selectedRowId,
              style: { backgroundColor: '#e0f2fe', color: '#0c4a6e', fontWeight: '500' },
            },
          ]}
        // onRowClicked={(row) => {
        //   setSelectedRowId(row.id);
        //   localStorage.setItem("datatable_row", row.id);
        // }}
        />
      </div>
    </div>
  );
};

export default ReactDataTable;