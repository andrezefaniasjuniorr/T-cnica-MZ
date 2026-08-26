import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { TECHNICAL_CATEGORIES, MOZAMBIQUE_PROVINCES } from '../../types';
import {
  MessageSquare,
  Sparkles,
  ThumbsUp,
  Lightbulb,
  Award,
  HelpCircle,
  Share2,
  Phone,
  Send,
  Plus,
  Image as ImageIcon,
  Tag,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Pin,
  Clock,
  User,
  ExternalLink,
  MessageCircle,
  Flame,
  AlertCircle
} from 'lucide-react';

interface CommunityFeedProps {
  onNavigateTab: (tab: string) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ onNavigateTab }) => {
  const { communityPosts, addCommunityPost, togglePostReaction, addPostComment, deleteCommunityPost, startOrGetConversation } = useData();
  const { currentUser, isTechnician, isCompany, isAdmin } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});

  // New Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState(TECHNICAL_CATEGORIES[0]);
  const [newTagInput, setNewTagInput] = useState('');
  const [newTags, setNewTags] = useState<string[]>(['Dica Técnica', 'Moçambique']);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  // Preset sample technical equipment photos
  const PRESET_POST_IMAGES = [
    { label: 'Instalação Solar', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80' },
    { label: 'Quadro Elétrico / QGBT', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80' },
    { label: 'Manutenção / Frio', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80' },
    { label: 'Medição & Instrumentação', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80' }
  ];

  // Handle local image upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert('A foto deve ter no máximo 4MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setUploadedImagePreview(result);
        setNewImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !newTags.includes(newTagInput.trim())) {
      setNewTags([...newTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTags(newTags.filter(t => t !== tagToRemove));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Faça login para publicar no mural técnico.');
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Por favor, preencha o título e o conteúdo da publicação.');
      return;
    }

    const imagesToSave = newImageUrl ? [newImageUrl] : [];

    addCommunityPost({
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      tags: newTags,
      images: imagesToSave
    });

    // Reset
    setNewTitle('');
    setNewContent('');
    setNewImageUrl('');
    setUploadedImagePreview(null);
    setIsCreateModalOpen(false);
  };

  const handleSendComment = (postId: string) => {
    const text = commentText[postId];
    if (!currentUser) {
      alert('Faça login para comentar.');
      return;
    }
    if (!text || !text.trim()) return;

    addPostComment(postId, text);
    setCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  // Filter posts
  const filteredPosts = communityPosts.filter(post => {
    const matchCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.tags && post.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

    return matchCategory && matchSearch;
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'Recentemente';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/5 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-indigo-500/20 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mural Técnico Global • Comunidade de Engenharia & Técnicos MZ</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white">
                Mural dos Técnicos de Moçambique
              </h1>
              <p className="text-xs sm:text-base text-slate-300">
                Compartilhe experiências de campo, esquemas unifilares, dicas de instalação EDM, dúvidas sobre inversores e casos reais em todas as províncias.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Publicar no Mural</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por assunto, técnica, esquema, inversor ou autor..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Todas as Áreas Técnicas</option>
                {TECHNICAL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({communityPosts.length})
            </button>
            {TECHNICAL_CATEGORIES.slice(0, 6).map(cat => {
              const count = communityPosts.filter(p => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800">Nenhuma publicação encontrada</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Seja o primeiro a compartilhar uma experiência técnica, dica de instalação ou dúvida com os profissionais de Moçambique!
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Publicação</span>
              </button>
            </div>
          ) : (
            filteredPosts.map(post => {
              const hasUseful = currentUser && post.reactions.useful?.includes(currentUser.uid);
              const hasInsightful = currentUser && post.reactions.insightful?.includes(currentUser.uid);
              const hasApplause = currentUser && post.reactions.applause?.includes(currentUser.uid);
              const hasQuestion = currentUser && post.reactions.question?.includes(currentUser.uid);

              const usefulCount = post.reactions.useful?.length || 0;
              const insightfulCount = post.reactions.insightful?.length || 0;
              const applauseCount = post.reactions.applause?.length || 0;
              const questionCount = post.reactions.question?.length || 0;
              const totalReactions = usefulCount + insightfulCount + applauseCount + questionCount;

              const isPostAuthor = currentUser && currentUser.uid === post.authorId;
              const canDelete = isPostAuthor || isAdmin;

              const isCommentOpen = activeCommentPostId === post.id;

              return (
                <article
                  key={post.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                    post.pinned ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
                  }`}
                >
                  {/* Pinned badge */}
                  {post.pinned && (
                    <div className="bg-amber-500/10 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-amber-800 text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <Pin className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
                        <span>Publicação Técnica em Destaque pela Moderação</span>
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-amber-700">Verificado</span>
                    </div>
                  )}

                  <div className="p-6 sm:p-8 space-y-5">
                    {/* Author Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {post.authorAvatar ? (
                            <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-black text-base">
                              {post.authorName.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-black text-slate-900">{post.authorName}</h3>
                            {post.authorRole === 'super_admin' && (
                              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black">
                                Super Admin
                              </span>
                            )}
                            {post.authorRole === 'technician' && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Técnico Certificado
                              </span>
                            )}
                            {post.authorRole === 'company' && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black">
                                Empresa
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                            {post.authorSpecialty && (
                              <span className="font-semibold text-slate-600">{post.authorSpecialty}</span>
                            )}
                            <span>•</span>
                            <span>📍 {post.authorProvince}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {formatDate(post.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Top actions: Category badge & Delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                          {post.category}
                        </span>

                        {canDelete && (
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir esta publicação?')) {
                                deleteCommunityPost(post.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Excluir Publicação"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="space-y-3">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Tag className="w-3 h-3 text-slate-400" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Post Images Gallery */}
                    {post.images && post.images.length > 0 && (
                      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-96">
                        <img
                          src={post.images[0]}
                          alt={post.title}
                          className="w-full h-full object-cover max-h-96 hover:scale-[1.01] transition duration-200"
                        />
                      </div>
                    )}

                    {/* Action Bar (Reactions, Comments, WhatsApp Contact) */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      {/* Technical Reaction Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        {/* 1. Useful / Prático */}
                        <button
                          onClick={() => togglePostReaction(post.id, 'useful')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                            hasUseful
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 font-black'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                          title="Marcar como Útil / Prático"
                        >
                          <Lightbulb className={`w-3.5 h-3.5 ${hasUseful ? 'fill-amber-500 text-amber-600' : 'text-slate-500'}`} />
                          <span>Útil</span>
                          {usefulCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.2 bg-white/80 rounded-full text-[10px]">
                              {usefulCount}
                            </span>
                          )}
                        </button>

                        {/* 2. Insightful / Técnico */}
                        <button
                          onClick={() => togglePostReaction(post.id, 'insightful')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                            hasInsightful
                              ? 'bg-blue-100 text-blue-800 border border-blue-300 font-black'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                          title="Insight Técnico de Engenharia"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${hasInsightful ? 'text-blue-600' : 'text-slate-500'}`} />
                          <span>Técnico</span>
                          {insightfulCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.2 bg-white/80 rounded-full text-[10px]">
                              {insightfulCount}
                            </span>
                          )}
                        </button>

                        {/* 3. Applause / Parabéns */}
                        <button
                          onClick={() => togglePostReaction(post.id, 'applause')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                            hasApplause
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-black'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                          title="Excelente Trabalho / Parabéns"
                        >
                          <Award className={`w-3.5 h-3.5 ${hasApplause ? 'text-emerald-600' : 'text-slate-500'}`} />
                          <span>Excelente</span>
                          {applauseCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.2 bg-white/80 rounded-full text-[10px]">
                              {applauseCount}
                            </span>
                          )}
                        </button>

                        {/* 4. Question / Dúvida */}
                        <button
                          onClick={() => togglePostReaction(post.id, 'question')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                            hasQuestion
                              ? 'bg-purple-100 text-purple-800 border border-purple-300 font-black'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                          title="Tenho uma dúvida sobre isso"
                        >
                          <HelpCircle className={`w-3.5 h-3.5 ${hasQuestion ? 'text-purple-600' : 'text-slate-500'}`} />
                          <span>Dúvida</span>
                          {questionCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.2 bg-white/80 rounded-full text-[10px]">
                              {questionCount}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Right: Comments Toggle & Direct Contact */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveCommentPostId(isCommentOpen ? null : post.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                          <span>Comentários ({post.commentsCount || 0})</span>
                        </button>

                        {post.authorWhatsapp && (
                          <a
                            href={`https://wa.me/${(post.authorWhatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Olá ${post.authorName}, vi a sua publicação no Mural Técnico da TécnicaMZ ("${post.title}") e gostaria de conversar.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                            title="Conversar no WhatsApp"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Expandable Comments Section */}
                    {isCommentOpen && (
                      <div className="pt-4 border-t border-slate-100 space-y-4 bg-slate-50/70 p-4 rounded-2xl">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Discussão Técnica & Respostas ({post.comments?.length || 0})
                        </h4>

                        {/* Comments list */}
                        {post.comments && post.comments.length > 0 ? (
                          <div className="space-y-3">
                            {post.comments.map(comment => (
                              <div key={comment.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-slate-900">{comment.authorName}</span>
                                    {comment.authorSpecialty && (
                                      <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-semibold">
                                        {comment.authorSpecialty}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400">{formatDate(comment.createdAt)}</span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                                  {comment.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            Nenhum comentário ainda. Partilhe sua opinião técnica!
                          </p>
                        )}

                        {/* Add Comment Input */}
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            value={commentText[post.id] || ''}
                            onChange={e => setCommentText({ ...commentText, [post.id]: e.target.value })}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSendComment(post.id);
                            }}
                            placeholder={currentUser ? 'Escreva uma resposta técnica ou dica...' : 'Faça login para comentar'}
                            disabled={!currentUser}
                            className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={() => handleSendComment(post.id)}
                            disabled={!currentUser || !commentText[post.id]?.trim()}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Responder</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Criar Publicação Técnica */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black">Nova Publicação no Mural dos Técnicos MZ</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título da Publicação Técnica *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ex: Como evitar sobreaquecimento em inversores Deye no clima de Tete"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Área Técnica / Especialidade
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"
                  >
                    {TECHNICAL_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Adicionar Tags Técnicas
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={e => setNewTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Ex: Inversor 5kVA, EDM"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags Display */}
              {newTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {newTags.map(tag => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold flex items-center gap-1"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500 ml-1 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Conteúdo Técnico & Recomendações *
                </label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Descreva o procedimento técnico, normas de segurança aplicadas, cálculos, desafios enfrentados no local e soluções práticas..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:bg-white leading-relaxed"
                  required
                />
              </div>

              {/* Photo Upload or Preset selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Foto ou Esquema Técnico (Opcional)
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span>Carregar Foto do Dispositivo / Câmera</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>

                  <span className="text-xs text-slate-400 font-semibold">ou escolha um modelo:</span>
                </div>

                {/* Preset Thumbnails */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {PRESET_POST_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewImageUrl(preset.url);
                        setUploadedImagePreview(preset.url);
                      }}
                      className={`p-1.5 rounded-xl border text-left transition flex items-center gap-2 ${
                        newImageUrl === preset.url
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-[10px] font-bold text-slate-700 truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>

                {/* Preview */}
                {uploadedImagePreview && (
                  <div className="relative mt-2 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-48">
                    <img src={uploadedImagePreview} alt="Preview" className="w-full h-full object-cover max-h-48" />
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImagePreview(null);
                        setNewImageUrl('');
                      }}
                      className="absolute top-2 right-2 px-2 py-1 bg-slate-900/80 text-white rounded-lg text-xs font-bold"
                    >
                      Remover Foto
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition flex items-center gap-2 shadow-md shadow-indigo-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar no Mural</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
