const PromoBanner = () => {
  return (
    <section className="bg-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row gap-0">
          {/* Banner principal */}
          <div className="md:w-2/3 relative overflow-hidden group">
            <div className="h-[90vh] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070" 
                alt="Coleção Premium" 
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-102"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-8">
              <div className="transform transition-transform duration-300">
                <span className="bg-gold-500 text-white text-sm px-3 py-1 mb-4 inline-block font-light">NOVIDADE</span>
                <h3 className="text-3xl md:text-4xl font-light text-white mb-3 tracking-wider">Coleção Outono <span className="text-gold-400">2025</span></h3>
                <button className="bg-white hover:bg-gold-400 text-black hover:text-white py-3 px-8 inline-block transition-colors duration-300 font-light">
                  Explorar Coleção
                </button>
              </div>
            </div>
          </div>
          
          {/* Banners verticais laterais */}
          <div className="md:w-1/3 flex flex-col gap-0">
            <div className="relative overflow-hidden group h-[45vh]">
              <img 
                src="https://images.unsplash.com/photo-1722340321190-1c7b7384e89b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Acessórios de Luxo" 
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-6">
                <div>
                  <h3 className="text-xl font-light text-white mb-2 tracking-wider">Acessórios <span className="text-gold-400">Premium</span></h3>
                  <button className="text-white hover:text-gold-400 text-sm font-light flex items-center transition-colors duration-300">
                    Ver Coleção
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden group h-[45vh]">
              <img 
                src="https://images.unsplash.com/photo-1632761298177-51e35403e27e?q=80&w=1952&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Calçados Exclusivos" 
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-6">
                <div>
                  <h3 className="text-xl font-light text-white mb-2 tracking-wider">Calçados <span className="text-gold-400">Exclusivos</span></h3>
                  <button className="text-white hover:text-gold-400 text-sm font-light flex items-center transition-colors duration-300">
                    Ver Coleção
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner; 