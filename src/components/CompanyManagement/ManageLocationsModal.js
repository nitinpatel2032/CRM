import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Trash2, Power, SquarePen } from 'lucide-react';
import apiService from '../../services/apiService';
import { ConfirmationModal, StatusConfirmationModal } from '../ConfirmationModal';

export const ManageLocationsModal = ({ company, closeModal, onLocationsUpdated }) => {
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newLocation, setNewLocation] = useState('');
    const [locationToDelete, setLocationToDelete] = useState(null);
    const [locationToChangeStatus, setLocationToChangeStatus] = useState(null);
    const [locationToEdit, setLocationToEdit] = useState(null);
    const [updatedLocationName, setUpdatedLocationName] = useState('');

    const loadLocations = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.fetchProjectAddresses(company.id);
            setLocations(response.data.data);
        } catch (error) {
            console.error("Failed to fetch locations", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadLocations(); }, [company.id]);

    const handleAddLocation = async () => {
        if (!newLocation.trim()) return toast.error("Location name is required.");
        try {
            const response = await apiService.addProjectAddress(company.id, { location_name: newLocation });
            if (response.data.success === 1) {
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
            setNewLocation('');
            loadLocations();
            onLocationsUpdated();
        } catch (error) { console.error("Failed to add location", error); }
    };

    const handleConfirmDelete = async () => {
        if (!locationToDelete) return;
        try {
            const response = await apiService.deleteProjectAddress({ id: locationToDelete.id });
            if (response.data.success === 1) {
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
            setLocationToDelete(null);
            loadLocations();
            onLocationsUpdated();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete location.");
            setLocationToDelete(null);
        }
    };

    const handleConfirmStatusChange = async () => {
        if (!locationToChangeStatus) return;
        try {
            const newStatus = locationToChangeStatus?.isActive === 1 ? 0 : 1;
            const response = await apiService.changeProjectAddressStatus({ id: locationToChangeStatus.id, status: newStatus });
            if (response.data.success === 1) {
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
            setLocationToChangeStatus(null);
            loadLocations();
            onLocationsUpdated();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update location status.");
            setLocationToChangeStatus(null);
        }
    };

    const handleUpdateLocation = async () => {
        if (!locationToEdit || !updatedLocationName.trim()) return toast.error("Updated location name is required.");
        try {
            await apiService.updateProjectAddress({ id: locationToEdit.id, location_name: updatedLocationName });
            toast.success("Location updated successfully!");
            setLocationToEdit(null);
            setUpdatedLocationName('');
            loadLocations();
            onLocationsUpdated();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update location.");
            setLocationToEdit(null);
            setUpdatedLocationName('');
        }
    };

    const [searchTerm, setSearchTerm] = useState('');

    // Ensure `locations` is treated as an array in all instances
    const filteredLocations = (Array.isArray(locations) ? locations : []).filter(loc =>
        loc.location_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalLocations = Array.isArray(locations) ? locations.length : 0; // Ensure robust handling of total locations

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4">
                    <div className="flex justify-between items-center border-b pb-3">
                        <h3 className="text-lg font-medium text-gray-800">Locations for <span className="font-medium text-yellow-600 underline">{company.name}</span></h3>
                        <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-100 text-gray-600"><X size={20} /></button>
                    </div>
                    <div className="mt-2">
                        <h4 className="label-style mb-2">Existing Locations : <span className='font-medium text-gray-800'>
                            {searchTerm.trim() ? `Match found: ${filteredLocations?.length} out of ${totalLocations}` : totalLocations}
                        </span></h4>
                        <input
                            type="text"
                            className="input-style mb-2"
                            placeholder="Search Locations..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {isLoading ? <p>Loading...</p> : filteredLocations.length > 0 ? (
                            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {filteredLocations.map(loc => (
                                    <li key={loc.id} className="flex items-center justify-between bg-gray-50 px-3 py-1 rounded-md">
                                        <span>{loc.location_name}</span>
                                        <div className="flex gap-1 justify-end">
                                            {loc.isActive === 1 && (
                                                <button
                                                    onClick={() => { setLocationToEdit(loc); setUpdatedLocationName(loc.location_name); }}
                                                    className='p-2 rounded-full text-blue-600 hover:bg-blue-100'
                                                >
                                                    <SquarePen size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setLocationToChangeStatus(loc)}
                                                className={`p-2 rounded-full ${loc.isActive === 1 ? 'text-yellow-600 hover:bg-yellow-100' : 'text-gray-400 hover:bg-gray-200'}`}
                                            >
                                                <Power size={16} />
                                            </button>
                                            <button
                                                onClick={() => setLocationToDelete(loc)}
                                                className="p-2 rounded-full hover:bg-red-100 text-red-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-gray-500">No project locations added.</p>}
                    </div>
                    <div className="mt-2 border-t pt-2">
                        <label htmlFor="location-input" className="label-style">Add New Location</label>
                        <div className="flex gap-2 mt-1">
                            <input id="location-input" type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="input-style w-full" placeholder="New Location Name" />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-4">
                        <button onClick={handleAddLocation} disabled={!newLocation.trim()} className="btn-primary disabled:opacity-50">Add</button>
                        <button onClick={closeModal} className="btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>
            <ConfirmationModal isOpen={!!locationToDelete} onClose={() => setLocationToDelete(null)} onConfirm={handleConfirmDelete} title="Delete Location" message={`Delete "${locationToDelete?.location_name}"? This may affect projects using this location.`} />
            <StatusConfirmationModal isOpen={!!locationToChangeStatus} onClose={() => setLocationToChangeStatus(null)} onConfirm={handleConfirmStatusChange} title="Change Location Status" message={`Change status for "${locationToChangeStatus?.location_name}"?`} />
            {locationToEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Edit Location</h3>
                        <input type="text" value={updatedLocationName} onChange={(e) => setUpdatedLocationName(e.target.value)} className="input-style w-full mb-4" placeholder="Updated Location Name" />
                        <div className="flex justify-end gap-4">
                            <button onClick={handleUpdateLocation} className="btn-primary">Update</button>
                            <button onClick={() => { setLocationToEdit(null); setUpdatedLocationName(''); }} className="btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};