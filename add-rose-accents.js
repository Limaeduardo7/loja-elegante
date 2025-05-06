import fs from 'fs';
import { glob } from 'glob';

// Elementos específicos para receber a cor rosa
const elementsToUpdate = [
  // Botões secundários
  {
    find: /className="([^"]*)(py-\d+ px-\d+ bg-champagne-500)([^"]*)"/g,
    replace: (match, p1, p2, p3) => {
      // Se for um botão importante de ação do usuário
      if (match.includes('Enviar mensagem') || 
          match.includes('Adicionar ao carrinho') ||
          match.includes('hover:bg-champagne-600') ||
          match.includes('shadow-md')) {
        return `className="${p1}py-4 px-8 bg-rose-300${p3.replace('hover:bg-champagne-600', 'hover:bg-rose-400')}"`;
      }
      return match;
    }
  },
  
  // Bordas de destaque e cards especiais
  {
    find: /border-l-4 border-champagne-500/g,
    replace: 'border-l-4 border-rose-300'
  },
  
  // Ícones femininos e de destaque
  {
    find: /<(Heart|Mail|MessageCircle|Star|Send)[^>]*text-champagne-500[^>]*>/g,
    replace: (match) => match.replace('text-champagne-500', 'text-rose-300')
  },
  
  // Etiquetas e badges "Novidade"
  {
    find: /<span[^>]*bg-champagne-500[^>]*>(\s*Novidade\s*)<\/span>/g,
    replace: '<span class="inline-block bg-rose-300 text-white text-xs px-3 py-1 rounded-full font-medium mb-3">$1</span>'
  },
  
  // Subtítulos específicos e estilizações da marca
  {
    find: /<span class(?:Name)?="([^"]*)text-champagne-500([^"]*)">((?:[^<]|<(?!\/span>))*(?:Use Lamone|Sobre|Contato|Envie sua|Nossa|Elegante|Feminina|Mulher|Marca)[^<]*)<\/span>/g,
    replace: '<span class$1text-rose-300$2">$3</span>'
  },
  
  // Ícones de animação e loading
  {
    find: /animate-spin[^"]*border-champagne-500/g,
    replace: 'animate-spin border-t-2 border-b-2 border-rose-300'
  },
  
  // Tabs ativas e selecionadas
  {
    find: /border-b-2 border-champagne-500 text-champagne-500/g,
    replace: 'border-b-2 border-rose-300 text-rose-300'
  },
  
  // Pontos de lista destacados
  {
    find: /<span className="h-1.5 w-1.5 rounded-full bg-champagne-500/g,
    replace: '<span className="h-1.5 w-1.5 rounded-full bg-rose-300'
  },
  
  // Botões de instagram e redes sociais
  {
    find: /(href="https:\/\/instagram.com\/[^"]*")[^>]*bg-rose-300[^>]*>/g,
    replace: (match) => {
      // Se já tiver bg-rose, não altera para evitar duplicação
      return match;
    }
  },
  {
    find: /(href="https:\/\/instagram.com\/[^"]*")[^>]*bg-champagne-500[^>]*>/g,
    replace: '$1 class="inline-flex items-center bg-rose-300 hover:bg-rose-400 text-white px-8 py-3 rounded-full font-medium transition-colors shadow-md hover:shadow-lg">'
  },
  
  // Links especiais e textos destacados
  {
    find: /(contato@|atendimento@|@uselamone)[^<]*(text-champagne-\d+)[^<]*<\/a>/g,
    replace: (match, p1, p2) => match.replace(p2, 'text-rose-400')
  },
  
  // Botões favoritos e de ações secundárias
  {
    find: /(toggleFavorite|Like|Heart|Favorite|Desejo)[^>]*(bg-champagne-\d+)[^>]*>/g,
    replace: (match, p1, p2) => match.replace(p2, 'bg-rose-300')
  }
];

// Função para aplicar substituições em um arquivo
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    let newContent = content;

    // Aplicar cada tipo de substituição
    elementsToUpdate.forEach(update => {
      // Se o padrão for encontrado no arquivo
      if (newContent.match(update.find)) {
        const updatedContent = newContent.replace(update.find, update.replace);
        if (updatedContent !== newContent) {
          newContent = updatedContent;
          updated = true;
        }
      }
    });

    // Salvar o arquivo se houve alterações
    if (updated) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Atualizado com acentos rosa: ${filePath}`);
    }
  } catch (error) {
    console.error(`Erro ao processar o arquivo ${filePath}:`, error);
  }
}

// Função principal
async function addRoseAccents() {
  // Encontrar todos os arquivos de componentes
  const componentFiles = await glob('src/**/*.{tsx,jsx}');
  
  // Aplicar substituições em cada arquivo
  componentFiles.forEach(updateFile);
  
  console.log('Processo de adição de acentos rosa concluído!');
}

// Executar a função
addRoseAccents(); 