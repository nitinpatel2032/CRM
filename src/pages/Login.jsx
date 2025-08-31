import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn, Eye, EyeOff, Mail, Lock, X } from 'lucide-react';
import apiService from '../services/apiService';
import { usePermissions } from '../context/PermissionsContext';

const Login = () => {
    const { loadPermissions } = usePermissions();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // State for the password reset modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [isSendingLink, setIsSendingLink] = useState(false);

    useEffect(() => {
        // Clear email field if it has a domain other than '@maxworthsystems.com'
        if (email && !email.endsWith('@maxworthsystems.com')) {
            setEmail('');
        }

        if (resetEmail && !resetEmail.endsWith('@maxworthsystems.com')) {
            setResetEmail('');
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await apiService.login({ email, password });
            const { token, user } = response.data;
            localStorage.setItem('authToken', token);
            localStorage.setItem('currentUser', JSON.stringify(user));

            const permissionsResponse = await apiService.fetchRolePermissions(user.companyId, user.roleId);

            if (!permissionsResponse.data || permissionsResponse.data.length === 0) {
                toast.error('No permissions assigned. Logging out.');
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                navigate('/login');
                return;
            }

            const { permissions } = permissionsResponse.data[0];

            // Call the context function 
            loadPermissions(permissions);

            navigate('/dashboard');
        } catch (error) {
            console.error("Login failed:", error);
            toast.error(error.response?.data?.message || 'Invalid credentials.');
        } finally {
            setLoading(false);
        }
    };
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!resetEmail) {
            toast.error('Please enter your email address.');
            return;
        }
        setIsSendingLink(true);
        try {
            await apiService.sendPasswordResetEmail({ email: resetEmail });
            toast.success('Password reset link sent! Please check your inbox.');
            setIsModalOpen(false);
            setResetEmail('');
        } catch (error) {
            console.error("Password reset failed:", error);
            toast.error(error.response?.data?.message || 'Failed to send reset link.');
        } finally {
            setIsSendingLink(false);
        }
    };

    const handleEmailChange = (e) => {
        const input = e.target;
        const value = input.value;

        // Clear input if domain does not match
        if (!value.endsWith('@maxworthsystems.com') && value.includes('@')) {
            setEmail('');
        } else {
            const username = value.split('@')[0];
            const newValue = `${username}@maxworthsystems.com`;

            setEmail(newValue);

            // Maintain cursor position before the domain
            const cursorPosition = username.length;
            setTimeout(() => input.setSelectionRange(cursorPosition, cursorPosition), 0);
        }
    };

    const handleResetEmailChange = (e) => {
        const input = e.target;
        const value = input.value;

        if (!value.endsWith('@maxworthsystems.com') && value.includes('@')) {
            setResetEmail('');
        } else {
            const username = value.split('@')[0];
            const newValue = `${username}@maxworthsystems.com`;

            setResetEmail(newValue);

            const cursorPosition = username.length;
            setTimeout(() => input.setSelectionRange(cursorPosition, cursorPosition), 0);
        }
    };

    return (
        <>
            <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-gray-100">
                <div className="hidden lg:block relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-90"></div>
                    <img
                        className="absolute inset-0 h-full w-full object-cover"
                        src="/HelpDesk.png"
                        alt="Support System"
                    />
                    <div className="relative p-12 text-white flex flex-col justify-end h-full">
                        <h2 className="text-3xl text-black-900 font-bold hover:text-indigo-400 transition-colors duration-300">Efficient Support, Happy Customers</h2>
                        <p className="mt-4 text-lg opacity-80 hover:text-indigo-400 transition-colors duration-300">Our platform streamlines ticket management to help you resolve issues faster and keep your clients satisfied.</p>
                    </div>
                </div>

                {/* Login Form Panel */}
                <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md space-y-8">
                        <div>
                            <div className='flex gap-4 items-center'>
                                <div className="inline-block bg-indigo-100 p-2 rounded-full">
                                    <LogIn className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                                    Sign in to your account
                                </h2>
                            </div>
                            <p className="mt-2 ml-14 text-sm text-gray-600">
                                Welcome back to the Support Desk
                            </p>
                        </div>
                        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                            <div className="space-y-4">
                                {/* Email Input */}
                                <div>
                                    <label htmlFor="email" className="label-style">Email address</label>
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input id="email" type="text" value={email} onChange={handleEmailChange} className="input-style pl-10" placeholder="you@example.com" required />
                                    </div>
                                </div>
                                {/* Password Input */}
                                <div>
                                    <label htmlFor="password" className="label-style">Password</label>
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input-style pl-10" placeholder="••••••••" required />
                                        <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button type="submit" disabled={loading} className="w-full btn-primary disabled:bg-indigo-400">
                                    {loading ? 'Signing in...' : 'Sign in'}
                                </button>
                            </div>

                            <div className="text-sm text-center">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md relative animate-fade-in-up">
                        <div className='flex justify-between items-center border-b pb-3 mb-4'>
                            <h3 className="text-xl font-bold text-gray-900">Reset Password</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-full hover:bg-gray-100 text-gray-600 flex items-center gap-2"
                            ><X size={20} />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-4">Enter your email and get a link to reset password.</p>
                        <form onSubmit={handlePasswordReset}>
                            <div>
                                <label htmlFor="reset-email" className="label-style">Email address</label>
                                <div className="relative mt-1">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="reset-email"
                                        type="text"
                                        value={resetEmail}
                                        onChange={handleResetEmailChange}
                                        className="input-style pl-10"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end space-x-4">
                                <button type="submit" disabled={isSendingLink || !resetEmail} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSendingLink ? 'Sending...' : 'Send Reset Link'}
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )}
        </>
    );
};

export default Login;