import { useState, useEffect } from 'react';
import { Instagram } from 'lucide-react';

interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption?: string;
  thumbnail_url?: string;
}

const InstagramFeed = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Como ainda não temos o token de acesso completo do Instagram, vamos usar algumas
    // imagens de exemplo que são semelhantes ao estilo da loja, mas com um carregador
    // que simula a busca de dados reais do Instagram

    // Função que simula o carregamento de dados do Instagram
    const fetchInstagramPosts = () => {
      setLoading(true);
      
      // Simulando um atraso de rede
      setTimeout(() => {
        // Exemplos de posts que seriam semelhantes ao estilo da loja
        // Estes posts podem ser substituídos pelos reais quando a integração estiver pronta
        const mockPosts: InstagramPost[] = [
          {
            id: '1',
            media_url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1586',
            permalink: 'https://www.instagram.com/uselamone',
            caption: 'Novidades para o verão!'
          },
          {
            id: '2',
            media_url: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?q=80&w=1586',
            permalink: 'https://www.instagram.com/uselamone',
            caption: 'Coleção exclusiva'
          },
          {
            id: '3',
            media_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1587',
            permalink: 'https://www.instagram.com/uselamone',
            caption: 'Tendências da estação'
          },
          {
            id: '4',
            media_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1412',
            permalink: 'https://www.instagram.com/uselamone',
            caption: 'Estilo e sofisticação'
          },
          {
            id: '5',
            media_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1470',
            permalink: 'https://www.instagram.com/uselamone',
            caption: 'Elegância em cada detalhe'
          },
          {
            id: '6',
            media_url: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1386',
            permalink: 'https://www.instagram.com/uselamone',
            caption: 'Moda que inspira'
          }
        ];
        
        setPosts(mockPosts);
        setLoading(false);
      }, 1500);
    };
    
    fetchInstagramPosts();
    
    // Comentários sobre a implementação real com Instagram Basic Display API
    /*
    Para implementar a integração real com o Instagram, você precisará:
    
    1. Criar uma conta de desenvolvedor do Facebook
    2. Criar um aplicativo no Facebook Developer Portal
    3. Configurar o produto "Instagram Basic Display"
    4. Obter um token de acesso de longa duração
    5. Usar o token para buscar as mídias do perfil

    O código seria semelhante a:

    const fetchInstagramPosts = async () => {
      try {
        setLoading(true);
        const accessToken = 'SEU_TOKEN_DE_ACESSO';
        const response = await fetch(
          `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url&access_token=${accessToken}`
        );
        
        if (!response.ok) throw new Error('Falha ao buscar posts do Instagram');
        
        const data = await response.json();
        setPosts(data.data.filter(post => post.media_type === 'IMAGE').slice(0, 6));
      } catch (err) {
        console.error('Erro ao buscar posts do Instagram:', err);
        setError('Não foi possível carregar os posts do Instagram');
      } finally {
        setLoading(false);
      }
    };
    */
  }, []);

  if (loading) {
    return (
      <section className="bg-white">
        <div className="container-custom px-0">
          <div className="text-center mb-4 py-4">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-2 tracking-wide">
              Instagram <span className="text-champagne-500">@uselamone</span>
            </h2>
            <a 
              href="https://www.instagram.com/uselamone" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-champagne-500 hover:text-champagne-600 transition-colors font-light"
            >
              <Instagram size={20} className="mr-2" />
              Seguir nosso perfil
            </a>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 min-h-[300px] flex items-center justify-center">
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-pulse text-champagne-500">Carregando posts do Instagram...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || posts.length === 0) {
    return (
      <section className="bg-white">
        <div className="container-custom px-0">
          <div className="text-center mb-4 py-4">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-2 tracking-wide">
              Instagram <span className="text-champagne-500">@uselamone</span>
            </h2>
            <a 
              href="https://www.instagram.com/uselamone" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-champagne-500 hover:text-champagne-600 transition-colors font-light"
            >
              <Instagram size={20} className="mr-2" />
              Seguir nosso perfil
            </a>
          </div>
          
          <div className="text-center py-8">
            <p className="text-gray-500">Não foi possível carregar os posts do Instagram.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white">
      <div className="container-custom px-0">
        <div className="text-center mb-4 py-4">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-2 tracking-wide">
            Instagram <span className="text-champagne-500">@uselamone</span>
          </h2>
          <a 
            href="https://www.instagram.com/uselamone" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-champagne-500 hover:text-champagne-600 transition-colors font-light"
          >
            <Instagram size={20} className="mr-2" />
            Seguir nosso perfil
          </a>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0">
          {posts.map((post) => (
            <a 
              key={post.id} 
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group overflow-hidden aspect-square block"
            >
              <img 
                src={post.media_url || post.thumbnail_url} 
                alt={post.caption || 'Post do Instagram da Use Lamone'} 
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                <div className="text-white p-4 text-center">
                  <Instagram size={24} className="mx-auto mb-2" />
                  <p className="text-sm font-light line-clamp-2">{post.caption || 'Ver no Instagram'}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed; 