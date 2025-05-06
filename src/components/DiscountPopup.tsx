import React, { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';

const DiscountPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    email: ''
  });
  const [step, setStep] = useState(1); // 1: form, 2: success
  const [errors, setErrors] = useState({
    fullName: '',
    birthDate: '',
    email: ''
  });

  useEffect(() => {
    // Verificar se o popup já foi mostrado/fechado antes
    const hasSeenPopup = localStorage.getItem('discount_popup_shown');
    
    if (!hasSeenPopup) {
      // Mostrar o popup após 5 segundos
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo que está sendo preenchido
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };
    
    // Validar nome
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome é obrigatório';
      isValid = false;
    }
    
    // Validar data de nascimento
    if (!formData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
      isValid = false;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Salvar dados no localStorage (pode ser substituído por API real)
      localStorage.setItem('discount_user_data', JSON.stringify(formData));
      
      // Avançar para a tela de sucesso
      setStep(2);
      
      // Gerar código de cupom (exemplo simples)
      const couponCode = 'USELAMONE10';
      localStorage.setItem('discount_coupon', couponCode);
    }
  };

  const closePopup = () => {
    setIsOpen(false);
    // Marcar que o popup foi mostrado
    localStorage.setItem('discount_popup_shown', 'true');
  };

  // Se o popup não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative overflow-hidden">
        {/* Botão de fechar */}
        <button 
          onClick={closePopup}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Fechar"
        >
          <X size={24} />
        </button>
        
        {/* Cabeçalho */}
        <div className="bg-champagne-500 text-white p-6 text-center">
          <Gift className="mx-auto mb-3 h-12 w-12" />
          <h2 className="text-2xl font-light mb-2">GANHE 10% DE DESCONTO</h2>
          <p className="font-light">na sua primeira compra!</p>
        </div>
        
        {step === 1 ? (
          /* Formulário */
          <div className="p-6">
            <p className="text-gray-700 text-center mb-6">
              Preencha o formulário abaixo para receber seu cupom exclusivo de 10% OFF
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo:
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-champagne-500 focus:border-transparent ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Seu nome completo"
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
              </div>
              
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Nascimento:
                </label>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-champagne-500 focus:border-transparent ${
                    errors.birthDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.birthDate && <p className="mt-1 text-xs text-red-500">{errors.birthDate}</p>}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail:
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-champagne-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="seu.email@exemplo.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-champagne-500 hover:bg-champagne-600 text-white py-3 rounded-md transition-colors font-medium"
                >
                  QUERO MEU DESCONTO
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Seus dados estão seguros conosco. Não compartilhamos suas informações.
              </p>
            </form>
          </div>
        ) : (
          /* Tela de Sucesso */
          <div className="p-6 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Parabéns!</h3>
              <p className="text-gray-600 mb-6">
                Seu cupom de 10% de desconto foi gerado com sucesso.
                Use o código abaixo na sua primeira compra:
              </p>
            </div>
            
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-xl font-medium text-champagne-600 tracking-wider">USELAMONE10</p>
            </div>
            
            <button
              onClick={closePopup}
              className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-md transition-colors font-medium"
            >
              CONTINUAR COMPRANDO
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountPopup; 