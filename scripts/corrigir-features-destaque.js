/**
 * Script para corrigir o campo features em produtos marcados como destaque
 * 
 * Este script busca todos os produtos que possuem is_featured=true e adiciona
 * o valor "destaque" ao array features, garantindo que apareçam corretamente
 * na seção de produtos em destaque.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Conectar ao Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Verificar a conexão
const verificarConexao = async () => {
  try {
    const { data, error } = await supabase.from('products').select('id');
    if (error) throw error;
    console.log('✅ Conexão com Supabase estabelecida. Total de produtos:', data?.length || 0);
  } catch (err) {
    console.error('❌ Erro na conexão com Supabase:', err);
    process.exit(1);
  }
};

// Corrigir campo features
const corrigirFeatures = async () => {
  try {
    console.log('🔎 Buscando produtos...');
    
    // Buscar todos os produtos
    const { data: produtos, error } = await supabase
      .from('products')
      .select('id, name, features, is_featured')
      .eq('is_active', true);
    
    if (error) throw error;
    
    console.log(`📊 Total de produtos ativos: ${produtos.length}`);
    
    // Verificar produtos em destaque
    const produtosDestaque = produtos.filter(p => p.is_featured === true);
    console.log(`🌟 Produtos marcados como is_featured=true: ${produtosDestaque.length}`);
    
    // Verificar produtos que já têm destaque nas features
    const produtosJaComDestaque = produtos.filter(p => 
      Array.isArray(p.features) && p.features.includes('destaque')
    );
    console.log(`✨ Produtos com 'destaque' no array features: ${produtosJaComDestaque.length}`);
    
    // Produtos para corrigir: têm is_featured=true mas não têm "destaque" nas features
    const produtosParaCorrigir = produtosDestaque.filter(p => 
      !Array.isArray(p.features) || !p.features.includes('destaque')
    );
    
    console.log(`🔧 Produtos a corrigir: ${produtosParaCorrigir.length}`);
    
    // Para fins de teste: marcar alguns produtos como destaque se não houver nenhum
    if (produtosJaComDestaque.length === 0) {
      console.log('🚀 Nenhum produto em destaque encontrado. Marcando alguns produtos para fins de teste...');
      
      // Pegar até 4 produtos aleatórios para marcar como destaque
      const produtosParaDestacar = produtos
        .sort(() => 0.5 - Math.random()) // Embaralhar
        .slice(0, 4); // Pegar os 4 primeiros
      
      console.log(`🔍 Selecionados ${produtosParaDestacar.length} produtos para marcar como destaque:`);
      produtosParaDestacar.forEach(p => {
        console.log(`- ${p.id}: ${p.name}`);
      });
      
      // Marcar produtos como destaque
      for (const produto of produtosParaDestacar) {
        let novasFeatures = [];
        
        if (Array.isArray(produto.features)) {
          novasFeatures = [...produto.features, 'destaque'];
        } else if (typeof produto.features === 'string') {
          try {
            const featuresObj = JSON.parse(produto.features);
            if (Array.isArray(featuresObj)) {
              novasFeatures = [...featuresObj, 'destaque'];
            } else {
              novasFeatures = ['destaque'];
            }
          } catch {
            novasFeatures = ['destaque'];
          }
        } else {
          novasFeatures = ['destaque'];
        }
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ features: novasFeatures })
          .eq('id', produto.id);
        
        if (updateError) {
          console.error(`❌ Erro ao marcar produto ${produto.id} como destaque:`, updateError);
        } else {
          console.log(`✅ Produto ${produto.id} marcado como destaque`);
        }
      }
      
      return;
    }
    
    if (produtosParaCorrigir.length === 0) {
      console.log('✅ Nenhum produto precisa ser corrigido!');
      return;
    }
    
    // Solicitar confirmação
    console.log('\nProdutos que serão atualizados:');
    produtosParaCorrigir.forEach(p => {
      console.log(`- ${p.id}: ${p.name} (features atuais: ${JSON.stringify(p.features)})`);
    });
    
    // Atualizar produtos
    console.log('\n🔄 Atualizando produtos...');
    
    let sucessos = 0;
    let falhas = 0;
    
    for (const produto of produtosParaCorrigir) {
      // Preparar novas features
      let novasFeatures = [];
      
      if (Array.isArray(produto.features)) {
        novasFeatures = [...produto.features, 'destaque'];
      } else if (typeof produto.features === 'string') {
        try {
          const featuresObj = JSON.parse(produto.features);
          if (Array.isArray(featuresObj)) {
            novasFeatures = [...featuresObj, 'destaque'];
          } else {
            novasFeatures = ['destaque'];
          }
        } catch {
          novasFeatures = ['destaque'];
        }
      } else {
        novasFeatures = ['destaque'];
      }
      
      // Atualizar no banco
      const { error: updateError } = await supabase
        .from('products')
        .update({ features: novasFeatures })
        .eq('id', produto.id);
      
      if (updateError) {
        console.error(`❌ Erro ao atualizar produto ${produto.id}: ${updateError.message}`);
        falhas++;
      } else {
        console.log(`✅ Produto ${produto.id} atualizado: ${JSON.stringify(novasFeatures)}`);
        sucessos++;
      }
    }
    
    console.log(`\n📝 Resumo: ${sucessos} produtos atualizados, ${falhas} falhas`);
    
  } catch (err) {
    console.error('❌ Erro ao corrigir features:', err);
  }
};

// Executar
(async () => {
  try {
    await verificarConexao();
    await corrigirFeatures();
    console.log('✅ Script concluído com sucesso!');
  } catch (err) {
    console.error('❌ Erro durante execução do script:', err);
  }
})(); 