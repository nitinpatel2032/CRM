// import React from 'react'
// import HeaderComponent from '../../components/DynamicData/HeaderComponent'
// import { Files } from 'lucide-react';
// import ReactDataTable from '../../components/DataTableComponent';
// import { useNavigate } from 'react-router-dom';
// import { usePOContext } from '../../context/POcontext';
// const AddInvoice = () => {
//   const { poData, setPOData,invoiceData, setInvoiceData } = usePOContext();
// const navigate = useNavigate();
// const data =[
//     {id: 1,invoiceNumner:'2346YU8',poId:'WE236TG', invoiceDate:'22/07/2025',status:'Active',customerName: 'John Doe',  customerId: 'john@gmail.com',invoiceAmount:'240000'},
//     {id: 2,invoiceNumner:'456TYR4',poId:'456GTFN', invoiceDate:'23/07/2025',status:'Inactive',customerName: 'Jane Smith',  customerId: 'jane@gmail.com',invoiceAmount:'245400'},
//     {id: 3,invoiceNumner:'768Gtt4',poId:'7865TYN', invoiceDate:'23/07/2025',status:'Active',customerName: 'Michael Johnson',  customerId: 'michael@gmial.com',invoiceAmount:'439840'},
//     {id: 4,invoiceNumner:'980GGt4',poId:'3402EFH', invoiceDate:'27/07/2025',status:'Inactive',customerName: 'Emily Davis',  customerId: 'emily@gmail.com',invoiceAmount:'240000'},
// ]

// const columns  = [
//     {name:'Sr.No', selector: row => row.id, sortable:false,width:'60px',cell:row=>row.id },
//     {name:'PO Number', selector: row => row.poId, sortable:true},
//     {name:'Customer Name', selector: row => row.customerName, sortable:true},
//     {name: 'Customer Email', selector: row=> row.customerId, sortable:false},
//     {name:'Invoice Number', selector: row => row.invoiceNumner, sortable:true},
//     {name:'Invoice Amount', selector: row => row.invoiceAmount, sortable:true},
//     {name:'Invoice Date', selector: row => row.invoiceDate, sortable:true},
//     {
//       name: 'Status',
//       selector: row => row.status,
//       sortable: false,
//       cell: row => (
//         <span
//           className={`px-2 py-1 rounded text-xs font-semibold 
//           ${row.status === 'Active' ? 'bg-green-100 text-green-900' : 'bg-yellow-100 text-yellow-900'}`}
//         >
//           {row.status}
//         </span>
//       )
//     }
// ]

//   const handleEdit = (row) => {
//     navigate("/CreateInvoice")
//     console.log('Edit', row);
//   };

//   const handleDelete = (row) => {
//     console.log('Delete', row);
//   };

//   const ViewInvoice = (row) => {
//     setPOData({
//         heading:'Customer Details',
//         name:'IOCL limited',
//         email:'Iocllimited@gmail.com',
//         address:'Delhi - 110086',
//         poNumner:'7864635',
//         poAmount:'1400280',
//         poDate:'22/06/2025', 
//         InvoiceNo:'QW7688J'   
//     })
//     setInvoiceData({
//       heading:'Invoice Details',
//       name:'IOCL limited',
//       email:'Iocllimited@gmail.com',
//       invoiceNumber:'QW7688J',
//       invoiceAmount:'1500000',
//       invoiceDate:'28/06/2025',
//     })
//     navigate("/ViewInvoice")
//     console.log('Delete', row);
//   };

//  const permissions = {
//     canEdit: true,
//     canView: true,
//     // canCreateInvoice: true,
//     canDelete:true
//   };
//   return (
//     <div className="max-w-6xl mx-auto mt-5">
//         <HeaderComponent heading={"Invoices"} buttonName={"Invoice List"} icon={<Files/>}/>
//         <ReactDataTable
//         columns={columns}
//         data={data}
//         onEdit={handleEdit}
//         onView={ViewInvoice}
//         onDelete={handleDelete}
        
//         // onCreateInvoice={createInvoice}
//         permissions={permissions}
//         />
//     </div>
//   )
// }

// export default AddInvoice


import React from 'react';
import ReactDataTable from '../../components/DataTableComponent';
import { useNavigate } from 'react-router-dom';
import { usePOContext } from '../../context/POcontext';

const AddInvoice = () => {
  const { setPOData, setInvoiceData } = usePOContext();
  const navigate = useNavigate();
  
  const data = [
    {id: 1, invoiceNumner:'2346YU8', poId:'WE236TG', invoiceDate:'22/07/2025', status:'Active', customerName: 'John Doe', customerId: 'john@gmail.com', invoiceAmount:'240000'},
    {id: 2, invoiceNumner:'456TYR4', poId:'456GTFN', invoiceDate:'23/07/2025', status:'Inactive', customerName: 'Jane Smith', customerId: 'jane@gmail.com', invoiceAmount:'245400'},
    {id: 3, invoiceNumner:'768Gtt4', poId:'7865TYN', invoiceDate:'23/07/2025', status:'Active', customerName: 'Michael Johnson', customerId: 'michael@gmial.com', invoiceAmount:'439840'},
    {id: 4, invoiceNumner:'980GGt4', poId:'3402EFH', invoiceDate:'27/07/2025', status:'Inactive', customerName: 'Emily Davis', customerId: 'emily@gmail.com', invoiceAmount:'240000'},
  ];

  const columns = [
    // {name:'Sr.No', selector: (row, index) => index + 1, sortable:false, width:'70px' },
    {name:'PO Number', selector: row => row.poId, sortable:true},
    {name:'Customer Name', selector: row => row.customerName, sortable:true},
    {name: 'Customer Email', selector: row=> row.customerId, sortable:false},
    {name:'Invoice Number', selector: row => row.invoiceNumner, sortable:true},
    {name:'Invoice Amount', selector: row => row.invoiceAmount, sortable:true, right: true},
    {name:'Invoice Date', selector: row => row.invoiceDate, sortable:true},
    {
      name: 'Status',
      selector: row => row.status,
      sortable: true,
      cell: row => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold 
          ${row.status === 'Active' ? 'bg-green-100 text-green-900' : 'bg-yellow-100 text-yellow-900'}`}
        >
          {row.status}
        </span>
      )
    }
  ];

  const handleEdit = (row) => {
    navigate("/CreateInvoice", { state: { edit: true, invoice: row } });
    console.log('Edit', row);
  };

  const handleDelete = (row) => {
    console.log('Delete', row);
  };

  const ViewInvoice = (row) => {
    setPOData({
      heading:'Customer Details',
      name:'IOCL limited',
      email:'Iocllimited@gmail.com',
      address:'Delhi - 110086',
      poNumner:'7864635',
      poAmount:'1400280',
      poDate:'22/06/2025', 
      InvoiceNo:'QW7688J'  
    });
    setInvoiceData({
      heading:'Invoice Details',
      name:'IOCL limited',
      email:'Iocllimited@gmail.com',
      invoiceNumber:'QW7688J',
      invoiceAmount:'1500000',
      invoiceDate:'28/06/2025',
    });
    navigate("/ViewInvoice");
    console.log('View', row);
  };

 const permissions = {
    edit: 1,
    view: 1,
    delete: 1
  };

  return (
    <div className="max-w-6xl mx-auto">
        {/* Replaced HeaderComponent with a simple heading */}
        <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
        </div>
        <div className="card p-4">
            <ReactDataTable
                columns={columns}
                data={data}
                onEdit={handleEdit}
                onView={ViewInvoice}
                onDelete={handleDelete}
                permissions={permissions}
            />
        </div>
    </div>
  );
}

export default AddInvoice;
