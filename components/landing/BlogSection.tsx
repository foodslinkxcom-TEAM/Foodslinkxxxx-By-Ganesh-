import Link from "next/link";
import { Calendar } from "lucide-react";

export default function BlogSection() {
  const posts = [
    {
      title: "5 Ways to Increase Restaurant Revenue",
      category: "Growth",
      date: "Dec 12, 2024",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Why Paper Menus are Dying",
      category: "Technology",
      date: "Dec 10, 2024",
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Customer Retention Strategies 2025",
      category: "Marketing",
      date: "Dec 05, 2024",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=600"
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-end mb-12">
           <div>
             <h2 className="text-3xl font-bold text-slate-900">Latest from the Blog</h2>
             <p className="text-slate-500 mt-2">Tips and trends for restaurant owners.</p>
           </div>
           <Link href="/blog" className="text-red-600 font-bold hover:underline">View All Posts</Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-slate-100 group">
              <div className="h-48 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-3">
                  <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md">{post.category}</span>
                  <span className="flex items-center gap-1"><Calendar size={12}/> {post.date}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">
                  {post.title}
                </h3>
                <Link href="#" className="text-sm font-bold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-red-600">Read Article</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}