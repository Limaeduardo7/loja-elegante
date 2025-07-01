import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulando envio do formulário
    setTimeout(() => {
      console.log('Formulário enviado:', formData);
      setIsSubmitting(false);
      setSubmitted(true);
      
      // Resetar formulário após envio
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Remover mensagem de sucesso após 5 segundos
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 pb-16 pt-28 md:pt-32">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-champagne-500 transition-colors">
            Início
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Contato</span>
        </div>

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light mb-6 text-gray-900">
            Entre em <span className="text-rose-300">Contato</span>
          </h1>
          <p className="max-w-3xl mx-auto text-gray-600 font-light leading-relaxed">
            Estamos à disposição para atender suas dúvidas, sugestões ou agendamentos.
            Ficaremos felizes em ajudar e responderemos o mais breve possível.
          </p>
        </div>

        {/* Botões de ação rápida */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <a 
            href="https://wa.me/5511990012305?text=Olá!%20Gostaria%20de%20fazer%20uma%20compra." 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-black text-white py-4 px-6 rounded-md flex items-center justify-center hover:bg-gray-800 transition-colors duration-300"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Compre pelo WhatsApp
          </a>
          <a 
            href="/ajuda" 
            className="bg-black text-white py-4 px-6 rounded-md flex items-center justify-center hover:bg-gray-800 transition-colors duration-300"
          >
            <HelpCircle className="mr-2 h-5 w-5" />
            Ajuda
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 mb-20">
          {/* Informações de Contato */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm h-full border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <h2 className="text-2xl font-light mb-10 text-gray-900 border-b border-gray-200 pb-4 text-left">
                <span className="text-champagne-500">Nossos</span> Contatos
              </h2>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-full shadow-sm mr-5 border border-gray-100">
                    <MapPin className="h-6 w-6 text-champagne-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900 mb-2 text-lg">Endereço</h3>
                    <p className="text-gray-600 font-light leading-relaxed">
                      São Paulo - SP
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-full shadow-sm mr-5 border border-gray-100">
                    <Phone className="h-6 w-6 text-champagne-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900 mb-2 text-lg">Telefone</h3>
                    <p className="text-gray-600 font-light leading-relaxed">
                      <a href="tel:+5511990012305" className="hover:text-champagne-500 transition-colors">WhatsApp: (11) 99001-2305</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-full shadow-sm mr-5 border border-gray-100">
                    <Mail className="h-6 w-6 text-rose-300" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900 mb-2 text-lg">Email</h3>
                    <p className="text-gray-600 font-light leading-relaxed">
                      <a href="mailto:contato@uselamone.com.br" className="hover:text-rose-400 transition-colors">contato@uselamone.com.br</a><br />
                      <a href="mailto:atendimento@uselamone.com.br" className="hover:text-rose-400 transition-colors">atendimento@uselamone.com.br</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-full shadow-sm mr-5 border border-gray-100">
                    <Clock className="h-6 w-6 text-champagne-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900 mb-2 text-lg">Horário de Atendimento</h3>
                    <p className="text-gray-600 font-light leading-relaxed">
                      Segunda a Sexta: 9h às 18h<br />
                      Sábado: 10h às 15h<br />
                      Domingo: Fechado
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4 text-lg text-left">Redes Sociais</h3>
                <div className="flex space-x-4">
                  <a 
                    href="https://www.facebook.com/profile.php?id=100084470989204&mibextid=ZbWKwL" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center transition-all hover:shadow-md hover:bg-champagne-50 border border-gray-100"
                    aria-label="Facebook"
                  >
                    <svg className="h-5 w-5 text-champagne-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
                    </svg>
                  </a>
                  <a 
                    href="https://www.instagram.com/uselamone" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center transition-all hover:shadow-md hover:bg-champagne-50 border border-gray-100"
                    aria-label="Instagram"
                  >
                    <svg className="h-5 w-5 text-champagne-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path>
                    </svg>
                  </a>
                  <a 
                    href="https://www.tiktok.com/@use.lamone1?_t=ZM-8vyXqazzs9O&_r=1" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center transition-all hover:shadow-md hover:bg-champagne-50 border border-gray-100"
                    aria-label="TikTok"
                  >
                    <svg className="h-5 w-5 text-champagne-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Formulário de Contato */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-2xl font-light mb-10 text-gray-900 border-b border-gray-200 pb-4">
                <span className="text-rose-300">Envie sua</span> mensagem
              </h2>
              
              {submitted && (
                <div className="bg-green-50 border border-green-100 text-green-700 px-5 py-4 rounded-lg mb-8 flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Sua mensagem foi enviada com sucesso! Entraremos em contato em breve.</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nome completo <span className="text-champagne-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-champagne-500 focus:border-transparent outline-none transition-all shadow-sm hover:border-champagne-200"
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email <span className="text-champagne-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-champagne-500 focus:border-transparent outline-none transition-all shadow-sm hover:border-champagne-200"
                      placeholder="seu.email@exemplo.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-champagne-500 focus:border-transparent outline-none transition-all shadow-sm hover:border-champagne-200"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Assunto <span className="text-champagne-500">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-champagne-500 focus:border-transparent outline-none transition-all shadow-sm hover:border-champagne-200 bg-white"
                      required
                    >
                      <option value="">Selecione o assunto</option>
                      <option value="Dúvida sobre produto">Dúvida sobre produto</option>
                      <option value="Informações de compra">Informações de compra</option>
                      <option value="Suporte ao cliente">Suporte ao cliente</option>
                      <option value="Parceria/Revenda">Parceria/Revenda</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Mensagem <span className="text-champagne-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-champagne-500 focus:border-transparent outline-none transition-all shadow-sm hover:border-champagne-200"
                    placeholder="Digite sua mensagem aqui..."
                    required
                  ></textarea>
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="py-4 px-8 bg-rose-300 hover:bg-rose-400 text-white text-base font-light tracking-wide shadow-sm w-full md:w-auto transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Send className="mr-2 h-5 w-5" /> Enviar mensagem
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* FAQs */}
        <div>
          <h2 className="text-2xl font-light mb-8 text-gray-900 text-center">Perguntas Frequentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:shadow-sm transition-all">
              <h3 className="text-lg font-medium mb-3 text-gray-900">Qual o prazo de entrega?</h3>
              <p className="font-light text-gray-700">
                Nosso prazo de entrega varia de acordo com a região, mas geralmente é de 2 a 7 dias úteis 
                após a confirmação do pagamento. Você pode acompanhar seu pedido através do código de 
                rastreamento que enviamos por email.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:shadow-sm transition-all">
              <h3 className="text-lg font-medium mb-3 text-gray-900">Como faço para trocar um produto?</h3>
              <p className="font-light text-gray-700">
                Você tem até 30 dias para solicitar a troca do produto. Entre em contato conosco 
                pelo email atendimento@uselamone.com.br ou pelo telefone (11) 3456-7890 para iniciar 
                o processo.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:shadow-sm transition-all">
              <h3 className="text-lg font-medium mb-3 text-gray-900">Quais são as formas de pagamento?</h3>
              <p className="font-light text-gray-700">
                Aceitamos cartões de crédito (parcelamos em até 10x sem juros), boleto bancário, 
                transferência via PIX e pagamento via PayPal.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:shadow-sm transition-all">
              <h3 className="text-lg font-medium mb-3 text-gray-900">Vocês têm loja física?</h3>
              <p className="font-light text-gray-700">
                Sim, temos nossa loja principal na Av. Paulista, 1000, em São Paulo. Além disso, 
                temos pontos de venda em shoppings selecionados. Consulte a lista completa em 
                nosso site.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 