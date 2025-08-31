
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, FolderKanban } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePOContext } from '../../context/POcontext';
// Component Imports
import { POModal } from './POModal'; 
import { ViewPO } from './ViewPO'; // 1. Import the ViewPOModal
import ReactDataTable from '../../components/DataTableComponent';
import apiService from '../../services/apiService';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import TruncatedText from './TruncatedText';

// Static data for demonstration
// const   poStaticData = [
//     {id: 1, poNumber: 'PO-1001', customer: 'Customer A', project: 'Project A', poDate: '2025-08-11', poAmount: "150000", poFilePath: '/files/po-1001.pdf', poStatus: '1', poComment: 'Urgent delivery requested'},
//     {id: 2, poNumber: 'PO-1002', customer: 'Customer B', project: 'Project A', poDate: '2025-08-10', poAmount: "8500", poFilePath: '/files/po-1002.pdf', poStatus: '0', poComment: 'Awaiting customer confirmation'},
//     {id: 3, poNumber: 'PO-1003', customer: 'Customer C', project: 'Project A', poDate: '2025-08-09', poAmount: "22300", poFilePath: '/files/po-1003.pdf',  poStatus: '1', poComment: 'Pricing not approved by management'}
// ];


const AddPO = () => {
    // This context usage is no longer needed if viewing happens in a modal
    const { setPOData } = usePOContext(); 
    const navigate = useNavigate();
    const [statusChangeInfo, setStatusChangeInfo] = useState(null);
    // State Management
    const [poId,setPoId] = useState('');
    const [allPOs, setAllPOs] = useState([]);
    // const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [poToEdit, setPoToEdit] = useState(null);
    const [loading, setLoading] = useState(false);
    // 2. Add state for the view modal
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedPOForView, setSelectedPOForView] = useState(null);

    const fetchPOs = async () =>{
        setLoading(true);
        try {
            const response = await apiService.fetchCompany("listing");
            setAllPOs(Array.isArray(response?.data) ? response?.data : [])
        } catch (error) {
            toast.error("Failed to fetch data.");
        }finally {
          setLoading(false);
        }
    }

    useEffect(() => {
        fetchPOs();
    }, []);

    const openModal = async (po = null) => {
    if (po) {
    try {
      const pId = po.id;
      const res = await apiService.fetchCompany("file", pId); 
      setPoToEdit({
        ...po,        
        ...res.data[0],  
      });
    } catch (error) {
      toast.error("Failed to fetch file details.");
    }
  } else {
    setPoToEdit(null); // for Add new PO
  }
  setIsModalOpen(true);
};


    const closeModal = () => {
        setIsModalOpen(false);
        setPoToEdit(null);
    };

    const handlePOUpdated = () => {
        // toast.success("Purchase Order saved successfully!");
        fetchPOs();
    };

    // 3. Update table action handlers
    const handleViewPO = async (row) => {
        console.log('view',row)
      setPOData({
            heading: 'Customer Details',
            name: row.customer,
            email: 'customer-email@example.com', // Example data
            address: 'Customer Address, City',   // Example data
            project:row.project,
            poNumber: row.poNumber,
            poAmount: row.poAmount,
            poDate: row.poDate.split('T')[0],
            InvoiceNo: `INV-${row.id}` // Example data
        });
        try {
          const pId = row.id;
          const res = await apiService.fetchCompany("file", pId); 
          console.log("editresponse", res.data);
          setSelectedPOForView({
            ...row,        
            ...res.data[0],  
          });
        } catch (error) {
          toast.error("Failed to fetch file details.");
        }
        // setSelectedPOForView(row);
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedPOForView(null);
    }

    const createInvoice = (row) => {
        // This function remains the same
        navigate("/CreateInvoice");
    };

    // Table Column Configuration
    const columns = [
        { name: 'PO Number', selector: row => row.poNumber, sortable: true, grow:1 },
        { name: 'Company', selector: row => row.customer, sortable: true , grow:1 },
        { name: 'Project', selector: row => row.project, sortable: true , grow:1 },
        { name: 'PO Date', selector: row => row.poDate, sortable: true, grow:1,
        cell: row => {
        const date = new Date(row.poDate);
        return date.toLocaleString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        //   hour: '2-digit',
        //   minute: '2-digit',
        })
      },
        },
        { name: 'PO Amount', selector: row => row.poAmount, sortable: true, right: true, grow:1  },
        { name: 'Comment', selector: row => row.poComment, sortable: false,cell: row => <TruncatedText text={row.poComment} limit={30} /> , grow:2 },
        {
            name: 'Status',
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status == '1' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-900'}`}>
                    {row.status == '1' ? 'Active' : 'Inactive'}
                </span>
            ), grow:1
        }
        
    ];

    // Permissions for table actions
    const permissions = {
        edit: 1,
        view: 1,
        canCreateInvoice: 1,
        create: 1,
        status_change: 1
    };


    const promptStatusChange = async (po) => {
        const newStatusValue = po.status === 1 ? 0 : 1;
        const action = 'statusChange'
        const POID = po.id;
        const poNumber = po.poNumber;
        const currentStatus = po.status
        setStatusChangeInfo({
            POID,
            action,
            "isActive":newStatusValue,
            poNumber,
            currentStatus
        });
    };

    const handleConfirmStatusChange = async () => {
        if (!statusChangeInfo) return;
        try {
            await apiService.changeStatusPO(statusChangeInfo);
            toast.success(`Status for "${statusChangeInfo.poNumber}" updated.`);
            fetchPOs();
        } catch {
            toast.error('Failed to update project status.');
        } finally {
            setStatusChangeInfo(null);
        }
    };

    return (
        <div>
            {/* Header Section */}
            <div className="container-base container-sm">
                <h1 className="container-base-text">Purchase Orders</h1>
                {permissions.create === 1 && (
                    <button onClick={() => openModal()} className="container-base-button container-base-button-sm">
                        <FileText className="w-5 h-5 mr-2" /> Upload PO
                    </button>
                )}
            </div>

            {/* Content Section */}
            {loading ? (
                <p className="text-center mt-8">Loading...</p>
            ) : allPOs.length === 0 ? (
                <div className="text-center py-16 card">
                    <FolderKanban className="w-16 h-16 mx-auto text-gray-300" />
                    <p className="mt-4 text-lg font-semibold">No Purchase Orders found</p>
                </div>
            ) : (
                <div className="card p-4 space-y-4">
                    <ReactDataTable
                        columns={columns}
                        data={allPOs}
                        permissions={permissions}
                        onEdit={openModal}
                        onView={handleViewPO} 
                        onCreateInvoice={createInvoice}
                        onStatusChange={promptStatusChange}
                    />
                </div>
            )}

            {/* Modal for Adding/Editing a PO */}
            {isModalOpen && (
                <POModal
                    poToEdit={poToEdit}
                    closeModal={closeModal}
                    onPOUpdated={handlePOUpdated}
                />
            )}

            {/* 5. Render the new ViewPOModal */}
            {isViewModalOpen && (
                <ViewPO
                    poData={selectedPOForView}
                    onClose={closeViewModal}
                />
            )}

            {statusChangeInfo && 
            <ConfirmationModal
                isOpen={true}
                onClose={() => setStatusChangeInfo(null)}
                onConfirm={handleConfirmStatusChange}
                title="Change PO Status"
                message={`Change status of "${statusChangeInfo.poNumber}" from ${statusChangeInfo.currentStatus == '1' ? 'Active' : 'Inactive'} to ${statusChangeInfo.isActive == '1' ? 'Active' : 'Inactive'}?`}
            />}
        </div>
    );
};

export default AddPO;
