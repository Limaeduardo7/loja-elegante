const categories = [
  {
    id: 1,
    name: 'Vestidos de Gala',
    image: 'https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?q=80&w=1587',
    description: 'Elegância e sofisticação para suas ocasiões especiais'
  },
  {
    id: 2,
    name: 'Coleção Casual Chic',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1587',
    description: 'Peças exclusivas para seu dia a dia com estilo'
  },
  {
    id: 3,
    name: 'Acessórios Premium',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=1587',
    description: 'O toque final que complementa qualquer produção'
  }
];

const Categories = () => {
  return (
    <section className="bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {categories.map((category) => (
            <div key={category.id} className="relative group overflow-hidden h-[90vh]">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              />
              
              <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300 flex flex-col justify-end p-6">
                <div className="transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                  <h3 className="text-2xl font-light text-white mb-2 tracking-wider">{category.name}</h3>
                  <p className="text-white text-sm font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-4">{category.description}</p>
                  <button className="bg-gold-500 hover:bg-gold-600 text-white py-2 px-6 inline-block transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 font-light">
                    Explorar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories; 