import { supabase } from '../supabase';

interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  code: string;
}

export const promotionService = {
  /**
   * Valida e retorna uma promoção pelo código
   * @param code Código da promoção
   * @returns Promoção válida ou null se não encontrada/inválida
   */
  async validatePromotionCode(code: string): Promise<Promotion | null> {
    try {
      const { data: promotion, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !promotion) {
        console.error('Erro ao validar código promocional:', error);
        return null;
      }

      // Verifica se a promoção está dentro do período válido
      const now = new Date();
      const startDate = new Date(promotion.start_date);
      const endDate = new Date(promotion.end_date);

      if (now < startDate || now > endDate) {
        console.log('Promoção fora do período válido');
        return null;
      }

      return promotion;
    } catch (error) {
      console.error('Erro ao validar promoção:', error);
      return null;
    }
  },

  /**
   * Calcula o valor do desconto para um determinado valor
   * @param promotion Promoção a ser aplicada
   * @param originalValue Valor original
   * @returns Valor do desconto
   */
  calculateDiscount(promotion: Promotion, originalValue: number): number {
    if (promotion.discount_type === 'percentage') {
      return (originalValue * promotion.discount_value) / 100;
    } else {
      // Para desconto fixo, não pode ser maior que o valor original
      return Math.min(promotion.discount_value, originalValue);
    }
  },

  /**
   * Aplica uma promoção a um valor
   * @param promotion Promoção a ser aplicada
   * @param originalValue Valor original
   * @returns Valor com desconto aplicado
   */
  applyDiscount(promotion: Promotion, originalValue: number): number {
    const discountValue = this.calculateDiscount(promotion, originalValue);
    return Math.max(0, originalValue - discountValue);
  }
}; 