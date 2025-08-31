import React from 'react';
import { usePOContext } from '../../context/POcontext';

const POCustomerCard = () => {
  const { poData } = usePOContext();

  if (!poData) return null;
  return (
    <div className="mt-4 bg-white">
      <div className="shadow-md rounded-lg p-4 w-full">
        {/* Title */}
        <div className="font-bold text-xl text-gray-800 text-left mb-1">
         {poData.heading}
        </div>

        {/* Grid details */}
        <div className="grid grid-cols-1 text-sm sm:grid-cols-2 gap-4 text-gray-700">
          <div className="flex justify-between border-b pb-1">
            <span className="font-semibold">Name:</span>
            <span>{poData.name}</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="font-semibold">Project:</span>
            <span>{poData.project}</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="font-semibold">PO Number:</span>
            <span>{poData.poNumber}</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="font-semibold">Email:</span>
            <span>{poData.email}</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="font-semibold">PO Amount:</span>
            <span>{poData.poAmount}</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="font-semibold">Address:</span>
            <span>{poData.address}</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="font-semibold">PO Date:</span>
            <span>{poData.poDate}</span>
          </div>
          {/* <div className="flex justify-between border-b pb-1 w-full sm:w-1/2 sm:col-span-2">
            <span className="font-semibold">Invoice No.:</span>
            <span>{poData.InvoiceNo}</span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default POCustomerCard;
