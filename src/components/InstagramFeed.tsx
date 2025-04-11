import { Instagram } from 'lucide-react';

const instagramPosts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1586',
    likes: 234,
    comments: 15
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?q=80&w=1586',
    likes: 189,
    comments: 8
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1587',
    likes: 321,
    comments: 24
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1412',
    likes: 278,
    comments: 19
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1470',
    likes: 156,
    comments: 7
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1386',
    likes: 192,
    comments: 11
  }
];

const InstagramFeed = () => {
  return (
    <section className="bg-white">
      <div className="container-custom px-0">
        <div className="text-center mb-4 py-4">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-2 tracking-wide">
            Instagram <span className="text-gold-500">@uselamone</span>
          </h2>
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-gold-500 hover:text-gold-600 transition-colors font-light"
          >
            <Instagram size={20} className="mr-2" />
            Seguir nosso perfil
          </a>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0">
          {instagramPosts.map((post) => (
            <div key={post.id} className="relative group overflow-hidden aspect-square">
              <img 
                src={post.image} 
                alt={`Instagram post ${post.id}`} 
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                <div className="text-white flex items-center space-x-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="font-light">{post.likes}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="font-light">{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed; 