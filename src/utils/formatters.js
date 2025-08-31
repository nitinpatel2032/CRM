export const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '---';
    return new Date(dateTimeString).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

export const formatDateForInput = (date) => {
    if (!date) return '';

    // Ensure 'd' is a valid Date object
    const d = date instanceof Date ? date : new Date(date);

    // Check for invalid date
    if (isNaN(d.getTime())) {
        console.error("Invalid date provided to formatDateForInput:", date);
        return '';
    }

    const pad = (num) => num.toString().padStart(2, '0');

    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};