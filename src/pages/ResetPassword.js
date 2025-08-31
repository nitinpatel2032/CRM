import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import apiService from '../services/apiService';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';

const ResetPassword = () => {
    const location = useLocation();
    const token = new URLSearchParams(location.search).get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await apiService.resetPassword({ token, newPassword: password });
            toast.success('Password has been reset successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            console.error("Failed to reset password:", error);
            toast.error(error.response?.data?.message || 'Invalid or expired token.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg space-y-8 animate-fade-in-up">
                <div>
                    <div className='flex gap-4 items-center'>
                        <div className="inline-block bg-indigo-100 p-2 rounded-full">
                            <KeyRound className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                            Create a New Password
                        </h2>
                    </div>
                    <p className="mt-2 ml-14 text-sm text-gray-600">
                        Your new password must be different from previous ones.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="label-style">New Password</label>
                            <div className="relative mt-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-style pl-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <PasswordStrengthMeter password={password} />
                        </div>

                        <div>
                            <label htmlFor="confirm-password" className="label-style">Confirm New Password</label>
                            <div className="relative mt-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirm-password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-style pl-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading || !password || !confirmPassword}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;