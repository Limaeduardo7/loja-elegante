export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  features: string[];
  material: string;
  sizes: string[];
  colors: {
    name: string;
    value: string;
  }[];
  images: string[];
  discount?: number;
  isNew?: boolean;
  tags?: string[];
};

// Dados de produtos para a loja
export const products: Product[] = [
  {
    id: 1,
    name: 'Vestido Floral Elegante',
    price: 359.90,
    image: '/images/produtos/vestido-floral.jpg',
    category: 'Vestidos',
    description: 'Vestido floral com corte elegante, perfeito para ocasiões especiais. Confeccionado com tecido leve e confortável.',
    features: [
      'Tecido com acabamento premium',
      'Estampa floral exclusiva',
      'Corte ajustado ao corpo com caimento fluido',
      'Forro interno para maior conforto'
    ],
    material: '100% Viscose',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Azul', value: '#1E3A8A' },
      { name: 'Rosa', value: '#DB2777' },
      { name: 'Verde', value: '#047857' }
    ],
    images: [
      '/images/produtos/vestido-floral.jpg',
      '/images/produtos/vestido-floral-2.jpg',
      '/images/produtos/vestido-floral-3.jpg',
    ],
    isNew: true,
    tags: ['Elegante', 'Floral', 'Verão'],
  },
  {
    id: 2,
    name: 'Blusa de Seda Premium',
    price: 289.90,
    image: '/images/produtos/blusa-seda.jpg',
    category: 'Blusas',
    description: 'Blusa de seda com acabamento premium e modelagem solta. Versátil, pode ser usada em ocasiões casuais ou formais.',
    features: [
      'Seda com textura suave',
      'Botões perolados',
      'Modelagem oversized',
      'Punhos ajustáveis'
    ],
    material: '100% Seda Natural',
    sizes: ['PP', 'P', 'M', 'G'],
    colors: [
      { name: 'Branco', value: '#FFFFFF' },
      { name: 'Preto', value: '#000000' },
      { name: 'Bege', value: '#E8DCCA' }
    ],
    images: [
      '/images/produtos/blusa-seda.jpg',
      '/images/produtos/blusa-seda-2.jpg',
      '/images/produtos/blusa-seda-3.jpg',
    ],
    discount: 15,
    tags: ['Premium', 'Trabalho', 'Casual Chic'],
  },
  {
    id: 3,
    name: 'Calça Jeans Skinny',
    price: 229.90,
    image: '/images/produtos/calca-jeans.jpg',
    category: 'Calças',
    description: 'Calça jeans skinny de alta qualidade com lavagem premium. Oferece conforto e elasticidade para o dia a dia.',
    features: [
      'Denim com elastano para maior conforto',
      'Cintura alta',
      'Acabamento premium',
      'Lavagem especial'
    ],
    material: '98% Algodão, 2% Elastano',
    sizes: ['36', '38', '40', '42', '44'],
    colors: [
      { name: 'Azul Escuro', value: '#151F30' },
      { name: 'Azul Médio', value: '#1F4690' },
      { name: 'Preto', value: '#000000' }
    ],
    images: [
      '/images/produtos/calca-jeans.jpg',
      '/images/produtos/calca-jeans-2.jpg',
      '/images/produtos/calca-jeans-3.jpg',
    ],
    tags: ['Casual', 'Dia a Dia', 'Moderno'],
  },
  {
    id: 4,
    name: 'Blazer Estruturado',
    price: 459.90,
    image: '/images/produtos/blazer.jpg',
    category: 'Casacos',
    description: 'Blazer estruturado com design moderno e tecido de alta qualidade. Ideal para looks de trabalho e ocasiões formais.',
    features: [
      'Tecido com estrutura premium',
      'Forro interno acetinado',
      'Botões exclusivos',
      'Bolsos funcionais'
    ],
    material: '75% Poliéster, 23% Viscose, 2% Elastano',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Preto', value: '#000000' },
      { name: 'Cinza', value: '#6B7280' },
      { name: 'Azul Marinho', value: '#172554' }
    ],
    images: [
      '/images/produtos/blazer.jpg',
      '/images/produtos/blazer-2.jpg',
      '/images/produtos/blazer-3.jpg',
    ],
    discount: 10,
    tags: ['Trabalho', 'Formal', 'Elegante'],
  },
  {
    id: 5,
    name: 'Saia Midi Plissada',
    price: 199.90,
    image: '/images/produtos/saia-midi.jpg',
    category: 'Saias',
    description: 'Saia midi plissada com cintura alta e caimento elegante. Peça versátil que pode ser usada em diversas ocasiões.',
    features: [
      'Tecido plissado de alta qualidade',
      'Cintura alta com elástico confortável',
      'Caimento fluido',
      'Forro interno'
    ],
    material: '100% Poliéster',
    sizes: ['P', 'M', 'G'],
    colors: [
      { name: 'Dourado', value: '#D4AF37' },
      { name: 'Prata', value: '#C0C0C0' },
      { name: 'Preto', value: '#000000' }
    ],
    images: [
      '/images/produtos/saia-midi.jpg',
      '/images/produtos/saia-midi-2.jpg',
      '/images/produtos/saia-midi-3.jpg',
    ],
    isNew: true,
    tags: ['Festa', 'Elegante', 'Tendência'],
  },
  {
    id: 6,
    name: 'Camisa Social Slim',
    price: 189.90,
    image: '/images/produtos/camisa-social.jpg',
    category: 'Camisas',
    description: 'Camisa social com corte slim e tecido de alta qualidade. Perfeita para ocasiões formais e ambiente de trabalho.',
    features: [
      'Tecido com toque de seda',
      'Corte slim que valoriza a silhueta',
      'Botões resistentes',
      'Acabamento premium'
    ],
    material: '100% Algodão Egípcio',
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    colors: [
      { name: 'Branco', value: '#FFFFFF' },
      { name: 'Azul Claro', value: '#93C5FD' },
      { name: 'Rosa Claro', value: '#FBCFE8' }
    ],
    images: [
      '/images/produtos/camisa-social.jpg',
      '/images/produtos/camisa-social-2.jpg',
      '/images/produtos/camisa-social-3.jpg',
    ],
    discount: 20,
    tags: ['Trabalho', 'Formal', 'Clássico'],
  }
]; 