import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, Heart, Camera } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 pb-16 pt-28 md:pt-32">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-champagne-500 transition-colors">
            Início
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Sobre nós</span>
        </div>

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light mb-6 text-gray-900">
            Sobre a <span className="text-rose-300">Use Lamone</span>
          </h1>
          <p className="max-w-3xl mx-auto text-gray-600 font-light leading-relaxed">
            Somos uma marca de moda feminina que valoriza a elegância, sofisticação e qualidade em cada peça.
            Nossa jornada é dedicada a criar roupas que realçam a beleza e confiança de cada mulher.
          </p>
        </div>

        {/* Nossa História - Com tom mais pessoal e inspirador */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-light mb-6 text-gray-900">Nossa História</h2>
            <div className="space-y-4 font-light text-gray-700 leading-relaxed">
              <p className="italic text-champagne-600 text-lg">
                "Na Use Lamone, acreditamos que a moda vai muito além da estética — ela é um reflexo da sua história, da sua força e da sua essência. Por trás de cada look, existe uma mulher que vive intensamente, que trabalha, que sonha, que conquista. É para ela que criamos."
              </p>
              
              <p>
                Meu nome é Tatiane, sou fundadora da Use Lamone.
                Atuo como assessora de compras e profissional de marketing com mais de 30 anos de experiência no universo da moda.
              </p>
              
              <p>
                Comecei minha trajetória aos 15 anos como vendedora, passei por grandes marcas, vivi os bastidores da indústria, fui gerente, representante, fabricante — e hoje, empreendo com propósito e paixão.
                Cada etapa me trouxe aprendizados valiosos, desafios e conquistas.
                Com dedicação e coragem, transformei experiências em uma marca que traduz tudo o que acredito:
                elegância, autenticidade, simplicidade e atitude.
              </p>
              
              <p>
                A <span className="text-rose-300 font-medium">Use Lamone</span> nasce do desejo de oferecer uma moda moderna, atemporal e acessível, com curadoria profissional e um olhar atento às tendências.
                Mais do que roupas, oferecemos estilo com alma — para mulheres que sabem quem são e onde querem chegar.
              </p>
              
              <p>
                Acredito na energia que colocamos no mundo: plante o bem, colha realizações.
                Não acumulo riquezas, mas multiplico valores — como honestidade, empatia, respeito e família.
              </p>
              
              <p>
                Meu maior desejo é influenciar positivamente outras mulheres e jovens a acreditarem nos seus sonhos, estudarem, se profissionalizarem e construírem uma vida digna com propósito e liberdade.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-80 overflow-hidden rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1374" 
                alt="Ateliê Use Lamone" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="h-80 overflow-hidden rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=1479" 
                alt="Tatiane em seu ateliê" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="h-80 overflow-hidden rounded-lg col-span-2">
              <img 
                src="https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?q=80&w=1480" 
                alt="Processo criativo" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* Atrás das Câmeras - Fotos de bastidores */}
        <div className="mb-20">
          <div className="flex items-center justify-center mb-10">
            <Camera className="text-champagne-500 w-6 h-6 mr-3" />
            <h2 className="text-3xl font-light text-gray-900">Atrás das Câmeras</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative overflow-hidden rounded-lg group h-80">
              <img 
                src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1470" 
                alt="Produção de peças" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-light px-6 text-center">Nossa equipe de costureiras dedicadas criando peças com atenção aos detalhes</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg group h-80">
              <img 
                src="https://images.unsplash.com/photo-1581338834647-b0fb40704e21?q=80&w=1374" 
                alt="Sessão de fotos" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-light px-6 text-center">Nos bastidores de nossas sessões de fotos com nossa equipe</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg group h-80">
              <img 
                src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1528" 
                alt="Desenho de coleção" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-light px-6 text-center">Tatiane desenhando nossa mais recente coleção</p>
              </div>
            </div>
          </div>
        </div>

        {/* Missão, Visão e Valores - Mais definidos */}
        <div className="mb-20 bg-gray-50 py-16 px-8 md:px-16 rounded-xl">
          <div className="flex items-center justify-center mb-12">
            <Heart className="text-rose-300 w-6 h-6 mr-3" />
            <h2 className="text-3xl font-light text-gray-900">Missão, Visão e Valores</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 relative">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-champagne-500 flex items-center justify-center text-white">
                1
              </div>
              <h3 className="text-xl font-medium mb-4 text-gray-900 text-center pt-6">Nossa Missão</h3>
              <p className="font-light text-gray-700 leading-relaxed text-center mb-4">
                Criar peças que combinam elegância, conforto e qualidade para mulheres reais, valorizando suas individualidades e promovendo autoconfiança através da moda.
              </p>
              <div className="border-t border-gray-100 pt-4 mt-4">
                <p className="font-light text-gray-600 italic text-sm">
                  "Nossa missão vai além de vestir. É sobre fazer cada mulher se sentir especial e confiante em sua própria pele."
                </p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 relative">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-champagne-500 flex items-center justify-center text-white">
                2
              </div>
              <h3 className="text-xl font-medium mb-4 text-gray-900 text-center pt-6">Nossa Visão</h3>
              <p className="font-light text-gray-700 leading-relaxed text-center mb-4">
                Ser reconhecida até 2028 como referência nacional em moda elegante e sustentável para mulheres contemporâneas, mantendo nosso compromisso com a qualidade artesanal e atenção aos detalhes.
              </p>
              <div className="border-t border-gray-100 pt-4 mt-4">
                <p className="font-light text-gray-600 italic text-sm">
                  "Imaginamos um futuro onde a elegância e sustentabilidade caminham juntas, sem comprometer a qualidade."
                </p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 relative">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-champagne-500 flex items-center justify-center text-white">
                3
              </div>
              <h3 className="text-xl font-medium mb-4 text-gray-900 text-center pt-6">Nossos Valores</h3>
              <ul className="font-light text-gray-700 leading-relaxed space-y-3">
                <li className="flex items-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-300 mt-2 mr-2 flex-shrink-0"></span>
                  <span><strong className="text-champagne-600">Qualidade:</strong> Priorizamos materiais premium e acabamentos impecáveis em cada peça.</span>
                </li>
                <li className="flex items-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-300 mt-2 mr-2 flex-shrink-0"></span>
                  <span><strong className="text-champagne-600">Autenticidade:</strong> Incentivamos cada mulher a expressar sua personalidade única.</span>
                </li>
                <li className="flex items-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-300 mt-2 mr-2 flex-shrink-0"></span>
                  <span><strong className="text-champagne-600">Sustentabilidade:</strong> Compromisso com práticas responsáveis de produção e mínimo desperdício.</span>
                </li>
                <li className="flex items-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-300 mt-2 mr-2 flex-shrink-0"></span>
                  <span><strong className="text-champagne-600">Respeito:</strong> Valorizamos diversidade e inclusão em todo nosso processo.</span>
                </li>
                <li className="flex items-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-300 mt-2 mr-2 flex-shrink-0"></span>
                  <span><strong className="text-champagne-600">Transparência:</strong> Comunicação clara com nossas clientes e colaboradores.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instagram com Destaque */}
        <div className="bg-champagne-50 p-10 rounded-xl text-center">
          <div className="mb-6 flex flex-col items-center">
            <Instagram className="h-10 w-10 text-champagne-500 mb-4" />
            <h2 className="text-3xl font-light text-gray-900 mb-2">Nos Siga no Instagram</h2>
            <p className="text-gray-700 font-light max-w-2xl mx-auto mb-6">
              Acompanhe nossos bastidores, lançamentos exclusivos e dicas de estilo. Junte-se à nossa comunidade de mulheres elegantes!
            </p>
            <a 
              href="https://www.instagram.com/use.lamone?igsh=ZGUzMzM3NWJiOQ==" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center bg-rose-300 hover:bg-champagne-600 text-white px-8 py-3 rounded-full font-medium transition-colors shadow-md hover:shadow-lg"
            >
              <Instagram className="h-5 w-5 mr-2" /> @use.lamone
            </a>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="aspect-square overflow-hidden rounded-md">
              <img 
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1470" 
                alt="Instagram post" 
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-md">
              <img 
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1374" 
                alt="Instagram post" 
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-md">
              <img 
                src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1473" 
                alt="Instagram post" 
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-md">
              <img 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1470" 
                alt="Instagram post" 
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 