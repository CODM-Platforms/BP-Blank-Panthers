import Link from 'next/link';
import GlobalHeader from '@/components/GlobalHeader';
import { db } from '@/prisma/db';
import { toJsDate } from '@/lib/temporal';

const CATEGORY_ICON: Record<string, string> = {
  NEWS: 'newspaper',
  ACHIEVEMENT: 'military_tech',
  ANNOUNCEMENT: 'campaign',
  TOURNAMENT: 'emoji_events',
};

export default async function NewsIndex() {
  let posts: any[] = [];
  try {
    posts = await db.orm.public.Post
      .orderBy((p) => p.createdAt.desc())
      .all();
  } catch (e) {
    console.error('DB error', e);
  }

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/95 via-surface-container-lowest/90 to-surface-container-lowest/95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0c0e12_85%)]"></div>
      </div>

      <GlobalHeader />

      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-start pt-10 pb-margin">
        <section className="w-full max-w-6xl mx-auto px-margin-mobile md:px-margin pt-4 pb-12 flex flex-col gap-space-md border-b border-surface-container-high/50 mb-10">
          <div className="inline-flex items-center gap-2 px-space-md py-1 rounded-full border border-primary-container/30 bg-primary-container/5 backdrop-blur-md self-start">
            <span className="material-symbols-outlined text-[16px] text-primary-container">rss_feed</span>
            <span className="font-label-sm text-label-sm text-primary-container tracking-widest uppercase">Command Broadcasts</span>
          </div>
          <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl uppercase text-on-surface tracking-tighter">
            Intel
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            News, announcements, achievements, and tournament results from BP Black Panthers.
          </p>
        </section>

        <div className="w-full max-w-6xl mx-auto px-margin-mobile md:px-margin">
          {posts.length === 0 ? (
            <div className="p-12 text-center border border-surface-container-high border-dashed rounded-xl text-outline font-mono text-sm">
              No intel logged yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
              {posts.map((post: any) => (
                <Link
                  href={`/news/${post.id}`}
                  key={post.id}
                  className="group bg-surface-container-low/80 backdrop-blur-xl border border-surface-container-high rounded-xl overflow-hidden hover:border-primary-container/50 transition-all hover:-translate-y-1 flex flex-col"
                >
                  <div className="aspect-video bg-surface-container-lowest relative overflow-hidden border-b border-surface-container-high flex items-center justify-center">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <span className="material-symbols-outlined text-[48px] text-surface-container-highest group-hover:text-primary-container/30 transition-colors">
                        {CATEGORY_ICON[post.category] ?? 'newspaper'}
                      </span>
                    )}
                    <span className="absolute top-3 left-3 px-2 py-1 bg-surface-container-lowest/90 backdrop-blur-sm border border-primary-container/30 text-primary-container text-[10px] font-mono uppercase tracking-widest rounded">
                      {post.category}
                    </span>
                  </div>
                  <div className="p-space-md flex flex-col gap-2 flex-1">
                    <h3 className="font-title-lg text-lg font-bold text-on-surface line-clamp-2 group-hover:text-primary-container transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant line-clamp-2 flex-1">{post.content}</p>
                    <p className="font-mono text-[10px] text-outline uppercase tracking-widest mt-2">
                      {toJsDate(post.publishedAt ?? post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 w-full px-margin py-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm text-on-surface-variant border-t border-surface-container-high/30 bg-surface-container-lowest mt-10">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-[16px] text-outline">verified_user</span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">BP Tactical Directives Enforced</span>
        </div>
        <div className="flex items-center gap-space-md">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">© 2026 BP Black Panthers Esports</span>
        </div>
      </footer>
    </div>
  );
}
