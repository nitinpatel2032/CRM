// Add new loadPermission function it always render permission before the layout rendering
import React, { createContext, useContext, useState, useEffect } from 'react';

const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
    const [permissions, setPermissions] = useState({});

    // This useEffect still runs once on initial load to get stored data
    useEffect(() => {
        const storedPermissions = localStorage.getItem('rolePermissions');
        if (storedPermissions) {
            try {
                setPermissions(JSON.parse(storedPermissions));
            } catch (err) {
                console.error('Failed to parse stored permissions:', err);
                setPermissions({});
            }
        }
    }, []);

    // function to be called on login
    const loadPermissions = (newPermissions) => {
        localStorage.setItem('rolePermissions', JSON.stringify(newPermissions));
        setPermissions(newPermissions); // This triggers the re-render
    };
    
    // function to be called on logout
    const clearPermissions = () => {
        localStorage.removeItem('rolePermissions');
        setPermissions({});
    };

    const can = (module, action) => {
        return permissions?.[module]?.[action] === 1;
    };

    // Expose the new functions through the provider's value
    return (
        <PermissionsContext.Provider value={{ permissions, can, loadPermissions, clearPermissions }}>
            {children}
        </PermissionsContext.Provider>
    );
};

export const usePermissions = () => useContext(PermissionsContext);