import React, { useState, useEffect, useRef } from 'react';

const SearchableSelect = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder, 
  renderOption, 
  required 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  // Seguridad: Validamos que options sea un array antes de usar .find
  const safeOptions = Array.isArray(options) ? options : [];
  const selectedOption = safeOptions.find(opt => opt.id?.toString() === value?.toString());

  const filteredOptions = safeOptions.filter(opt => {
    const searchLower = searchTerm.toLowerCase();
    return renderOption(opt).toLowerCase().includes(searchLower);
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          value={isOpen ? searchTerm : (selectedOption ? renderOption(selectedOption) : '')}
          onClick={() => setIsOpen(!isOpen)}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          readOnly={!isOpen}
        />
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl max-h-60">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option.id}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-blue-50 ${
                    value?.toString() === option.id?.toString() ? 'bg-blue-100 font-semibold text-blue-700' : 'text-gray-700'
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {renderOption(option)}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 italic">No se encontraron resultados</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableSelect;