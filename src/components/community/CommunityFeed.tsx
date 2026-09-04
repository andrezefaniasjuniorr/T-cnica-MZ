import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { TECHNICAL_CATEGORIES, MOZAMBIQUE_PROVINCES } from '../../types';
import { StoriesCarousel } from './StoriesCarousel';
import { SeloMZModal } from '../common/SeloMZModal';
import { compressImageToDataUrl } from '../../utils/imageUpload';
import { soundFX } from '../../utils/audio';
import { UserRankBadge } from '../../utils/gamification';
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
  AlertCircle,
  Loader2
} from 'lucide-react';

interface CommunityFeedProps {
  onNavigateTab: (tab: string) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ onNavigateTab }) => {
  const {
    communityPosts,
    technicians,
    addCommunityPost,
    togglePostReaction,
    addPostComment,
    deleteCommunityPost,
    toggleCommunityCommentLike,
    deleteCommunityComment,
    markAcceptedSolution,
    markCommentAsUseful,
    startOrGetConversation
  } = useData();
  const { currentUser, isTechnician, isCompany, isAdmin, temSeloMZ } = useAuth();

  const getAuthorPoints = (authorId?: string) => {
    if (!authorId) return 0;
    if (currentUser && currentUser.uid === authorId) {
      return currentUser.pontos ?? currentUser.scoreEngajamento ?? 0;
    }
    const tech = technicians?.find(t => t.userId === authorId);
    return tech?.pontos ?? tech?.scoreEngajamento ?? 0;
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSeloModalOpen, setIsSeloModalOpen] = useState<boolean>(false);
  const [seloFeatureName, setSeloFeatureName] = useState<string>('Publicações no Mural');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<{ [postId: string]: { id: string; authorName: string } | null }>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<{ [postId: string]: boolean }>({});

  // New Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<string>(TECHNICAL_CATEGORIES[0]);
  const [newTagInput, setNewTagInput] = useState('');
  const [newTags, setNewTags] = useState<string[]>(['Dica Técnica', 'Moçambique']);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  const [isCompressingPostImage, setIsCompressingPostImage] = useState(false);

  // Preset sample technical equipment photos
  const PRESET_POST_IMAGES = [
    { label: 'Instalação Solar', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80' },
    { label: 'Quadro Elétrico / QGBT', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80' },
    { label: 'Manutenção / Frio', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80' },
    { label: 'Medição & Instrumentação', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80' }
  ];

  // Handle local image upload with Canvas client-side compression
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressingPostImage(true);
      try {
        const compressedDataUrl = await compressImageToDataUrl(file, 800, 800, 0.6);
        setUploadedImagePreview(compressedDataUrl);
        setNewImageUrl(compressedDataUrl);
      } catch (err) {
        console.error('Erro ao comprimir foto:', err);
        alert('Erro ao processar imagem. Tente outra foto.');
      } finally {
        setIsCompressingPostImage(false);
      }
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

  const handleOpenCreatePost = () => {
    if (!currentUser) {
      alert('Faça login para publicar no mural técnico.');
      return;
    }
    if ((isTechnician || isCompany) && !temSeloMZ && !isAdmin) {
      setSeloFeatureName('Publicações no Mural Técnico');
      setIsSeloModalOpen(true);
      return;
    }
    soundFX.playModalOpen();
    setIsCreateModalOpen(true);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Faça login para publicar no mural técnico.');
      return;
    }
    if ((isTechnician || isCompany) && !temSeloMZ && !isAdmin) {
      setIsCreateModalOpen(false);
      setSeloFeatureName('Publicações no Mural Técnico');
      setIsSeloModalOpen(true);
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

    // Sound effect on post creation
    soundFX.playPost();

    // Reset
    setNewTitle('');
    setNewContent('');
    setNewImageUrl('');
    setUploadedImagePreview(null);
    setIsCreateModalOpen(false);
  };

  const handleSendComment = async (postId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = commentText[postId];
    if (!currentUser) {
      alert('Faça login para comentar.');
      return;
    }
    if ((isTechnician || isCompany) && !temSeloMZ && !isAdmin) {
      setSeloFeatureName('Respostas e Comentários no Mural');
      setIsSeloModalOpen(true);
      return;
    }
    if (!text || !text.trim() || isSubmittingComment[postId]) return;

    const reply = replyingTo[postId];
    setIsSubmittingComment(prev => ({ ...prev, [postId]: true }));

    try {
      const result = await addPostComment(postId, text, reply?.id, reply?.authorName);
      if (result?.success !== false) {
        // Sound effect on successful comment submission
        soundFX.playComment();

        // Limpar o campo e o reply apenas após confirmação
        setCommentText(prev => ({ ...prev, [postId]: '' }));
        setReplyingTo(prev => ({ ...prev, [postId]: null }));
      } else {
        alert(result?.error || 'Erro ao publicar comentário.');
      }
    } catch (err: any) {
      console.error('Erro ao enviar comentário:', err);
      alert(err?.message || 'Falha ao enviar comentário.');
    } finally {
      setIsSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Filter posts
  const filteredPosts = communityPosts.filter(post => {
    const matchCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const term = (searchTerm || '').toLowerCase().trim();
    const matchSearch =
      !term ||
      (post.title || '').toLowerCase().includes(term) ||
      (post.content || '').toLowerCase().includes(term) ||
      (post.authorName || '').toLowerCase().includes(term) ||
      (post.tags && post.tags.some(t => (t || '').toLowerCase().includes(term)));

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
    <div className="min-h-screen bg-slate-900/5 py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Hero / Slogan Banner - Image Occupies Entire Banner without Obstruction */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-indigo-500/20 bg-slate-950 group">
          <img
            src="/tecnica_mz_slogan.jpg"
            alt="Técnica MZ - Comunidade Técnica de Moçambique"
            className="w-full h-40 sm:h-52 md:h-64 object-cover object-center"
            referrerPolicy="no-referrer"
          />
          {/* Subtle gradient only at bottom-right corner for high-contrast compact action */}
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-2">
            <button
              onClick={handleOpenCreatePost}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-blue-600/90 hover:bg-blue-600 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-900/40 active:scale-95 cursor-pointer backdrop-blur-md border border-white/20"
              title="Criar nova publicação no mural"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              <span>Publicar no Mural</span>
            </button>
          </div>
        </div>

        {/* Responsive Desktop Grid (Feed + Side Widgets) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Main Feed Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stories / Status 24h Carousel */}
            <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl">
              <StoriesCarousel />
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
                            <img src={post.authorAvatar} alt={post.authorName || 'Usuário'} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-black text-base">
                              {(post.authorName || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-black text-slate-900">{post.authorName || 'Usuário'}</h3>
                            <UserRankBadge points={getAuthorPoints(post.authorId)} size="xs" />
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

                      {/* Top actions: Category badge, Solution badge & Delete */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {post.solucaoAceita && (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300 flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Solução Aceita</span>
                          </span>
                        )}

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
                          onClick={() => {
                            soundFX.playLike();
                            togglePostReaction(post.id, 'useful');
                          }}
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
                          onClick={() => {
                            soundFX.playLike();
                            togglePostReaction(post.id, 'insightful');
                          }}
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
                          onClick={() => {
                            soundFX.playLike();
                            togglePostReaction(post.id, 'applause');
                          }}
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
                          onClick={() => {
                            soundFX.playLike();
                            togglePostReaction(post.id, 'question');
                          }}
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
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Discussão Técnica & Respostas ({post.comments?.length || 0})</span>
                          </h4>
                          {replyingTo[post.id] && (
                            <span className="text-[11px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              Respondendo a @{replyingTo[post.id]?.authorName}
                              <button
                                onClick={() => setReplyingTo(prev => ({ ...prev, [post.id]: null }))}
                                className="ml-1 text-indigo-500 hover:text-indigo-900 font-black"
                              >
                                ✕
                              </button>
                            </span>
                          )}
                        </div>

                        {/* Comments list */}
                        {post.comments && post.comments.length > 0 ? (
                          <div className="space-y-3">
                            {post.comments.map(comment => {
                              const isCommentAuthor = currentUser && currentUser.uid === comment.authorId;
                              const isPostOwner = comment.authorId === post.authorId;
                              const hasLikedComment = currentUser && comment.likes?.includes(currentUser.uid);
                              const canDeleteComment = isCommentAuthor || isPostAuthor || isAdmin;
                              const isAcceptedSolution = Boolean(
                                comment.solucaoAceita ||
                                (post.comentarioSolucaoId && post.comentarioSolucaoId === comment.id)
                              );
                              const canMarkSolution = (isPostAuthor || isAdmin) && !isAcceptedSolution;

                              return (
                                <div
                                  key={comment.id}
                                  className={`p-3.5 rounded-xl transition-all space-y-2 ${
                                    isAcceptedSolution
                                      ? 'bg-emerald-50/70 border-2 border-emerald-500 ring-2 ring-emerald-200 shadow-md'
                                      : 'bg-white border border-slate-200 shadow-2xs'
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-black text-slate-900">{comment.authorName || 'Usuário'}</span>
                                      <UserRankBadge points={getAuthorPoints(comment.authorId)} size="xs" />
                                      {isAcceptedSolution && (
                                        <span className="text-[10px] px-2.5 py-0.5 bg-emerald-600 text-white rounded-full font-black flex items-center gap-1 shadow-xs animate-pulse">
                                          <CheckCircle2 className="w-3 h-3 text-white" />
                                          ✔ Solução Oficial
                                        </span>
                                      )}
                                      {isPostOwner && (
                                        <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-black border border-amber-200 flex items-center gap-1">
                                          ★ Autor da Publicação
                                        </span>
                                      )}
                                      {comment.authorSpecialty && !isPostOwner && (
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

                                  {/* Comment Footer: Like, Reply, Accept Solution, Delete */}
                                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                      {/* Like comment */}
                                      <button
                                        onClick={() => {
                                          soundFX.playLike();
                                          toggleCommunityCommentLike(post.id, comment.id);
                                        }}
                                        className={`flex items-center gap-1 font-bold transition px-2 py-0.5 rounded-lg ${
                                          hasLikedComment
                                            ? 'text-rose-600 bg-rose-50'
                                            : 'text-slate-500 hover:text-rose-600 hover:bg-slate-50'
                                        }`}
                                      >
                                        <ThumbsUp className="w-3 h-3" />
                                        <span>{comment.likes?.length || 0}</span>
                                      </button>

                                      {/* Reply */}
                                      <button
                                        onClick={() => {
                                          setReplyingTo(prev => ({
                                            ...prev,
                                            [post.id]: { id: comment.id, authorName: comment.authorName }
                                          }));
                                          setCommentText(prev => ({
                                            ...prev,
                                            [post.id]: `@${comment.authorName} `
                                          }));
                                        }}
                                        className="text-slate-500 hover:text-indigo-600 font-bold transition flex items-center gap-1"
                                      >
                                        <span>↩ Responder</span>
                                      </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {/* Mark Useful Comment Button (+5 pts) */}
                                      {canMarkSolution && (
                                        <button
                                          onClick={async () => {
                                            soundFX.playSuccess();
                                            await markCommentAsUseful(
                                              post.id,
                                              post.authorId,
                                              comment.id,
                                              comment.authorId,
                                              currentUser?.uid || ''
                                            );
                                          }}
                                          className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black flex items-center gap-1 transition shadow-2xs active:scale-95 cursor-pointer"
                                          title="Parabenizar e marcar comentário como Útil (+5 pts e badge ao autor)"
                                        >
                                          <span>💡</span>
                                          <span>Útil (+5 pts)</span>
                                        </button>
                                      )}

                                      {/* Mark Accepted Solution Button */}
                                      {canMarkSolution && (
                                        <button
                                          onClick={() => {
                                            markAcceptedSolution(post.id, comment.id);
                                          }}
                                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[10px] font-black flex items-center gap-1 transition shadow-2xs active:scale-95 cursor-pointer"
                                          title="Marcar este comentário como a Solução Oficial (+50 pontos ao autor)"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>Aceitar Solução (+50 pts)</span>
                                        </button>
                                      )}

                                      {canDeleteComment && (
                                        <button
                                          onClick={() => {
                                            if (confirm('Excluir este comentário?')) {
                                              deleteCommunityComment(post.id, comment.id);
                                            }
                                          }}
                                          className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                                          title="Excluir comentário"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            Nenhum comentário ainda. Seja o primeiro a comentar ou esclarecer uma dúvida técnica!
                          </p>
                        )}

                        {/* Add Comment Input Form */}
                        <form
                          onSubmit={(e) => handleSendComment(post.id, e)}
                          className="flex items-center gap-2 pt-2"
                        >
                          <input
                            type="text"
                            value={commentText[post.id] || ''}
                            onChange={e => setCommentText({ ...commentText, [post.id]: e.target.value })}
                            placeholder={currentUser ? (replyingTo[post.id] ? `Respondendo a @${replyingTo[post.id]?.authorName}...` : 'Escreva uma resposta técnica ou dica...') : 'Faça login para comentar'}
                            disabled={!currentUser || isSubmittingComment[post.id]}
                            className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                          />
                          <button
                            type="submit"
                            disabled={!currentUser || !commentText[post.id]?.trim() || isSubmittingComment[post.id]}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
                          >
                            {isSubmittingComment[post.id] ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>A enviar...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>{replyingTo[post.id] ? 'Enviar Resposta' : 'Comentar'}</span>
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
            </div>
          </div>

          {/* Desktop Right Sidebar Column (Hidden on mobile, visible on lg) */}
          <aside className="hidden lg:block lg:col-span-4 space-y-5 sticky top-20">
            {/* Widget 0: Ranking da Bancada / Gamificação */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Ranking da Bancada</span>
                </div>
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  TOP PONTOS
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Técnicos com mais soluções aceitas e pontuações acumuladas:
              </p>
              <div className="space-y-2">
                {[...technicians]
                  .sort((a, b) => ((b.points ?? b.pontos ?? b.scoreEngajamento ?? 0) - (a.points ?? a.pontos ?? a.scoreEngajamento ?? 0)))
                  .slice(0, 4)
                  .map((tech, idx) => {
                    const techPoints = tech.points ?? tech.pontos ?? tech.scoreEngajamento ?? 0;
                    const stars = tech.stars ?? Math.min(5, Math.floor(techPoints / 200));
                    return (
                      <div
                        key={tech.userId || idx}
                        onClick={() => onNavigateTab('technicians_directory')}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition cursor-pointer border border-slate-100"
                        title="Ver técnico no diretório"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                            idx === 0 ? 'bg-amber-400 text-slate-950 shadow-2xs' :
                            idx === 1 ? 'bg-slate-300 text-slate-800' :
                            idx === 2 ? 'bg-amber-700 text-white' :
                            'bg-slate-200 text-slate-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate">{tech.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] select-none text-amber-500 font-bold" title={`${stars}/5 estrelas`}>
                                {'⭐'.repeat(stars)}
                              </span>
                              <UserRankBadge points={techPoints} size="xs" />
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-black text-blue-600 shrink-0">
                          {techPoints} pts
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Widget 1: Official Emergency & EDM Contacts */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Piquetes & Emergências MZ</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Linhas diretas para corte de corrente e segurança no trabalho:
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="font-bold text-amber-900">⚡ Piquete EDM (Linha Verde)</span>
                  <span className="font-black text-amber-950 font-mono">1455</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-xl border border-red-200">
                  <span className="font-bold text-red-900">🚒 Bombeiros Moçambique</span>
                  <span className="font-black text-red-950 font-mono">198</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="font-bold text-blue-900">💧 FIPAG / Águas</span>
                  <span className="font-black text-blue-950 font-mono">800 240 240</span>
                </div>
              </div>
            </div>

            {/* Widget 2: Quick Engineering Calculators */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-black text-sm text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Ferramentas Rápidas</span>
              </div>
              <p className="text-xs text-slate-300">
                Acesse o prumo giroscópico, dimensionamento solar e cálculo de condutores EDM.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onNavigateTab('tools')}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-left transition"
                >
                  📐 Nível de Parede
                </button>
                <button
                  onClick={() => onNavigateTab('tools')}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-left transition"
                >
                  ☀️ Solar PV
                </button>
                <button
                  onClick={() => onNavigateTab('tools')}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-left transition"
                >
                  ⚡ Queda Tensão
                </button>
                <button
                  onClick={() => onNavigateTab('market')}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-left transition"
                >
                  🛍️ Mercado MZ
                </button>
              </div>
            </div>

            {/* Widget 3: WhatsApp Support & Community */}
            <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Suporte Técnico Oficial MZ</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Dúvidas técnicas, credenciação e auditoria de perfis:
              </p>
              <a
                href="https://wa.me/258851949159"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp: 851949159</span>
              </a>
            </div>
          </aside>
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
                  disabled={isCompressingPostImage}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition flex items-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCompressingPostImage ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Comprimindo foto...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Publicar no Mural</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selo MZ Blocking Modal */}
      <SeloMZModal
        isOpen={isSeloModalOpen}
        onClose={() => setIsSeloModalOpen(false)}
        onGoToSeloSettings={() => {
          setIsSeloModalOpen(false);
          onNavigateTab('settings');
        }}
        featureName={seloFeatureName}
      />
    </div>
  );
};
