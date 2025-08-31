import React from 'react';
import { Send, Paperclip, CheckCircle, RotateCcw, User, X } from 'lucide-react';
import { formatDateTime, formatDateForInput } from '../../utils/formatters';

const ActivityTimeline = ({ ticketStatus, activityLog, userBgColors, userTextColors, newComment, setNewComment, newCommentTimestamp, setNewCommentTimestamp, complaintAt, newAttachment, setNewAttachment, handleFileChange, handleAddComment, getCommentAttachments, onAttachmentClick }) => {

    const truncateName = (name, maxLen = 12) => {
        if (!name) return '';
        const extMatch = name.match(/\.(pdf|jpg|png|jpeg|gif|docx?|xlsx?|pptx?|js?|jsx?|css?)$/i);
        if (extMatch) {
            if (name.length <= maxLen) return name;
            const ext = extMatch[0];
            const base = name.slice(0, -ext.length);
            return base.slice(0, 8) + '..' + ext;
        }
        const parts = name.trim().split(" ");
        if (parts.length === 2) {
            const fullName = parts.join(" ");
            if (fullName.length <= maxLen) return fullName;
            const firstName = parts[0];
            const lastInitial = parts[1][0];
            return `${firstName.slice(0, 8)}... ${lastInitial}`;
        }
        if (parts.length === 1) {
            const word = parts[0];
            if (word.length <= maxLen) return word;
            return word.slice(0, 8) + '..';
        }
        const fullName = parts.join(" ");
        if (fullName.length <= maxLen) return fullName;
        const firstName = parts[0];
        const lastInitial = parts[parts.length - 1][0];
        return `${firstName.slice(0, 8)}... ${lastInitial}`;
    };

    return (
        <div className="card-style sticky top-4 bg-white rounded-lg shadow-sm overflow-hidden">
            <h3 className="h3-style">Activity</h3>
            <div className="p-4">
                {ticketStatus !== 'Resolved' && (
                    <div className='mb-4 space-y-3'>
                        <div className="relative">
                            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} rows="2" className="input-style w-full" placeholder="Add a comment..." />
                        </div>

                        <div className='flex items-center justify-between text-xs gap-2'>
                            <div>
                                <label htmlFor="comment-timestamp" className="sr-only">Comment Time</label>
                                <input
                                    type="datetime-local"
                                    id="comment-timestamp"
                                    value={newCommentTimestamp}
                                    min={complaintAt ? formatDateForInput(complaintAt) : ''}
                                    max={formatDateForInput(new Date())}
                                    onChange={(e) => setNewCommentTimestamp(e.target.value)}
                                    className="input-style w-full"
                                    required
                                />
                            </div>
                            <div>
                                {!newAttachment && <label htmlFor="comment-attachment" className="font-medium text-indigo-600 hover:text-indigo-500 bg-indigo-100 p-1.5 rounded cursor-pointer inline-flex items-center gap-1"><Paperclip size={14} /> Attach File</label>}
                                <input id="comment-attachment" type="file" className="sr-only" onChange={handleFileChange} />
                                {newAttachment && (
                                    <div className="inline-flex items-center gap-2 text-green-600 p-1.5 bg-green-100 rounded ml-2">
                                        <p>{truncateName(newAttachment.name)}</p>
                                        <button
                                            type="button"
                                            onClick={() => setNewAttachment(null)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-0.5 rounded-full"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleAddComment}
                                disabled={!newComment || !newCommentTimestamp}
                                className="btn-primary py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={14} /> Post
                            </button>
                        </div>
                    </div>
                )}
                <div className="flow-root max-h-[100vh] overflow-y-auto pr-2">
                    <ul className="-mb-6">
                        {activityLog.map((item, index) => {
                            const isLast = index === activityLog.length - 1;
                            const timelineLine = !isLast && <span className="absolute top-5 left-4 -ml-px h-full w-0.5 bg-gradient-to-b from-gray-200 to-gray-200/0" aria-hidden="true" />;

                            if (item.type === 'status') {
                                const isResolved = item.data.status === 'Resolved';
                                const Icon = isResolved ? CheckCircle : RotateCcw;
                                const colors = isResolved ? 'bg-green-500 text-white' : 'bg-amber-500 text-white';
                                return <li key={item.id}><div className="relative pb-6">{timelineLine}<div className="relative flex items-start space-x-3"><div className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-gray-50 ${colors}`}><Icon size={17} /></div><div className="min-w-0 flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm text-gray-600 pt-1.5"><span className="font-semibold text-gray-800">{truncateName(item.data.author_name)}</span> marked as <span className="font-semibold">{item.data.status}</span></p>
                                        <div className="text-xs text-gray-500 pt-1.5 whitespace-nowrap">
                                            <span>{formatDateTime(item.timestamp)}</span>
                                        </div>
                                    </div>
                                    {item.data.remarks && (
                                        <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-200">
                                            <p className="whitespace-pre-wrap">{item.data.remarks}</p>
                                        </div>
                                    )}
                                </div></div></div></li>
                            }

                            if (item.type === 'comment') {
                                const comment = item.data;
                                return <li key={item.id}><div className="relative pb-6">{timelineLine}<div className="relative flex items-start space-x-3"><div><div className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-gray-50 ${userBgColors.get(comment.author_name)?.split(' ')[0]}`}><User className={`h-4 w-4 ${userTextColors.get(comment.author_name)}`} /></div></div><div className="min-w-0 flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className={`font-semibold text-sm ${userTextColors.get(comment.author_name)}`}>{truncateName(comment.author_name)}</p>
                                        <div className="text-xs text-gray-500 whitespace-nowrap">
                                            <span>{formatDateTime(item.timestamp)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-1 text-sm text-gray-800 bg-white p-2 rounded-md rounded-tl-none border border-gray-200 flex items-start justify-between">
                                        <span className='whitespace-pre-wrap'>{comment.comment_text}</span>
                                        {getCommentAttachments(comment.id).length > 0 &&
                                            <span className="inline-flex items-center gap-1 ml-2">
                                                {getCommentAttachments(comment.id).map(att => {
                                                    const handleIconClick = (e) => {
                                                        e.preventDefault();
                                                        onAttachmentClick(att);
                                                    };
                                                    return (
                                                        <button
                                                            key={att.id}
                                                            onClick={handleIconClick}
                                                            title={att.file_name}
                                                            className="p-1 rounded hover:bg-indigo-100 text-indigo-700"
                                                            style={{ lineHeight: 0 }}
                                                            type="button"
                                                        >
                                                            <Paperclip size={16} />
                                                        </button>
                                                    );
                                                })}
                                            </span>
                                        }
                                    </div>
                                </div></div></div></li>
                            }
                            return null;
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ActivityTimeline;