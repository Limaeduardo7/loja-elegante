import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Mapeamento de cores antigas para novas
const colorMapping = {
  // Variações numéricas
  'gold-50': 'champagne-50',
  'gold-100': 'champagne-100',
  'gold-200': 'champagne-200',
  'gold-300': 'champagne-300',
  'gold-400': 'champagne-400',
  'gold-500': 'champagne-500',
  'gold-600': 'champagne-600',
  'gold-700': 'champagne-700',
  'gold-800': 'champagne-800',
  'gold-900': 'champagne-900',
  
  // Classes simples
  'text-gold': 'text-champagne',
  'bg-gold': 'bg-champagne',
  'border-gold': 'border-champagne',
  'ring-gold': 'ring-champagne',
  'fill-gold': 'fill-champagne',
  'from-gold': 'from-champagne',
  'to-gold': 'to-champagne',
  'via-gold': 'via-champagne',
  'outline-gold': 'outline-champagne',
  'stroke-gold': 'stroke-champagne',
  
  // Hover
  'hover:text-gold': 'hover:text-champagne',
  'hover:bg-gold': 'hover:bg-champagne',
  'hover:border-gold': 'hover:border-champagne',
  'hover:ring-gold': 'hover:ring-champagne',
  'hover:fill-gold': 'hover:fill-champagne',
  
  // Focus
  'focus:text-gold': 'focus:text-champagne',
  'focus:bg-gold': 'focus:bg-champagne',
  'focus:border-gold': 'focus:border-champagne',
  'focus:ring-gold': 'focus:ring-champagne',
  'focus:fill-gold': 'focus:fill-champagne',
  
  // Active
  'active:text-gold': 'active:text-champagne',
  'active:bg-gold': 'active:bg-champagne',
  'active:border-gold': 'active:border-champagne',
  
  // Variações específicas com números em várias combinações
  'text-gold-50': 'text-champagne-50',
  'text-gold-100': 'text-champagne-100',
  'text-gold-200': 'text-champagne-200',
  'text-gold-300': 'text-champagne-300',
  'text-gold-400': 'text-champagne-400',
  'text-gold-500': 'text-champagne-500',
  'text-gold-600': 'text-champagne-600',
  'text-gold-700': 'text-champagne-700',
  'text-gold-800': 'text-champagne-800',
  'text-gold-900': 'text-champagne-900',
  
  'bg-gold-50': 'bg-champagne-50',
  'bg-gold-100': 'bg-champagne-100',
  'bg-gold-200': 'bg-champagne-200',
  'bg-gold-300': 'bg-champagne-300',
  'bg-gold-400': 'bg-champagne-400',
  'bg-gold-500': 'bg-champagne-500',
  'bg-gold-600': 'bg-champagne-600',
  'bg-gold-700': 'bg-champagne-700',
  'bg-gold-800': 'bg-champagne-800',
  'bg-gold-900': 'bg-champagne-900',
  
  'border-gold-50': 'border-champagne-50',
  'border-gold-100': 'border-champagne-100',
  'border-gold-200': 'border-champagne-200',
  'border-gold-300': 'border-champagne-300',
  'border-gold-400': 'border-champagne-400',
  'border-gold-500': 'border-champagne-500',
  'border-gold-600': 'border-champagne-600',
  'border-gold-700': 'border-champagne-700',
  'border-gold-800': 'border-champagne-800',
  'border-gold-900': 'border-champagne-900',
  
  'ring-gold-50': 'ring-champagne-50',
  'ring-gold-100': 'ring-champagne-100',
  'ring-gold-200': 'ring-champagne-200',
  'ring-gold-300': 'ring-champagne-300',
  'ring-gold-400': 'ring-champagne-400',
  'ring-gold-500': 'ring-champagne-500',
  'ring-gold-600': 'ring-champagne-600',
  'ring-gold-700': 'ring-champagne-700',
  'ring-gold-800': 'ring-champagne-800',
  'ring-gold-900': 'ring-champagne-900',
  
  'fill-gold-50': 'fill-champagne-50',
  'fill-gold-100': 'fill-champagne-100',
  'fill-gold-200': 'fill-champagne-200',
  'fill-gold-300': 'fill-champagne-300',
  'fill-gold-400': 'fill-champagne-400',
  'fill-gold-500': 'fill-champagne-500',
  'fill-gold-600': 'fill-champagne-600',
  'fill-gold-700': 'fill-champagne-700',
  'fill-gold-800': 'fill-champagne-800',
  'fill-gold-900': 'fill-champagne-900',
  
  // Comentários em código
  'Dourado': 'Champagne Gold',
  'dourado': 'champagne gold',
};

// Função para aplicar substituições em um arquivo
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Realizar substituições
    Object.entries(colorMapping).forEach(([oldColor, newColor]) => {
      const regex = new RegExp(oldColor, 'g');
      if (content.match(regex)) {
        content = content.replace(regex, newColor);
        updated = true;
      }
    });

    // Salvar o arquivo se houve alterações
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Atualizado: ${filePath}`);
    }
  } catch (error) {
    console.error(`Erro ao processar o arquivo ${filePath}:`, error);
  }
}

// Encontrar todos os arquivos relevantes
const srcFiles = await glob('src/**/*.{tsx,ts,jsx,js}');

// Aplicar substituições em cada arquivo
srcFiles.forEach(updateFile);

console.log('Processo de atualização de cores concluído!'); 