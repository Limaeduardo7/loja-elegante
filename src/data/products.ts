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
  modelImages?: string[]; // Imagens com modelos usando o produto
  stock?: number; // Quantidade em estoque
  reviews?: {
    id: number;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  productStory?: string; // História do produto para storytelling
  discount?: number;
  isNew?: boolean;
  tags?: string[];
  shipsToday?: boolean; // Indica se o produto pode ser enviado no mesmo dia
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
    modelImages: [
      '/images/produtos/vestido-floral-modelo-1.jpg',
      '/images/produtos/vestido-floral-modelo-2.jpg',
      '/images/produtos/vestido-floral-modelo-3.jpg',
    ],
    stock: 3,
    reviews: [
      {
        id: 1,
        user: 'Marina Silva',
        rating: 5,
        comment: 'Esse vestido é perfeito! O tecido é de excelente qualidade e o caimento ficou lindo no corpo. Recomendo muito.',
        date: '15/05/2023'
      },
      {
        id: 2,
        user: 'Carolina Mendes',
        rating: 4,
        comment: 'Adorei o vestido, muito elegante. A cor é exatamente como na foto. Apenas achei um pouco maior do que esperava.',
        date: '03/06/2023'
      }
    ],
    productStory: 'Este vestido foi inspirado nos jardins ingleses de primavera, criado para mulheres que valorizam peças únicas e atemporais. Cada estampa foi cuidadosamente desenhada à mão por nossa equipe de design, trazendo exclusividade para sua coleção.',
    isNew: true,
    shipsToday: true,
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
    modelImages: [
      '/images/produtos/blusa-seda-modelo-1.jpg',
      '/images/produtos/blusa-seda-modelo-2.jpg',
    ],
    stock: 8,
    reviews: [
      {
        id: 1,
        user: 'Juliana Costa',
        rating: 5,
        comment: 'Essa blusa é um sonho! O toque da seda é maravilhoso e o caimento é perfeito.',
        date: '22/04/2023'
      },
      {
        id: 2,
        user: 'Amanda Souza',
        rating: 5,
        comment: 'Comprei para usar no trabalho e fica muito elegante. Vale cada centavo!',
        date: '17/05/2023'
      },
      {
        id: 3,
        user: 'Beatriz Lima',
        rating: 4,
        comment: 'Amei a qualidade do tecido, mas achei o tamanho um pouco maior do que esperava.',
        date: '05/06/2023'
      }
    ],
    productStory: 'Nossa blusa de seda premium é produzida com a mais fina seda natural, importada diretamente da China. O processo de tecelagem segue técnicas tradicionais que garantem um tecido de excepcional suavidade e durabilidade, tornando cada peça um verdadeiro tesouro em seu guarda-roupa.',
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
    modelImages: [
      '/images/produtos/calca-jeans-modelo-1.jpg',
      '/images/produtos/calca-jeans-modelo-2.jpg',
    ],
    stock: 12,
    reviews: [
      {
        id: 1,
        user: 'Mariana Oliveira',
        rating: 4,
        comment: 'Ótima calça, muito confortável. O tamanho ficou perfeito.',
        date: '10/03/2023'
      },
      {
        id: 2,
        user: 'Fernanda Santos',
        rating: 5,
        comment: 'Melhor calça jeans que já tive! Super confortável e valoriza o corpo.',
        date: '25/04/2023'
      }
    ],
    productStory: 'Nossas calças jeans são produzidas com algodão orgânico certificado, cultivado sem pesticidas ou produtos químicos nocivos. O tingimento é feito com técnicas que reduzem o consumo de água em até 80% comparado ao processo tradicional, refletindo nosso compromisso com a sustentabilidade sem comprometer a qualidade.',
    shipsToday: true,
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
    modelImages: [
      '/images/produtos/blazer-modelo-1.jpg',
      '/images/produtos/blazer-modelo-2.jpg',
    ],
    stock: 2,
    reviews: [
      {
        id: 1,
        user: 'Luísa Ferreira',
        rating: 5,
        comment: 'Este blazer é sensacional. O tecido é de ótima qualidade e o caimento é perfeito!',
        date: '12/02/2023'
      },
      {
        id: 2,
        user: 'Patrícia Almeida',
        rating: 4,
        comment: 'Excelente blazer, vestiu muito bem e o acabamento é impecável.',
        date: '20/03/2023'
      },
      {
        id: 3,
        user: 'Camila Dias',
        rating: 3,
        comment: 'O blazer é bonito, mas achei o tecido um pouco pesado para o clima tropical.',
        date: '05/04/2023'
      }
    ],
    productStory: 'Este blazer foi desenhado por nossa estilista-chefe após uma viagem a Londres, onde se inspirou na alfaiataria tradicional britânica. Combinamos técnicas clássicas de alfaiataria com um toque contemporâneo, resultando em uma peça versátil que transita perfeitamente entre o ambiente corporativo e ocasiões sociais.',
    discount: 10,
    shipsToday: true,
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
      { name: 'Champagne Gold', value: '#D4AF37' },
      { name: 'Prata', value: '#C0C0C0' },
      { name: 'Preto', value: '#000000' }
    ],
    images: [
      '/images/produtos/saia-midi.jpg',
      '/images/produtos/saia-midi-2.jpg',
      '/images/produtos/saia-midi-3.jpg',
    ],
    modelImages: [
      '/images/produtos/saia-midi-modelo-1.jpg',
      '/images/produtos/saia-midi-modelo-2.jpg',
    ],
    stock: 5,
    reviews: [
      {
        id: 1,
        user: 'Isabela Castro',
        rating: 5,
        comment: 'Saia linda e elegante! O champagne gold é discreto e sofisticado.',
        date: '30/01/2023'
      },
      {
        id: 2,
        user: 'Sofia Mendonça',
        rating: 5,
        comment: 'Amei! Pode ser usada em diversas ocasiões e é super confortável.',
        date: '15/03/2023'
      }
    ],
    productStory: 'Nossa saia plissada nasceu da inspiração das bailarinas clássicas, com seus movimentos fluidos e elegantes. Cada prega é meticulosamente formada através de um processo térmico especial que garante durabilidade ao plissado mesmo após múltiplas lavagens, mantendo a beleza original da peça por muito mais tempo.',
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
    modelImages: [
      '/images/produtos/camisa-social-modelo-1.jpg',
      '/images/produtos/camisa-social-modelo-2.jpg',
    ],
    stock: 0,
    reviews: [
      {
        id: 1,
        user: 'Rafael Souza',
        rating: 5,
        comment: 'Excelente camisa! O algodão egípcio faz toda a diferença no conforto.',
        date: '10/02/2023'
      },
      {
        id: 2,
        user: 'Pedro Oliveira',
        rating: 4,
        comment: 'Camisa muito bonita e bem cortada. O tamanho M serviu perfeitamente.',
        date: '25/03/2023'
      },
      {
        id: 3,
        user: 'Gabriel Lima',
        rating: 3,
        comment: 'A camisa é boa, mas esperava um tecido um pouco mais encorpado.',
        date: '15/04/2023'
      }
    ],
    productStory: 'Nossas camisas sociais são confeccionadas com o renomado algodão egípcio, reconhecido mundialmente por suas fibras longas que proporcionam maciez incomparável e extraordinária durabilidade. Cada peça passa por um processo de pré-lavagem especial que garante estabilidade dimensional, evitando encolhimentos após a lavagem doméstica.',
    discount: 20,
    tags: ['Trabalho', 'Formal', 'Clássico'],
  }
]; 