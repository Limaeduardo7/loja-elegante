import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
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
          <button onClick={() => navigate('/')} className="hover:text-gold-500 transition-colors">
            Início
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Contato</span>
        </div>

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light mb-6 text-gray-900">
            Entre em <span className="text-gold-500">Contato</span>
          </h1>
          <p className="max-w-3xl mx-auto text-gray-600 font-light leading-relaxed">
            Estamos à disposição para atender suas dúvidas, sugestões ou agendamentos.
            Ficaremos felizes em ajudar e responderemos o mais breve possível.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 mb-20">
          {/* Informações de Contato */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm h-full border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <h2 className="text-2xl font-light mb-10 text-gray-900 border-b border-gray-200 pb-4">
                <span className="text-gold-500">Nossos</span> Contatos
              </h2>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-full shadow-sm mr-5 border border-gray-100">
                    <MapPin className="h-6 w-6 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 text-lg">Endereço</h3>
                    <p className="text-gray-600 font-light leading-relaxed">
                      Av. Paulista, 1000<br />
                      Bela Vista, São Paulo - SP<br />
                      CEP: 01310-100
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-full shadow-sm mr-5 border border-gray-100">
                    <Phone className="h-6 w-6 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 text-lg">Telefone</h3>
                    <p className="text-gray-600 font-light leading-relaxed">
                      <a href="tel:+551134567890" className="hover:text-gold-500 transition-colors">(11) 3456-7890</a><br />
                      <a href="tel:+5511987654321" className="hover:text-gold-500 transition-colors">(11) 98765-4321</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-full shadow-sm mr-5 border border-gray-100">
                    <Mail className="h-6 w-6 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2 text-lg">Email</h3>
                    <p className="text-gray-600 font-light leading-relaxed">
                      <a href="mailto:contato@uselamone.com.br" className="hover:text-gold-500 transition-colors">contato@uselamone.com.br</a><br />
                      <a href="mailto:atendimento@uselamone.com.br" className="hover:text-gold-500 transition-colors">atendimento@uselamone.com.br</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-full shadow-sm mr-5 border border-gray-100">
                    <Clock className="h-6 w-6 text-gold-500" />
                  </div>
                  <div>
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
                <h3 className="font-medium text-gray-900 mb-4 text-lg">Redes Sociais</h3>
                <div className="flex space-x-4">
                  <a 
                    href="#" 
                    className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center transition-all hover:shadow-md hover:bg-gold-50 border border-gray-100"
                    aria-label="Facebook"
                  >
                    <svg className="h-5 w-5 text-gold-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
                    </svg>
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center transition-all hover:shadow-md hover:bg-gold-50 border border-gray-100"
                    aria-label="Instagram"
                  >
                    <svg className="h-5 w-5 text-gold-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path>
                    </svg>
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center transition-all hover:shadow-md hover:bg-gold-50 border border-gray-100"
                    aria-label="Twitter"
                  >
                    <svg className="h-5 w-5 text-gold-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                    </svg>
                  </a>
                  <a 
                    href="#" 
                    className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center transition-all hover:shadow-md hover:bg-gold-50 border border-gray-100"
                    aria-label="LinkedIn"
                  >
                    <svg className="h-5 w-5 text-gold-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
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
                <span className="text-gold-500">Envie sua</span> mensagem
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
                      Nome completo <span className="text-gold-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all shadow-sm hover:border-gold-200"
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email <span className="text-gold-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all shadow-sm hover:border-gold-200"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all shadow-sm hover:border-gold-200"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Assunto <span className="text-gold-500">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all shadow-sm hover:border-gold-200 bg-white"
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
                    Mensagem <span className="text-gold-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all shadow-sm hover:border-gold-200"
                    placeholder="Digite sua mensagem aqui..."
                    required
                  ></textarea>
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="py-4 px-8 bg-gold-500 hover:bg-gold-600 text-white text-base font-light tracking-wide shadow-sm w-full md:w-auto transition-all"
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
        
        {/* Mapa */}
        <div className="mb-16">
          <h2 className="text-2xl font-light mb-8 text-gray-900 text-center">Nossa Localização</h2>
          <div className="rounded-lg overflow-hidden shadow-md h-[450px] border border-gray-100">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.0976780791245!2d-46.65604402386086!3d-23.56343726153154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1710190284270!5m2!1spt-BR!2sbr" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização da loja Use Lamone"
            ></iframe>
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