import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { getCategories } from '../lib/services/categoryService';
import { Category } from '../types/product';

interface CategoryDropdownProps {
  isMobile?: boolean;
  onSelect?: () => void;
  onShowingSubcategories?: (showing: boolean) => void;
}

const CategoryDropdown = ({ isMobile = false, onSelect, onShowingSubcategories }: CategoryDropdownProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isOpen, setIsOpen] = useState(!isMobile);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await getCategories();
      if (data && !error) {
        // Filtrar apenas categorias principais (sem parent_id)
        const mainCategories = data.filter((category: Category) => !category.parent_id);
        setCategories(mainCategories);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (onShowingSubcategories) {
      onShowingSubcategories(!!selectedCategory);
    }
  }, [selectedCategory, onShowingSubcategories]);

  const handleMouseEnter = () => {
    if (!isMobile) setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile) setIsOpen(false);
  };

  const handleLinkClick = () => {
    setSelectedCategory(null);
    setIsOpen(false);
    if (onSelect) onSelect();
  };

  const handleCategoryClick = (category: Category) => {
    if (isMobile && category.subcategories && category.subcategories.length > 0) {
      setSelectedCategory(category);
    } else {
      handleLinkClick();
    }
  };

  const handleBackClick = () => {
    setSelectedCategory(null);
  };

  if (isMobile) {
    return (
      <div className="w-full">
        <div className="space-y-2 text-center">
          {selectedCategory ? (
            // Exibição de subcategorias
            <div className="bg-white">
              <button
                onClick={handleBackClick}
                className="flex items-center text-black hover:text-champagne-500 transition-colors mb-6"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Voltar</span>
              </button>
              <h3 className="text-xl font-medium mb-6">{selectedCategory.name}</h3>
              <div className="space-y-4">
                {selectedCategory.subcategories?.map((sub: Category) => (
                  <Link
                    key={sub.id}
                    to={`/colecao?categoria=${sub.slug}`}
                    className="block py-2 text-black hover:text-champagne-500 transition-colors"
                    onClick={handleLinkClick}
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            // Lista principal de categorias
            categories.map((category) => (
              <div key={category.id} className="py-2">
                {category.subcategories && category.subcategories.length > 0 ? (
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className="w-full flex items-center justify-center text-black hover:text-champagne-500 transition-colors"
                  >
                    <span>{category.name}</span>
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <Link
                    to={`/colecao?categoria=${category.slug}`}
                    className="block text-black hover:text-champagne-500 transition-colors"
                    onClick={handleLinkClick}
                  >
                    {category.name}
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Versão Desktop
  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="font-light flex items-center space-x-1 text-black hover:text-champagne-500 transition-colors">
        <span>Categorias</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white shadow-lg rounded-md py-2 z-50">
          {categories.map((category) => (
            <div key={category.id} className="group">
              <Link
                to={`/colecao?categoria=${category.slug}`}
                className="block px-4 py-2 text-black hover:text-champagne-500 hover:bg-gray-50 transition-colors font-medium"
                onClick={handleLinkClick}
              >
                {category.name}
              </Link>
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="pl-4">
                  {category.subcategories.map((sub: Category) => (
                    <Link
                      key={sub.id}
                      to={`/colecao?categoria=${sub.slug}`}
                      className="block px-4 py-1 text-gray-600 hover:text-champagne-500 hover:bg-gray-50 transition-colors"
                      onClick={handleLinkClick}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;