import React from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 pb-16 pt-28 md:pt-32">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-gold-500 transition-colors">
            Início
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Sobre nós</span>
        </div>

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light mb-6 text-gray-900">
            Sobre a <span className="text-gold-500">Use Lamone</span>
          </h1>
          <p className="max-w-3xl mx-auto text-gray-600 font-light leading-relaxed">
            Somos uma marca de moda feminina que valoriza a elegância, sofisticação e qualidade em cada peça.
            Nossa jornada é dedicada a criar roupas que realçam a beleza e confiança de cada mulher.
          </p>
        </div>

        {/* Nossa História */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-light mb-6 text-gray-900">Nossa História</h2>
            <div className="space-y-4 font-light text-gray-700 leading-relaxed">
              <p>
                A <span className="text-gold-500 font-medium">Use Lamone</span> nasceu em 2015 a partir do sonho de Tatiane Lamone, 
                estilista apaixonada por moda que buscava criar peças que combinassem elegância atemporal e conforto.
              </p>
              <p>
                Começamos com uma pequena coleção de vestidos para ocasiões especiais e, com o tempo, expandimos 
                nosso catálogo para incluir uma ampla variedade de peças que atendem mulheres sofisticadas em 
                diversos momentos de suas vidas.
              </p>
              <p>
                Ao longo dos anos, nossa marca cresceu, mas mantemos nossa essência: criar roupas de alta qualidade 
                que façam nossas clientes se sentirem confiantes e elegantes, sem abrir mão do conforto.
              </p>
            </div>
          </div>
          <div className="h-[500px] overflow-hidden rounded-lg">
            <img 
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1374" 
              alt="Ateliê Use Lamone" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Missão, Visão e Valores */}
        <div className="mb-20">
          <h2 className="text-3xl font-light mb-12 text-gray-900 text-center">
            Missão, Visão e Valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-xl font-medium mb-4 text-gold-600">Missão</h3>
              <p className="font-light text-gray-700 leading-relaxed">
                Oferecer peças de vestuário que combinam elegância, conforto e qualidade, 
                valorizando a individualidade de cada mulher e promovendo a autoconfiança através da moda.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-xl font-medium mb-4 text-gold-600">Visão</h3>
              <p className="font-light text-gray-700 leading-relaxed">
                Ser reconhecida como referência em moda elegante para mulheres 
                contemporâneas, expandindo nossa presença nacional enquanto mantemos nosso compromisso 
                com a qualidade e atenção aos detalhes.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-xl font-medium mb-4 text-gold-600">Valores</h3>
              <ul className="font-light text-gray-700 leading-relaxed space-y-2">
                <li className="flex items-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>Excelência em cada detalhe</span>
                </li>
                <li className="flex items-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>Compromisso com a qualidade</span>
                </li>
                <li className="flex items-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>Respeito à diversidade</span>
                </li>
                <li className="flex items-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>Atendimento humanizado</span>
                </li>
                <li className="flex items-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-500 mt-2 mr-2 flex-shrink-0"></span>
                  <span>Sustentabilidade nas práticas de produção</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Processo de Criação */}
        <div className="mb-20">
          <h2 className="text-3xl font-light mb-8 text-gray-900">Nosso Processo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-gray-100 p-6 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center mb-4">
                <span className="text-gold-600 font-medium text-xl">1</span>
              </div>
              <h3 className="text-lg font-medium mb-3 text-gray-800">Inspiração</h3>
              <p className="font-light text-gray-700">
                Nossas coleções começam com uma pesquisa aprofundada de tendências e um 
                olhar atento para o que nossas clientes desejam.
              </p>
            </div>
            <div className="border border-gray-100 p-6 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center mb-4">
                <span className="text-gold-600 font-medium text-xl">2</span>
              </div>
              <h3 className="text-lg font-medium mb-3 text-gray-800">Design</h3>
              <p className="font-light text-gray-700">
                Nossa equipe de designers cria esboços e seleciona tecidos de alta qualidade 
                para dar vida às nossas peças.
              </p>
            </div>
            <div className="border border-gray-100 p-6 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center mb-4">
                <span className="text-gold-600 font-medium text-xl">3</span>
              </div>
              <h3 className="text-lg font-medium mb-3 text-gray-800">Produção</h3>
              <p className="font-light text-gray-700">
                Trabalhamos com profissionais qualificados que confeccionam cada peça com 
                atenção especial aos detalhes e acabamentos.
              </p>
            </div>
            <div className="border border-gray-100 p-6 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center mb-4">
                <span className="text-gold-600 font-medium text-xl">4</span>
              </div>
              <h3 className="text-lg font-medium mb-3 text-gray-800">Qualidade</h3>
              <p className="font-light text-gray-700">
                Cada peça passa por rigorosos controles de qualidade antes de chegar às 
                nossas lojas e às mãos de nossas clientes.
              </p>
            </div>
          </div>
        </div>

        {/* Equipe */}
        <div>
          <h2 className="text-3xl font-light mb-12 text-gray-900 text-center">
            Nossa Equipe
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-80 w-full rounded-lg overflow-hidden mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1522" 
                  alt="Tatiane Lamone" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Tatiane Lamone</h3>
              <p className="text-gold-500 font-light mb-2">Fundadora e Diretora Criativa</p>
              <p className="text-gray-600 font-light">
                Com mais de 15 anos de experiência no mundo da moda, Tatiane traz sua paixão 
                e visão para cada coleção da marca.
              </p>
            </div>
            <div className="text-center">
              <div className="h-80 w-full rounded-lg overflow-hidden mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1374" 
                  alt="Marina Silva" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Marina Silva</h3>
              <p className="text-gold-500 font-light mb-2">Gerente de Produção</p>
              <p className="text-gray-600 font-light">
                Responsável por garantir que cada peça seja produzida com excelência e 
                dentro dos prazos estabelecidos.
              </p>
            </div>
            <div className="text-center">
              <div className="h-80 w-full rounded-lg overflow-hidden mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1376" 
                  alt="Carolina Santos" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Carolina Santos</h3>
              <p className="text-gold-500 font-light mb-2">Designer de Moda</p>
              <p className="text-gray-600 font-light">
                Com um olhar apurado para tendências e novas ideias, Carolina ajuda a 
                manter nossas coleções sempre contemporâneas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 