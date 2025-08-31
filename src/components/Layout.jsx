import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, FolderKanban, LogOut, FileText, UserPlus, Building, Menu, Ticket, ShieldCheck, ArrowLeft, ArrowUp, BookText, Files } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePermissions } from '../context/PermissionsContext';

const Layout = ({ children }) => {
    const { permissions } = usePermissions();
    const pagePermissions = permissions || {};
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // --- State and Ref for Floating Buttons ---
    const [showScrollTop, setShowScrollTop] = useState(false);
    const mainContentRef = useRef(null);


    const appVersion = process.env.REACT_APP_VERSION || '1.0.0';
    const currentYear = new Date().getFullYear();

    // --- Handlers for Floating Buttons ---
    const handleGoBack = () => navigate(-1);
    const handleScrollToTop = () => {
        mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = () => {
        localStorage.clear();
        toast.success('Logged out successfully!');
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const hasAnyPermission = (pageName) => {
        const permissionsForPage = pagePermissions[pageName];
        if (!permissionsForPage) {
            return false;
        }
        return Object.values(permissionsForPage).some(permissionValue => permissionValue === 1);
    };

    const navLinkClasses = "flex items-center px-4 py-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-200 group";
    const activeNavLinkClasses = "bg-indigo-100 text-indigo-600 font-semibold border-l-4 border-indigo-500";

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white text-slate-800">
            {/* Sidebar Header */}
            <div className="items-center justify-center gap-3 h-18 border-b shadow-sm px-4">
                <h1 className="mt-2 text-xl font-bold text-center tracking-wider text-indigo-600">Support Desk</h1>
                <p className="m-1 text-xs font-semibold text-center text-indigo-700">{currentUser?.company}</p>
            </div>

            {/* Navigation - scrollable */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                {hasAnyPermission('Dashboard') && (
                    <NavLink to="/dashboard" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} end>
                        <Home className="w-5 h-5 mr-3" /> Dashboard
                    </NavLink>
                )}
                {hasAnyPermission('Tickets') && (
                    <NavLink to="/tickets" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                        <Ticket className="w-5 h-5 mr-3" /> Tickets
                    </NavLink>
                )}
                <NavLink to="/AddPO" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                    <Files className="w-5 h-5 mr-3" /> POs
                </NavLink>
                <NavLink to="/AddInvoice" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                    <BookText className="w-5 h-5 mr-3" /> Invoices
                </NavLink>
                {hasAnyPermission('Projects') && (
                    <NavLink to="/projects" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                        <FolderKanban className="w-5 h-5 mr-3" /> Projects
                    </NavLink>
                )}
                {hasAnyPermission('Users') && (
                    <NavLink to="/create-user" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                        <UserPlus className="w-5 h-5 mr-3" /> Users
                    </NavLink>
                )}
                <NavLink to="/ticket-report" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                    <FileText className="w-5 h-5 mr-3" /> Ticket Report
                </NavLink>
                {hasAnyPermission('Companies') && (
                    <NavLink to="/companies" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                        <Building className="w-5 h-5 mr-3" /> Companies
                    </NavLink>
                )}
                {hasAnyPermission('Permissions') && (
                    <NavLink to="/permissions" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
                        <ShieldCheck className="w-5 h-5 mr-3" /> Permissions
                    </NavLink>
                )}
            </nav>

            {/* Sidebar Footer / User Profile - stays pinned bottom */}
            <div className="p-2 border-t">
                {currentUser && (
                    <div className="flex items-center gap-3 p-2 mb-1 rounded-lg bg-slate-50">
                        <div className="flex items-center justify-center w-8 h-8 font-bold text-white bg-indigo-500 rounded-full">
                            {getInitials(currentUser.name)}
                        </div>
                        <div className="flex-grow">
                            <p className="font-bold text-slate-800 break-all">{currentUser.name}</p>
                            <p className="text-xs text-slate-500">{currentUser.role}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="flex items-center justify-start w-full gap-3 px-3 py-2 text-left text-slate-500 rounded-lg transition-colors hover:bg-red-100 hover:text-red-600"
                >
                    <LogOut className="w-5 h-5" /> Logout
                </button>

                <div className="mt-1 text-center text-xs text-slate-400 border-t pt-1 bg-slate-50">
                    <p>v{appVersion} &copy; {currentYear} {currentUser?.company || 'Maxworth Electronic Systems Pvt. Ltd'}</p>
                </div>
            </div>
        </div>
    );


    return (
        <div className="flex h-screen bg-slate-50">
            {/* --- Desktop Sidebar --- */}
            <aside className="hidden lg:flex lg:flex-shrink-0 w-60 border-r border-slate-200 shadow-md">
                <SidebarContent />
            </aside>

            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ease-in-out
                    ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
                }
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-shrink-0 transform shadow-xl
                    transition-transform duration-300 ease-in-out lg:hidden
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
                }
            >
                <SidebarContent />
            </aside>


            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden flex justify-between items-center bg-white border-b border-slate-200 shadow-sm p-4">
                    <h1 className="text-xl font-bold text-indigo-600">Support Desk</h1>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md text-slate-500 hover:bg-slate-100">
                        <Menu size={24} />
                    </button>
                </header>

                {/* Main content scroll area */}
                <main ref={mainContentRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>

                {/* --- Floating Action Buttons --- */}
                <div className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-3">
                    <button
                        onClick={handleGoBack}
                        title="Go Back"
                        className="flex items-center justify-center w-10 h-10 bg-gray-700/50 text-white rounded-full shadow-lg hover:bg-gray-500 transition-all duration-300 ease-in-out transform hover:scale-110"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    {showScrollTop && (
                        <button
                            onClick={handleScrollToTop}
                            title="Move to Top"
                            className="flex items-center justify-center w-10 h-10 bg-indigo-600/50 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-110"
                        >
                            <ArrowUp size={20} />
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Layout;