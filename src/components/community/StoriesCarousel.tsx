import React, { useState, useMemo } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { StoryItem, UserStoriesGroup } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CreateStoryModal } from './CreateStoryModal';
import { StoryViewerModal } from './StoryViewerModal';

export const StoriesCarousel: React.FC = () => {
  const { currentUser } = useAuth();
  const { stories } = useData();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);

  // Filter valid stories (within 24 hours)
  const now = Date.now();
  const activeStories = useMemo(() => {
    return stories.filter(
      (story) => !story.expiresAt || new Date(story.expiresAt).getTime() > now
    );
  }, [stories, now]);

  // Group active stories by authorId (Instagram style)
  const storyGroups: UserStoriesGroup[] = useMemo(() => {
    const groupMap = new Map<string, StoryItem[]>();

    activeStories.forEach((story) => {
      const authorId = story.authorId || 'unknown_author';
      const list = groupMap.get(authorId) || [];
      list.push(story);
      groupMap.set(authorId, list);
    });

    const groups: UserStoriesGroup[] = [];
    const currentUid = currentUser?.uid;

    groupMap.forEach((userStories, authorId) => {
      // Sort stories chronologically (oldest first for sequential playback)
      userStories.sort(
        (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );

      const latestStory = userStories[userStories.length - 1];

      // Check if any story in this group has NOT been viewed by the current user
      const hasUnviewed = userStories.some((s) => {
        if (!currentUid) return true;
        if (s.authorId === currentUid) return false;
        const inViewers = (s.viewers || []).some((v) => v.userId === currentUid);
        const inVisualizadores = (s.visualizadores || []).includes(currentUid);
        return !inViewers && !inVisualizadores;
      });

      groups.push({
        authorId,
        authorName: latestStory.authorName || 'Técnico MZ',
        authorRole: latestStory.authorRole,
        authorAvatar: latestStory.authorAvatar,
        authorSpecialty: latestStory.authorSpecialty,
        authorProvince: latestStory.authorProvince,
        authorWhatsapp: latestStory.authorWhatsapp,
        authorPhone: latestStory.authorPhone,
        stories: userStories,
        hasUnviewed,
        latestStoryCreatedAt: latestStory.createdAt
      });
    });

    // Sorting:
    // 1. Current user's group first (if any)
    // 2. Groups with unviewed stories
    // 3. Groups with all viewed stories
    // 4. Secondary sort: latestStoryCreatedAt descending
    groups.sort((a, b) => {
      if (currentUid) {
        if (a.authorId === currentUid) return -1;
        if (b.authorId === currentUid) return 1;
      }
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return new Date(b.latestStoryCreatedAt).getTime() - new Date(a.latestStoryCreatedAt).getTime();
    });

    return groups;
  }, [activeStories, currentUser?.uid]);

  // Permissions: Only Technicians, Companies and Admins can create stories. Clients CANNOT create.
  const canCreateStory =
    currentUser &&
    (currentUser.role === 'technician' ||
      currentUser.role === 'company' ||
      currentUser.role === 'admin' ||
      currentUser.role === 'super_admin');

  // Check if current user already has active stories
  const userHasActiveStories = storyGroups.some((g) => g.authorId === currentUser?.uid);

  return (
    <div className="w-full mb-6" id="stories-carousel-container">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <span>Status & Histórias</span>
            <span className="text-xs font-normal lowercase text-slate-400 font-sans">(24h no Mural)</span>
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {storyGroups.length} {storyGroups.length === 1 ? 'autor ativo' : 'autores ativos'} ({activeStories.length} {activeStories.length === 1 ? 'história' : 'histórias'})
        </span>
      </div>

      {/* Horizontal Carousel */}
      <div className="relative">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
          {/* Add Story Button - STRICTLY FOR TECHNICIANS / COMPANIES / ADMINS */}
          {canCreateStory && (
            <button
              type="button"
              id="btn-create-story"
              onClick={() => setIsCreateOpen(true)}
              className="group relative flex-shrink-0 flex flex-col items-center w-20 sm:w-22 focus:outline-none"
            >
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-slate-800/90 border-2 border-dashed border-blue-500/60 group-hover:border-blue-400 p-0.5 flex flex-col items-center justify-center transition-all group-hover:scale-105 group-hover:bg-slate-800 shadow-md">
                {currentUser?.avatarUrl || currentUser?.photoURL ? (
                  <div className="w-full h-full rounded-full overflow-hidden relative opacity-75 group-hover:opacity-95 transition-opacity">
                    <img
                      src={currentUser.avatarUrl || currentUser.photoURL}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/30" />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-blue-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
              <span className="mt-1.5 text-[11px] font-semibold text-slate-200 group-hover:text-blue-400 text-center truncate w-full">
                {userHasActiveStories ? 'Mais Status' : 'Criar História'}
              </span>
            </button>
          )}

          {/* Grouped Stories: Exactly 1 Circle per Author */}
          {storyGroups.map((group, index) => {
            const isUserAuthor = group.authorId === currentUser?.uid;
            const hasMultiple = group.stories.length > 1;

            return (
              <button
                key={group.authorId}
                type="button"
                id={`story-group-${group.authorId}`}
                onClick={() => setSelectedGroupIndex(index)}
                className="group relative flex-shrink-0 flex flex-col items-center w-20 sm:w-22 focus:outline-none"
              >
                <div
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2.5px] transition-all group-hover:scale-105 shadow-md ${
                    isUserAuthor
                      ? 'bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-600'
                      : group.hasUnviewed
                      ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 animate-pulse'
                      : 'bg-slate-700'
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-slate-950 p-[2px] overflow-hidden relative">
                    {group.authorAvatar ? (
                      <img
                        src={group.authorAvatar}
                        alt={group.authorName}
                        className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-800">
                        {group.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Stories Count Badge (if user has > 1 story) */}
                    {hasMultiple && (
                      <div className="absolute bottom-0 right-0 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-slate-950 shadow">
                        {group.stories.length}
                      </div>
                    )}
                  </div>
                </div>

                <span className="mt-1.5 text-[11px] font-medium text-slate-300 group-hover:text-white text-center truncate w-full">
                  {isUserAuthor ? 'Você' : group.authorName.split(' ')[0]}
                </span>
              </button>
            );
          })}

          {/* Empty state when no stories and user is client */}
          {!canCreateStory && storyGroups.length === 0 && (
            <div className="py-3 px-4 rounded-xl bg-slate-800/40 border border-slate-700/40 text-slate-400 text-xs flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Nenhum status técnico ativo nas últimas 24 horas.</span>
            </div>
          )}
        </div>
      </div>

      {/* Create Story Modal */}
      {isCreateOpen && (
        <CreateStoryModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      )}

      {/* Sequential Story Player Modal (Instagram style) */}
      {selectedGroupIndex !== null && (
        <StoryViewerModal
          groups={storyGroups}
          initialGroupIndex={selectedGroupIndex}
          onClose={() => setSelectedGroupIndex(null)}
        />
      )}
    </div>
  );
};
