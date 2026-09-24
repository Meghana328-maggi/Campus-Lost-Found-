import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Send,
  Paperclip,
  CheckCheck,
  Check,
  Search,
  MessageSquare,
  ShieldCheck,
  User,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const targetUserParam = searchParams.get('targetUser');
  const itemIdParam = searchParams.get('itemId');

  const { user } = useAuth();
  const { socket, onlineUsers, setUnreadMessagesCount } = useSocket();
  const { error } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/messages/conversations');
        const convList = res.data.data.conversations || [];
        setConversations(convList);

        // If targetUser specified in query, select or create initial conversation
        if (targetUserParam) {
          const existing = convList.find(
            (c) => c.otherUser?._id?.toString() === targetUserParam
          );
          if (existing) {
            setActiveConversation(existing);
          } else {
            // Load recipient info
            api.get(`/items/${itemIdParam}`).then((itemRes) => {
              const itemObj = itemRes.data.data.item;
              const newConvObj = {
                conversationId: [user._id, targetUserParam].sort().join('_'),
                otherUser: itemObj.owner,
                item: itemObj,
                lastMessage: null,
                unreadCount: 0,
              };
              setActiveConversation(newConvObj);
            }).catch(() => {});
          }
        } else if (convList.length > 0 && !activeConversation) {
          setActiveConversation(convList[0]);
        }
      } catch (err) {
        console.error('[Conversations Error]:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [targetUserParam, itemIdParam]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${activeConversation.conversationId}`);
        setMessages(res.data.data.messages || []);

        // Decrement unread messages
        setUnreadMessagesCount(0);
      } catch (err) {
        console.error('[Messages Fetch Error]:', err);
      }
    };

    fetchMessages();

    // Join conversation room in socket
    if (socket) {
      socket.emit('join_conversation', activeConversation.conversationId);
    }

    return () => {
      if (socket) {
        socket.emit('leave_conversation', activeConversation.conversationId);
      }
    };
  }, [activeConversation, socket]);

  // Socket listeners for new messages & typing
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (
        activeConversation &&
        msg.conversationId === activeConversation.conversationId
      ) {
        setMessages((prev) => [...prev, msg]);
      }

      // Update conversations list lastMessage
      setConversations((prev) =>
        prev.map((c) => {
          if (c.conversationId === msg.conversationId) {
            return {
              ...c,
              lastMessage: {
                text: msg.message,
                createdAt: msg.createdAt,
                sender: msg.sender._id,
                isRead: true,
              },
            };
          }
          return c;
        })
      );
    };

    const handleUserTyping = ({ conversationId }) => {
      if (activeConversation && conversationId === activeConversation.conversationId) {
        setOtherUserTyping(true);
      }
    };

    const handleUserStopTyping = ({ conversationId }) => {
      if (activeConversation && conversationId === activeConversation.conversationId) {
        setOtherUserTyping(false);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_sent', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_sent', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [socket, activeConversation]);

  // Handle typing input
  const handleInputChange = (e) => {
    setNewMessageText(e.target.value);

    if (!socket || !activeConversation) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', {
        conversationId: activeConversation.conversationId,
        receiverId: activeConversation.otherUser?._id,
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_stop', {
        conversationId: activeConversation.conversationId,
        receiverId: activeConversation.otherUser?._id,
      });
    }, 1500);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() && !attachment) return;
    if (!activeConversation) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('receiverId', activeConversation.otherUser._id);
      formData.append('message', newMessageText.trim());
      if (activeConversation.item?._id) {
        formData.append('itemId', activeConversation.item._id);
      }
      if (attachment) {
        formData.append('attachments', attachment);
      }

      await api.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setNewMessageText('');
      setAttachment(null);
    } catch (err) {
      error('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const isOtherUserOnline =
    activeConversation?.otherUser && onlineUsers.has(activeConversation.otherUser._id);

  return (
    <div className="h-[calc(100vh-140px)] min-h-[500px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-md flex overflow-hidden animate-fade-in">
      {/* Left Column: Conversations List (full width on mobile when no conversation is active) */}
      <div
        className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/40 ${
          activeConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Direct Messages</h2>
          <p className="text-xs text-slate-500">Real-time recovery coordination</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {conversations.length > 0 ? (
            conversations.map((conv) => {
              const active = activeConversation?.conversationId === conv.conversationId;
              const online = onlineUsers.has(conv.otherUser?._id);

              return (
                <button
                  key={conv.conversationId}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full p-4 flex items-start gap-3 text-left transition ${
                    active
                      ? 'bg-brand-50/80 dark:bg-brand-950/40'
                      : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
                      {conv.otherUser?.name?.charAt(0) || 'U'}
                    </div>
                    {online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {conv.otherUser?.name || 'Campus Student'}
                      </h4>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {conv.lastMessage?.text || 'Started conversation'}
                    </p>

                    {conv.item && (
                      <span className="inline-block text-[10px] font-semibold text-brand-600 dark:text-brand-400 truncate mt-1">
                        📦 {conv.item.title}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No active conversations yet. Visit an item page to message the finder.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Chat History & Input */}
      {activeConversation ? (
        <div
          className={`flex-1 flex flex-col bg-white dark:bg-slate-900 ${
            !activeConversation ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Chat Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Mobile Back Button to Return to Conversations List */}
              <button
                onClick={() => setActiveConversation(null)}
                className="md:hidden p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                title="Back to conversations"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
                  {activeConversation.otherUser?.name?.charAt(0) || 'U'}
                </div>
                {isOtherUserOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {activeConversation.otherUser?.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isOtherUserOnline ? (
                    <span className="text-emerald-600 font-semibold">● Online</span>
                  ) : (
                    'Offline'
                  )}
                  {activeConversation.otherUser?.college ? ` • ${activeConversation.otherUser.college}` : ''}
                </p>
              </div>
            </div>

            {/* Linked item badge */}
            {activeConversation.item && (
              <Link
                to={`/items/${activeConversation.item._id}`}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline max-w-xs truncate"
              >
                <span className="truncate">Listing: {activeConversation.item.title}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </Link>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isMe = msg.sender?._id?.toString() === user._id.toString();

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-brand-600 text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.message}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((att, idx) => (
                          <img
                            key={idx}
                            src={att.url}
                            alt="Attachment"
                            className="rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90"
                            onClick={() => window.open(att.url, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                      msg.isRead ? <CheckCheck className="w-3.5 h-3.5 text-brand-500" /> : <Check className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </div>
              );
            })}

            {otherUserTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 animate-pulse">
                <span>{activeConversation.otherUser?.name?.split(' ')[0]} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-950/60"
          >
            <label className="p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition">
              <Paperclip className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAttachment(e.target.files[0] || null)}
                className="hidden"
              />
            </label>

            <input
              type="text"
              value={newMessageText}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500 transition"
            />

            <button
              type="submit"
              disabled={sending || (!newMessageText.trim() && !attachment)}
              className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white transition shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center p-8">
          <EmptyState
            icon={MessageSquare}
            title="Select a Conversation"
            description="Choose a conversation from the sidebar or click 'Contact Poster' from an item card."
          />
        </div>
      )}
    </div>
  );
}
