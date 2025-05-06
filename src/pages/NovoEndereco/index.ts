// Tenta importar o componente principal
import NovoEnderecoOriginal from '../NovoEndereco';
import NovoEnderecoSimplificado from './NovoEnderecoSimplificado';

// Verifica se o componente original está disponível
let ComponenteExportado = NovoEnderecoOriginal;

// Usa componente simplificado como fallback
if (!ComponenteExportado) {
  console.error('NovoEndereco original não disponível, usando versão simplificada');
  ComponenteExportado = NovoEnderecoSimplificado;
}

// Exporta um único componente default
export default ComponenteExportado; 