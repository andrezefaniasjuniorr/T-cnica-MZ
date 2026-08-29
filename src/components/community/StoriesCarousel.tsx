import React, { useState } from 'react';
import { Plus, Sparkles, Image as ImageIcon } from 'lucide-react';
import { StoryItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CreateStoryModal } from './CreateStoryModal';
import { StoryViewerModal } from './StoryViewerModal';

export const StoriesCarousel: React.FC = () => {
  const { currentUser } = useAuth();
  const { stories } = useData();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  // Filter valid stories (within 24 hours)
  const now = Date.now();
  const activeStories = stories.filter(
    (story) => !story.expiresAt || new Date(story.expiresAt).getTime() > now
  );

  // Permissions: Only Technicians, Companies and Admins can create stories. Clients CANNOT create.
  const canCreateStory =
    currentUser &&
    (currentUser.role === 'technician' ||
      currentUser.role === 'company' ||
      currentUser.role === 'admin' ||
      currentUser.role === 'super_admin');

  // Check if current user already has active stories
  const userActiveStories = activeStories.filter((s) => s.authorId === currentUser?.uid);

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <span>Status & Histórias</span>
            <span className="text-xs font-normal lowercase text-slate-400 font-sans">(24h no Mural)</span>
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {activeStories.length} {activeStories.length === 1 ? 'disponível' : 'disponíveis'}
        </span>
      </div>

      {/* Horizontal Carousel */}
      <div className="relative">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
          {/* Add Story Button - STRICTLY FOR TECHNICIANS / COMPANIES / ADMINS */}
          {canCreateStory && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="group relative flex-shrink-0 flex flex-col items-center w-20 sm:w-22 focus:outline-none"
            >
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-800/90 border-2 border-dashed border-blue-500/50 group-hover:border-blue-400 p-0.5 flex flex-col items-center justify-center transition-all group-hover:scale-105 group-hover:bg-slate-800 shadow-md">
                {currentUser.avatarUrl ? (
                  <div className="w-full h-full rounded-xl overflow-hidden relative opacity-70 group-hover:opacity-90 transition-opacity">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/40" />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-xl bg-slate-800 flex items-center justify-center text-blue-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                )}
                <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
              <span className="mt-1.5 text-[11px] font-semibold text-slate-200 group-hover:text-blue-400 text-center truncate w-full">
                {userActiveStories.length > 0 ? 'Mais Status' : 'Criar História'}
              </span>
            </button>
          )}

          {/* Active Stories List */}
          {activeStories.map((story, index) => {
            const hasViewed = (story.viewers || []).some((v) => v.userId === currentUser?.uid);
            const isUserAuthor = story.authorId === currentUser?.uid;

            return (
              <button
                key={story.id}
                type="button"
                onClick={() => setSelectedStoryIndex(index)}
                className="group relative flex-shrink-0 flex flex-col items-center w-20 sm:w-22 focus:outline-none"
              >
                <div
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl p-[2px] transition-all group-hover:scale-105 shadow-md ${
                    hasViewed && !isUserAuthor
                      ? 'bg-slate-700'
                      : 'bg-gradient-to-tr from-blue-500 via-indigo-500 to-emerald-400'
                  }`}
                >
                  <div className="w-full h-full rounded-[14px] bg-slate-950 overflow-hidden relative">
                    {story.imageUrl ? (
                      <img
                        src={story.imageUrl}
                        alt={story.authorName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${
                          story.backgroundColor || 'from-slate-900 to-blue-950'
                        } flex items-center justify-center p-1 text-center`}
                      >
                        <span className="text-[10px] font-bold text-white line-clamp-3 leading-tight">
                          {story.text}
                        </span>
                      </div>
                    )}

                    {/* Mini Author Avatar Tag */}
                    <div className="absolute top-1 left-1 w-5 h-5 rounded-full ring-1 ring-white/60 overflow-hidden bg-slate-800">
                      {story.authorAvatar ? (
                        <img
                          src={story.authorAvatar}
                          alt={story.authorName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-white bg-blue-600">
                          {story.authorName.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <span className="mt-1.5 text-[11px] font-medium text-slate-300 group-hover:text-white text-center truncate w-full">
                  {isUserAuthor ? 'Você' : story.authorName.split(' ')[0]}
                </span>
              </button>
            );
          })}

          {/* Empty state when no stories and user is client */}
          {!canCreateStory && activeStories.length === 0 && (
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

      {/* Story Viewer Modal */}
      {selectedStoryIndex !== null && (
        <StoryViewerModal
          stories={activeStories}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}
    </div>
  );
};
