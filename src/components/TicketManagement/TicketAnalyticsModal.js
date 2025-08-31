import React from 'react';
import { X } from 'lucide-react';
import { TicketAnalytics } from './TicketAnalytics';

export const TicketAnalyticsModal = ({ onClose, tickets }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center border-b pb-2 mb-3">
                <h2 className="text-xl font-bold text-gray-800">Ticket Analytics</h2>
                <button onClick={onClose} className='p-1 rounded-full hover:bg-gray-100 text-gray-600'><X size={20} /></button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
                <TicketAnalytics tickets={tickets} />
            </div>
            <div className="flex-shrink-0 flex justify-end pt-2 mt-4 border-t">
                <button type="button" onClick={onClose} className="btn-secondary">Close</button>
            </div>
        </div>
    </div>
);