import { Calendar } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/prisma/db';
import { toJsDate } from '@/lib/temporal';
import CreatePostForm from '@/components/admin/CreatePostForm';

export default async function ContentManager() {
  // Fetch real posts from DB safely
  let posts: any[] = [];
  try {
    posts = await db.orm.public.Post
      .orderBy((p) => p.createdAt.desc())
      .all();
  } catch(e) {
    console.error("DB not connected yet.");
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface uppercase">Content Manager</h1>
          <p className="text-outline mt-1">Manage clan news, announcements, and public achievements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Post Editor Panel (Quick Create) */}
        <div className="lg:col-span-2 bg-surface-container-low border border-surface-container-high rounded-xl p-6">
          <h2 className="text-xl font-bold text-on-surface mb-6 border-b border-surface-container-high pb-4">Draft Post</h2>
          <CreatePostForm />
        </div>

        {/* Recent Posts List */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
          <h2 className="text-xl font-bold text-on-surface mb-6 border-b border-surface-container-high pb-4">Recent Posts</h2>
          
          <div className="space-y-4">
            {posts.length === 0 ? (
              <p className="text-outline text-sm">No posts created yet.</p>
            ) : (
              posts.map((post) => (
                <Link href={`/news/${post.id}`} target="_blank" key={post.id} className="block p-4 bg-surface-container-lowest border border-surface-container-high rounded-lg hover:border-primary-container/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs px-2 py-1 rounded border bg-blue-500/10 border-blue-500/20 text-blue-400 font-bold">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-on-surface font-bold mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-xs text-outline flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {toJsDate(post.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
