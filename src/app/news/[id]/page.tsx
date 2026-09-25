import Link from 'next/link';
import GlobalHeader from '@/components/GlobalHeader';
import { db } from '@/prisma/db';
import { notFound } from 'next/navigation';
import { toJsDate } from '@/lib/temporal';

export default async function NewsPost({ params }: { params: { id: string } }) {
  let post = null;
  try {
    post = await db.orm.public.Post
      .where({ id: params.id })
      .include('author', (a) => a)
      .first();
  } catch (e) {
    console.error('DB error', e);
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col relative overflow-x-hidden">
      <GlobalHeader />

      <main className="relative z-10 w-full flex-1 flex flex-col items-center pt-10 pb-margin">
        <article className="w-full max-w-3xl mx-auto px-margin-mobile md:px-margin py-10">
          <Link href="/" className="text-primary-container text-sm hover:underline mb-6 inline-block">&larr; Back to Home</Link>

          <span className="inline-block px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/5 text-primary-container font-label-sm text-label-sm uppercase tracking-widest mb-4">
            {post.category}
          </span>

          <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase mb-3">{post.title}</h1>

          <p className="font-mono text-outline text-[11px] tracking-widest mb-8">
            By {post.author?.name ?? 'BP Black Panthers'} &bull; {toJsDate(post.publishedAt ?? post.createdAt).toLocaleDateString()}
          </p>

          {post.imageUrl && (
            <img src={post.imageUrl} alt={post.title} className="w-full rounded-xl mb-8 border border-surface-container-high" />
          )}

          <div className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </article>
      </main>

      <footer className="relative z-10 w-full px-margin py-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm text-on-surface-variant border-t border-surface-container-high/30 bg-surface-container-lowest">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">&copy; 2026 BP Black Panthers Esports</span>
      </footer>
    </div>
  );
}
