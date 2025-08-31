export const getStatusBadge = (status) => {
    switch (status) {
        case 'Open': return 'bg-blue-100 text-blue-800';
        case 'In Progress': return 'bg-yellow-100 text-yellow-800';
        case 'Resolved': return 'bg-green-100 text-green-800';
        case 'Reopened': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export const calculateResolutionTime = (complaintTimeStr, updatedAtStr, status) => {
    if (status !== 'Resolved' || !complaintTimeStr || !updatedAtStr) {
        return '---';
    }
    const complaintTime = new Date(complaintTimeStr);
    const updatedAt = new Date(updatedAtStr);

    if (isNaN(complaintTime.getTime()) || isNaN(updatedAt.getTime()) || updatedAt < complaintTime) {
        return '---';
    }

    let diff = updatedAt.getTime() - complaintTime.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes >= 0) result += `${minutes}m`;

    return result.trim() === '0m' ? 'Instant' : result.trim();
};