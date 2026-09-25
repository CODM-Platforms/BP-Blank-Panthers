import { Image as ImageIcon, Send, Calendar } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/prisma/db';
import { toJsDate } from '@/lib/temporal';
import { createPost } from '@/app/admin/content/actions';

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
          <h1 className="text-3xl font-bold text-white uppercase">Content Manager</h1>
          <p className="text-panther-text mt-1">Manage clan news, announcements, and public achievements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Post Editor Panel (Quick Create) */}
        <div className="lg:col-span-2 bg-panther-card border border-panther-border rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-panther-border pb-4">Draft Post</h2>
          
          <form className="space-y-6" action={createPost}>
            <div>
              <label className="block text-sm font-medium text-panther-text mb-2">Post Title</label>
              <input type="text" name="title" required placeholder="e.g., Our Clan Wins Zanzibar Championship" className="w-full bg-panther-dark border border-panther-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-panther-gold" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-panther-text mb-2">Category</label>
                <select name="category" className="w-full bg-panther-dark border border-panther-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-panther-gold appearance-none">
                  <option value="NEWS">News</option>
                  <option value="ACHIEVEMENT">Achievement</option>
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="TOURNAMENT">Tournament Result</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-panther-text mb-2">Publish Date</label>
                <input type="datetime-local" name="publishedAt" className="w-full bg-panther-dark border border-panther-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-panther-gold" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-panther-text mb-2">Content</label>
              <textarea name="content" required rows={6} placeholder="Write your post here..." className="w-full bg-panther-dark border border-panther-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-panther-gold resize-none"></textarea>
            </div>

            <div className="border-2 border-dashed border-panther-border rounded-xl p-8 text-center hover:border-panther-gold/50 transition-colors cursor-pointer bg-panther-dark/50">
              <ImageIcon className="w-8 h-8 text-panther-text mx-auto mb-2" />
              <p className="text-sm text-panther-text">Click to upload cover image (or drag and drop)</p>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-panther-border">
              <button type="submit" className="px-6 py-2 bg-panther-gold text-panther-dark font-bold rounded-lg hover:bg-panther-gold-hover transition-colors flex items-center gap-2">
                <Send className="w-4 h-4" /> Publish Now
              </button>
            </div>
          </form>
        </div>

        {/* Recent Posts List */}
        <div className="bg-panther-card border border-panther-border rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-panther-border pb-4">Recent Posts</h2>
          
          <div className="space-y-4">
            {posts.length === 0 ? (
              <p className="text-panther-text text-sm">No posts created yet.</p>
            ) : (
              posts.map((post) => (
                <Link href={`/news/${post.id}`} target="_blank" key={post.id} className="block p-4 bg-panther-dark border border-panther-border rounded-lg hover:border-panther-gold/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs px-2 py-1 rounded border bg-blue-500/10 border-blue-500/20 text-blue-400 font-bold">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-white font-bold mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-xs text-panther-text flex items-center gap-1">
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
