// import React from 'react'
// import HeaderComponent from '../../components/DynamicData/HeaderComponent'
// import {Files,Eye,Download} from 'lucide-react';
// import POCustomerCard from '../../components/DynamicData/POCustomerCard';
// import InvoiceCardData from '../../components/DynamicData/InvoiceCardData';
// import { useNavigate } from 'react-router-dom';
// const ViewInvoice = () => {
//     const navigate = useNavigate();
//     const imageUrl = "/Images/purchase-order.jpg"; 

//     // Open image in new tab
//     const handleView = () => {
//         window.open(imageUrl, "_blank", "noopener,noreferrer");
//     };

//     // Download image
//     const handleDownload = () => {
//         const link = document.createElement("a");
//         link.href = imageUrl;
//         link.download = "PO_IOCL.jpg"; // Change file name if needed
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     };
//   return (
//     <div>
//         <HeaderComponent heading={"View Invoice"} buttonName={"Back to Invoices"} icon={<Files/>} onClick={() => navigate("/AddInvoice")} />
//         <POCustomerCard/>
//         <InvoiceCardData/>
//         <div className='p-4 flex flex-col justify-between w-full border rounded shadow mb-2 mt-5 gap-2 bg-white'>
//                 <div className='text-xl font-bold'>Uploaded Documents</div>
//                 <div className="flex flex-wrap items-center justify-between border-b pb-1">
//                     <span className="font-semibold text-gray-800">
//                         Name:&nbsp;<span className="font-normal">Invoice_IOCL</span>
//                     </span>
//                     <div className="flex gap-8 mt-2 sm:mt-0">
//                         <span className="text-blue-600 cursor-pointer hover:underline" title='View' onClick={handleView}><Eye/></span>
//                         <span className="text-green-600 cursor-pointer hover:underline" title='Download' onClick={handleDownload}><Download/></span>
//                     </div>
//                 </div>

//             </div>
//     </div>
//   )
// }

// export default ViewInvoice


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Download } from 'lucide-react';

import POCustomerCard from '../../components/DynamicData/POCustomerCard';
import InvoiceCardData from '../../components/DynamicData/InvoiceCardData';

const ViewInvoice = () => {
    const navigate = useNavigate();
    const imageUrl = "/Images/purchase-order.jpg"; 

    // Open image in new tab
    const handleView = () => {
        window.open(imageUrl, "_blank", "noopener,noreferrer");
    };

    // Download image
    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = "Invoice_IOCL.jpg"; // Updated file name for context
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-6xl mx-auto">
            
            {/* Replaced HeaderComponent with a simple header and back button */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">View Invoice</h1>
                <button 
                  onClick={() => navigate(-1)} // Navigates to the previous page
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <ArrowLeft size={16} />
                    Back to Invoices
                </button>
            </div>

            <div className="space-y-6">
                <POCustomerCard/>
                <InvoiceCardData/>

                <div className='p-4 flex flex-col justify-between w-full border rounded shadow bg-white'>
                    <div className='text-xl font-bold'>Uploaded Documents</div>
                    <div className="flex flex-wrap items-center justify-between border-b py-2">
                        <span className="font-semibold text-gray-800">
                            Name:&nbsp;<span className="font-normal">Invoice_IOCL</span>
                        </span>
                        <div className="flex items-center gap-8 mt-2 sm:mt-0">
                            <button onClick={handleView} className="flex items-center gap-1 text-blue-600 hover:underline" title='View'>
                                <Eye size={18}/>
                                <span className="text-sm">View</span>
                            </button>
                            <button onClick={handleDownload} className="flex items-center gap-1 text-green-600 hover:underline" title='Download'>
                                <Download size={18}/>
                                <span className="text-sm">Download</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewInvoice;