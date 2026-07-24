import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MessageCircle, Heart, Send, Trash2, Edit2, X, MoreVertical, Paperclip, Share2, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToasts } from '../context/ToastContext';

const appId = 'portfolio-tracker-pro';

export function CommunityTimeline({ user, brandColor }: { user: any, brandColor: string }) {
  const { addToast } = useToasts();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [subCommentContent, setSubCommentContent] = useState('');

  const [largeAttachments, setLargeAttachments] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    const postsRef = collection(db, 'artifacts', appId, 'community_posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(data);
    });
    
    return () => unsubscribe();
  }, [user]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      addToast("File is too large", "Please select a file under 10MB.", "error");
      return;
    }

    setAttachmentName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    if ((!newPost.trim() && !attachment) || !user) return;
    const id = generateId();
    const postRef = doc(db, 'artifacts', appId, 'community_posts', id);
    
    const currentNewPost = newPost;
    const currentAttachment = attachment;
    const currentAttachmentName = attachmentName;

    setNewPost('');
    setAttachment(null);
    setAttachmentName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      let attachmentRefId = null;
      let chunksCount = 0;
      if (currentAttachment && currentAttachment.length > 800000) {
        attachmentRefId = generateId();
        const chunks = currentAttachment.match(/.{1,800000}/g) || [];
        chunksCount = chunks.length;
        for (let i = 0; i < chunks.length; i++) {
          await setDoc(doc(db, 'artifacts', appId, 'community_attachments', `${attachmentRefId}_${i}`), {
            data: chunks[i],
            index: i,
            total: chunks.length
          });
        }
      }

      await setDoc(postRef, {
        text: currentNewPost.trim(),
        attachment: currentAttachment && currentAttachment.length <= 800000 ? currentAttachment : null,
        attachmentRefId: attachmentRefId || null,
        attachmentChunks: chunksCount || null,
        attachmentName: currentAttachmentName || null,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        authorPhoto: user.photoURL || null,
        createdAt: new Date().toISOString(),
        likes: [],
        comments: []
      });
    } catch (e: any) {
      console.error(e);
      addToast("Error", "Failed to create post. Please try again.", "error");
      setNewPost(currentNewPost);
      setAttachment(currentAttachment);
      setAttachmentName(currentAttachmentName);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'community_posts', id));
      addToast("Deleted", "Post has been deleted.", "success");
    } catch (error) {
      addToast("Error", "Failed to delete post.", "error");
    }
  };

  const handleUpdatePost = async (id: string) => {
    if (!editContent.trim()) return;
    await updateDoc(doc(db, 'artifacts', appId, 'community_posts', id), {
      text: editContent.trim()
    });
    setEditingPost(null);
  };

  const handleToggleLike = async (post: any) => {
    if (!user) return;
    const postRef = doc(db, 'artifacts', appId, 'community_posts', post.id);
    const hasLiked = post.likes?.includes(user.uid);
    if (hasLiked) {
      await updateDoc(postRef, {
        likes: arrayRemove(user.uid)
      });
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(user.uid)
      });
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentContent.trim() || !user) return;
    const postRef = doc(db, 'artifacts', appId, 'community_posts', postId);
    const newComment = {
      id: generateId(),
      text: commentContent.trim(),
      authorId: user.uid,
      authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      authorPhoto: user.photoURL || null,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: []
    };
    await updateDoc(postRef, {
      comments: arrayUnion(newComment)
    });
    setCommentContent('');
    setCommentingOn(null);
  };

  const handleToggleCommentLike = async (post: any, commentId: string) => {
    if (!user) return;
    const postRef = doc(db, 'artifacts', appId, 'community_posts', post.id);
    const updatedComments = post.comments.map((c: any) => {
      if (c.id === commentId) {
        const likes = c.likes || [];
        const hasLiked = likes.includes(user.uid);
        return { ...c, likes: hasLiked ? likes.filter((id: string) => id !== user.uid) : [...likes, user.uid] };
      }
      return c;
    });
    await updateDoc(postRef, { comments: updatedComments });
  };

  const handleAddSubComment = async (post: any, parentCommentId: string) => {
    if (!subCommentContent.trim() || !user) return;
    const postRef = doc(db, 'artifacts', appId, 'community_posts', post.id);
    const newSubComment = {
      id: generateId(),
      text: subCommentContent.trim(),
      authorId: user.uid,
      authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      authorPhoto: user.photoURL || null,
      createdAt: new Date().toISOString()
    };
    const updatedComments = post.comments.map((c: any) => {
      if (c.id === parentCommentId) {
        return { ...c, replies: [...(c.replies || []), newSubComment] };
      }
      return c;
    });
    await updateDoc(postRef, { comments: updatedComments });
    setSubCommentContent('');
    setReplyingTo(null);
  };

  const loadLargeAttachment = async (attachmentRefId: string, total: number) => {
    try {
      let fullData = '';
      for (let i = 0; i < total; i++) {
        const docSnap = await getDoc(doc(db, 'artifacts', appId, 'community_attachments', `${attachmentRefId}_${i}`));
        if (docSnap.exists()) {
          fullData += docSnap.data().data;
        }
      }
      setLargeAttachments(prev => ({ ...prev, [attachmentRefId]: fullData }));
    } catch (e) {
      addToast("Error", "Failed to load attachment.", "error");
    }
  };

  const handleDeleteComment = async (post: any, commentId: string) => {
    const postRef = doc(db, 'artifacts', appId, 'community_posts', post.id);
    const updatedComments = post.comments.filter((c: any) => c.id !== commentId);
    try {
      await updateDoc(postRef, { comments: updatedComments });
      addToast("Deleted", "Comment deleted successfully.", "success");
    } catch (e) {
      addToast("Error", "Failed to delete comment.", "error");
    }
  };

  const handleDeleteSubComment = async (post: any, parentCommentId: string, replyId: string) => {
    const postRef = doc(db, 'artifacts', appId, 'community_posts', post.id);
    const updatedComments = post.comments.map((c: any) => {
      if (c.id === parentCommentId) {
        return { ...c, replies: (c.replies || []).filter((r: any) => r.id !== replyId) };
      }
      return c;
    });
    try {
      await updateDoc(postRef, { comments: updatedComments });
      addToast("Deleted", "Reply deleted successfully.", "success");
    } catch (e) {
      addToast("Error", "Failed to delete reply.", "error");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
      }
    } catch (e) {}
    return dateStr;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Create Post Area */}
      <div className="bg-white dark:bg-[#121212] p-4 md:p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
        <div className="flex gap-3 md:gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 shrink-0 overflow-hidden flex items-center justify-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-slate-500 dark:text-zinc-400">
                {user?.email?.[0].toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share an update or ask the community..."
              className="w-full bg-transparent border-none outline-none resize-none min-h-[60px] text-sm md:text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500"
            />
            
            {attachment && (
              <div className="relative inline-block mt-2">
                {attachment.startsWith('data:image/') ? (
                  <img src={attachment} alt="attachment" className="max-h-32 rounded-lg border border-black/10 dark:border-white/10" />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10 text-sm">
                    <Paperclip size={16} className="text-slate-500" />
                    <span className="text-slate-700 dark:text-zinc-300 truncate max-w-[200px]">{attachmentName}</span>
                  </div>
                )}
                <button 
                  onClick={() => { setAttachment(null); setAttachmentName(null); if(fileInputRef.current) fileInputRef.current.value=''; }}
                  className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1 shadow-md hover:bg-slate-700 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            
            <div className="flex justify-between items-center border-t border-black/5 dark:border-white/5 pt-3 mt-3">
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*,.pdf,.doc,.docx"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-zinc-200 dark:hover:bg-white/5 transition-all"
                  title="Add Attachment (Max 500KB)"
                >
                  <Paperclip size={18} />
                </button>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={!newPost.trim() && !attachment}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 hover:scale-[1.02] active:scale-95"
                style={{ backgroundColor: brandColor }}
              >
                <Send size={14} />
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4 md:space-y-6">
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#121212] p-4 md:p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm space-y-4"
            >
              {/* Post Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                    {post.authorPhoto ? (
                      <img src={post.authorPhoto} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-slate-500 dark:text-zinc-400">
                        {post.authorName?.[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{post.authorName}</h4>
                    <span className="text-xs text-slate-400 dark:text-zinc-500">{formatDate(post.createdAt)}</span>
                  </div>
                </div>

                {/* Post Actions (Edit/Delete) */}
                {user?.uid === post.authorId && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingPost(post.id);
                        setEditContent(post.text);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-zinc-200 dark:hover:bg-white/5 transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Post Content */}
              {editingPost === post.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 outline-none min-h-[80px] text-sm text-slate-900 dark:text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingPost(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdatePost(post.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-1.5"
                      style={{ backgroundColor: brandColor }}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm md:text-base text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap break-all">
                    {post.text}
                  </p>
                  {post.attachmentRefId && !post.attachment && !largeAttachments[post.attachmentRefId] && (
                    <button 
                      onClick={() => loadLargeAttachment(post.attachmentRefId, post.attachmentChunks)} 
                      className="text-xs font-bold transition-all px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10"
                      style={{ color: brandColor }}
                    >
                      Load large attachment ({post.attachmentName})
                    </button>
                  )}
                  {(post.attachment || largeAttachments[post.attachmentRefId]) && (
                    <div className="mt-3">
                      {(() => {
                        const att = post.attachment || largeAttachments[post.attachmentRefId];
                        if (att.startsWith('data:image/')) {
                          return <img src={att} alt="post attachment" className="max-h-64 rounded-xl border border-black/5 dark:border-white/5 shadow-sm object-contain" />;
                        } else {
                          return <a href={att} download={post.attachmentName} className="inline-flex items-center gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10 text-sm hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                            <Paperclip size={16} className="text-slate-500" />
                            <span className="text-slate-700 dark:text-zinc-300 font-medium">{post.attachmentName || 'Attachment'}</span>
                          </a>;
                        }
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Interaction Bar */}
              <div className="flex items-center gap-4 pt-2 border-t border-black/5 dark:border-white/5">
                <button
                  onClick={() => handleToggleLike(post)}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-all ${post.likes?.includes(user?.uid) ? 'text-rose-500' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  <Heart size={16} className={post.likes?.includes(user?.uid) ? 'fill-rose-500' : ''} />
                  <span>{post.likes?.length || 0}</span>
                </button>
                
                <button
                  onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition-all"
                >
                  <MessageCircle size={16} />
                  <span>{post.comments?.length || 0}</span>
                </button>

                <button
                  onClick={() => {
                    const url = `${window.location.origin}${window.location.pathname}?post=${post.id}`;
                    navigator.clipboard.writeText(url);
                    addToast("Link copied", "Post link copied to clipboard!", "success");
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition-all ml-auto"
                >
                  <Share2 size={16} />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {commentingOn === post.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-4 overflow-hidden"
                  >
                    {/* Comment Input */}
                    <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                          {user?.photoURL ? (
                            <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                              {user?.email?.[0].toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                            placeholder="Write a comment..."
                            className="flex-1 bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-full px-4 py-1.5 text-sm outline-none focus:ring-1 transition-all text-slate-900 dark:text-white"
                            style={{ '--tw-ring-color': brandColor } as any}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!commentContent.trim()}
                            className="p-1.5 rounded-full text-white transition-all disabled:opacity-50 shrink-0 h-8 w-8 flex items-center justify-center"
                            style={{ backgroundColor: brandColor }}
                          >
                            <Send size={12} />
                          </button>
                        </div>
                    </div>

                    {/* Comment List */}
                    <div className="space-y-4 pl-11">
                      {post.comments?.map((comment: any) => (
                        <div key={comment.id} className="space-y-1.5">
                          <div className="bg-slate-50/50 dark:bg-white/[0.02] p-3 rounded-2xl rounded-tl-sm text-sm group relative">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">{comment.authorName}</span>
                                <span className="text-[10px] text-slate-400 dark:text-zinc-500">{formatDate(comment.createdAt)}</span>
                              </div>
                              {user?.uid === comment.authorId && (
                                <button 
                                  onClick={() => handleDeleteComment(post, comment.id)}
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-500 transition-all"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                            <p className="text-slate-700 dark:text-zinc-300 whitespace-pre-wrap break-all">{comment.text}</p>
                          </div>
                          
                          <div className="flex items-center gap-3 px-2">
                            <button
                              onClick={() => handleToggleCommentLike(post, comment.id)}
                              className={`flex items-center gap-1 text-[10px] font-bold transition-all ${comment.likes?.includes(user?.uid) ? 'text-rose-500' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'}`}
                            >
                              <Heart size={12} className={comment.likes?.includes(user?.uid) ? 'fill-rose-500' : ''} />
                              <span>{comment.likes?.length || 0}</span>
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(replyingTo === comment.id ? null : comment.id);
                                if (replyingTo !== comment.id) setSubCommentContent('');
                              }}
                              className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition-all"
                            >
                              Reply
                            </button>
                          </div>
                          
                          {/* Replies */}
                          {(comment.replies?.length > 0 || replyingTo === comment.id) && (
                            <div className="pl-6 space-y-2 pt-1 border-l-2 border-slate-100 dark:border-white/5 ml-3">
                              {comment.replies?.map((reply: any) => (
                                <div key={reply.id} className="bg-slate-50/30 dark:bg-white/[0.01] p-2.5 rounded-2xl rounded-tl-sm text-sm group relative">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 dark:text-white text-xs">{reply.authorName}</span>
                                      <span className="text-[9px] text-slate-400 dark:text-zinc-500">{formatDate(reply.createdAt)}</span>
                                    </div>
                                    {user?.uid === reply.authorId && (
                                      <button 
                                        onClick={() => handleDeleteSubComment(post, comment.id, reply.id)}
                                        className="p-1 rounded-md text-slate-400 hover:text-rose-500 transition-all"
                                      >
                                        <Trash2 size={10} />
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-slate-700 dark:text-zinc-300 text-xs whitespace-pre-wrap break-all">{reply.text}</p>
                                </div>
                              ))}
                              
                              {replyingTo === comment.id && (
                                <div className="flex gap-2 pt-1">
                                  <input
                                    type="text"
                                    value={subCommentContent}
                                    onChange={(e) => setSubCommentContent(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleAddSubComment(post, comment.id);
                                    }}
                                    placeholder="Write a reply..."
                                    className="flex-1 bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-full px-3 py-1.5 text-xs outline-none focus:ring-1 transition-all text-slate-900 dark:text-white"
                                    style={{ '--tw-ring-color': brandColor } as any}
                                  />
                                  <button
                                    onClick={() => handleAddSubComment(post, comment.id)}
                                    disabled={!subCommentContent.trim()}
                                    className="p-1 rounded-full text-white transition-all disabled:opacity-50 shrink-0 h-7 w-7 flex items-center justify-center"
                                    style={{ backgroundColor: brandColor }}
                                  >
                                    <Send size={10} />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          {posts.length === 0 && (
             <div className="py-12 text-center text-slate-500 dark:text-zinc-400">
               <MessageCircle size={32} className="mx-auto mb-3 opacity-20" />
               <p className="font-medium">No posts yet. Be the first to share!</p>
             </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
