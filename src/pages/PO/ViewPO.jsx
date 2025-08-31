import React, { useState, useEffect } from 'react';
import { X, Eye, Download } from 'lucide-react';
import POCustomerCard from '../../components/DynamicData/POCustomerCard';

export const ViewPO = ({ poData, onClose }) => {
  const [existingAttachment, setExistingAttachment] = useState(null);

  useEffect(() => {
    if (poData?.fileName && poData?.fileData) {
      const byteArray = new Uint8Array(poData.fileData.data);
      let binary = '';
      byteArray.forEach(byte => (binary += String.fromCharCode(byte)));
      const base64 = window.btoa(binary);

      // Always PDF in your case
      const mimeType = 'application/pdf';

      setExistingAttachment({
        name: poData.fileName,
        url: `data:${mimeType};base64,${base64}`
      });
    }
  }, [poData]);

  const handleView = () => {
    if (existingAttachment?.url) {
      window.open(existingAttachment.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = () => {
    if (existingAttachment?.url) {
      const link = document.createElement('a');
      link.href = existingAttachment.url;
      link.download = existingAttachment.name || `PO_${poData?.poNumber || 'download'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!poData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Selected PO Details</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div>
          <POCustomerCard poData={poData} />

          {existingAttachment && (
            <div className="p-4 flex flex-col justify-between w-full border rounded shadow mt-5 gap-2 bg-white">
              <div className="text-xl font-bold">Uploaded Documents</div>
              <div className="flex flex-wrap items-center justify-between border-b pb-1">
                <span className="font-semibold text-gray-800">
                  Name:&nbsp;<span className="font-normal">{existingAttachment.name}</span>
                </span>
                <div className="flex gap-8 mt-2 sm:mt-0">
                  <span
                    className="text-blue-600 cursor-pointer hover:underline"
                    title="View"
                    onClick={handleView}
                  >
                    <Eye />
                  </span>
                  <span
                    className="text-green-600 cursor-pointer hover:underline"
                    title="Download"
                    onClick={handleDownload}
                  >
                    <Download />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
