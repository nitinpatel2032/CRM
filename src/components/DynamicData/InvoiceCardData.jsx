import React from 'react'
import { usePOContext } from '../../context/POcontext';
const InvoiceCardData = () => {
  const { invoiceData } = usePOContext();
  
    if (!invoiceData) return null;
    return (
      <div className="mt-4 bg-white">
        <div className="shadow-md rounded-lg p-4 w-full">
          {/* Title */}
          <div className="font-bold text-xl text-gray-800 text-left mb-2">
           {invoiceData.heading}
          </div>
  
          {/* Grid details */}
          <div className="grid grid-cols-1 text-sm sm:grid-cols-2 gap-6 text-gray-700">
            {/* <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Name:</span>
              <span>{invoiceData.name}</span>
            </div> */}
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Invoice Number:</span>
              <span>{invoiceData.invoiceNumber}</span>
            </div>
            {/* <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Email:</span>
              <span>{invoiceData.email}</span>
            </div> */}
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Invoice Amount:</span>
              <span>{invoiceData.invoiceAmount}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Invoice Date:</span>
              <span>{invoiceData.invoiceDate}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default InvoiceCardData