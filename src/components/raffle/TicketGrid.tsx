import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, Filter, ShoppingCart, Eye, Check, X, Grid3X3, List, Zap } from 'lucide-react';

interface TicketGridProps {
  total: number;
  soldCount: number;
  selectedNumbers: number[];
  onToggle: (n: number) => void;
  className?: string;
}

type FilterTab = 'all' | 'available' | 'selected';
type ViewMode = 'grid' | 'list';

interface TicketState {
  number: number;
  isAvailable: boolean;
  isSelected: boolean;
}

const TicketGrid: React.FC<TicketGridProps> = ({ 
  total, 
  soldCount, 
  selectedNumbers, 
  onToggle, 
  className = "" 
}) => {
  // Estados principales
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isSearching, setIsSearching] = useState(false);
  
  // Refs para scroll y virtual
  const gridRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const ITEMS_PER_PAGE = 200;
  const GRID_COLS_MOBILE = 8;
  const GRID_COLS_DESKTOP = 12;

  // Generación determinista de números ocupados
  const occupiedNumbers = useMemo(() => {
    const occupied = new Set<number>();
    let seed = 12345; // Seed fijo para consistencia
    
    // Simple LCG (Linear Congruential Generator)
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 2147483648;
      return seed / 2147483648;
    };

    const targetOccupied = Math.min(soldCount, total);
    
    while (occupied.size < targetOccupied) {
      const randomNumber = Math.floor(random() * total);
      occupied.add(randomNumber);
    }
    
    return occupied;
  }, [soldCount, total]);

  // Generar array de tickets con estado
  const allTickets = useMemo((): TicketState[] => {
    return Array.from({ length: total }, (_, i) => ({
      number: i,
      isAvailable: !occupiedNumbers.has(i),
      isSelected: selectedNumbers.includes(i)
    }));
  }, [total, occupiedNumbers, selectedNumbers]);

  // Filtrar tickets según tab activo y búsqueda
  const filteredTickets = useMemo(() => {
    let filtered = allTickets;

    // Filtro por tab
    switch (activeTab) {
      case 'available':
        filtered = filtered.filter(ticket => ticket.isAvailable);
        break;
      case 'selected':
        filtered = filtered.filter(ticket => ticket.isSelected);
        break;
      // 'all' no necesita filtro
    }

    // Filtro por búsqueda
    if (searchTerm) {
      const search = searchTerm.padStart(4, '0');
      filtered = filtered.filter(ticket => 
        ticket.number.toString().padStart(4, '0').includes(search)
      );
    }

    return filtered;
  }, [allTickets, activeTab, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const currentTickets = filteredTickets.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Handlers
  const handleTicketClick = useCallback((ticketNumber: number, event?: React.MouseEvent) => {
    const ticket = allTickets.find(t => t.number === ticketNumber);
    if (!ticket?.isAvailable) return;

    // Selección múltiple con Ctrl/Cmd
    if (event && (event.ctrlKey || event.metaKey)) {
      onToggle(ticketNumber);
      return;
    }

    onToggle(ticketNumber);
  }, [allTickets, onToggle]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
    setIsSearching(true);
    
    // Simular delay de búsqueda
    setTimeout(() => setIsSearching(false), 300);
  }, []);

  const handleTabChange = useCallback((tab: FilterTab) => {
    setActiveTab(tab);
    setCurrentPage(0);
    setSearchTerm('');
  }, []);

  const jumpToNumber = useCallback((number: number) => {
    const index = filteredTickets.findIndex(t => t.number === number);
    if (index !== -1) {
      const page = Math.floor(index / ITEMS_PER_PAGE);
      setCurrentPage(page);
    }
  }, [filteredTickets]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchTerm('');
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Componente de Ticket individual
  const TicketItem: React.FC<{ ticket: TicketState; onClick: (e?: React.MouseEvent) => void }> = React.memo(({ ticket, onClick }) => {
    const formattedNumber = ticket.number.toString().padStart(4, '0');
    
    return (
      <div
        onClick={ticket.isAvailable ? onClick : undefined}
        className={`
          relative flex items-center justify-center text-sm font-mono font-medium
          rounded-lg border-2 transition-all duration-200 cursor-pointer
          ${viewMode === 'grid' ? 'aspect-square' : 'py-2 px-3'}
          ${!ticket.isAvailable 
            ? 'bg-red-100 border-red-300 text-red-500 cursor-not-allowed line-through' 
            : ticket.isSelected
              ? 'bg-blue-900 border-blue-900 text-white shadow-lg scale-105'
              : 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100 hover:border-green-300 hover:shadow-md'
          }
          ${ticket.isAvailable ? 'hover:scale-105 active:scale-95' : ''}
        `}
        title={
          !ticket.isAvailable 
            ? `Número ${formattedNumber} - Ocupado`
            : ticket.isSelected
              ? `Número ${formattedNumber} - Seleccionado`
              : `Número ${formattedNumber} - Disponible`
        }
      >
        {ticket.isSelected && (
          <Check className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-blue-900 rounded-full p-0.5" />
        )}
        {!ticket.isAvailable && viewMode === 'grid' && (
          <X className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full p-0.5" />
        )}
        <span className={viewMode === 'list' ? 'mr-2' : ''}>{formattedNumber}</span>
        {viewMode === 'list' && (
          <span className="text-xs opacity-75">
            {!ticket.isAvailable ? '(Ocupado)' : ticket.isSelected ? '(Seleccionado)' : '(Disponible)'}
          </span>
        )}
      </div>
    );
  });

  const stats = {
    available: allTickets.filter(t => t.isAvailable).length,
    occupied: occupiedNumbers.size,
    selected: selectedNumbers.length
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 ${className}`} id="ticket-grid">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              <Grid3X3 className="w-6 h-6" />
              Selecciona tus números
            </h2>
            <p className="text-gray-600 mt-1">
              Elige los números de tu suerte para la rifa
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-green-600">{stats.available.toLocaleString()}</div>
              <div className="text-gray-500">Disponibles</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-600">{stats.occupied.toLocaleString()}</div>
              <div className="text-gray-500">Ocupados</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-600">{stats.selected.toLocaleString()}</div>
              <div className="text-gray-500">Seleccionados</div>
            </div>
          </div>
        </div>

        {/* Búsqueda y controles */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar número (ej: 1234) o presiona '/'"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={4}
            />
            {isSearching && <Zap className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              <span className="hidden sm:inline">{viewMode === 'grid' ? 'Lista' : 'Grid'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <div className="flex">
          {[
            { id: 'all', label: 'Todos', count: total },
            { id: 'available', label: 'Disponibles', count: stats.available },
            { id: 'selected', label: 'Mis boletos', count: stats.selected }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as FilterTab)}
              className={`
                flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 rounded-full">
                {tab.count.toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid de boletos */}
      <div className="p-4 sm:p-6">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No se encontraron boletos</p>
            {searchTerm && (
              <button
                onClick={() => handleSearch('')}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            <div 
              ref={gridRef}
              className={`
                ${viewMode === 'grid' 
                  ? `grid gap-2 sm:gap-3 grid-cols-${GRID_COLS_MOBILE} sm:grid-cols-${GRID_COLS_DESKTOP}`
                  : 'space-y-2'
                }
              `}
            >
              {currentTickets.map((ticket) => (
                <TicketItem
                  key={ticket.number}
                  ticket={ticket}
                  onClick={(e) => handleTicketClick(ticket.number, e)}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
                <div className="text-sm text-gray-500">
                  Página {currentPage + 1} de {totalPages} 
                  ({filteredTickets.length.toLocaleString()} boletos)
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  
                  {/* Páginas */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`
                            px-3 py-2 rounded-lg text-sm font-medium
                            ${page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                            }
                          `}
                        >
                          {page + 1}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA Footer */}
      {selectedNumbers.length > 0 && (
        <div className="border-t border-gray-100 p-4 sm:p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="text-lg font-semibold text-gray-800">
                {selectedNumbers.length} boleto{selectedNumbers.length !== 1 ? 's' : ''} seleccionado{selectedNumbers.length !== 1 ? 's' : ''}
              </div>
              <div className="text-sm text-gray-600">
                Números: {selectedNumbers.sort((a, b) => a - b).slice(0, 5).map(n => n.toString().padStart(4, '0')).join(', ')}
                {selectedNumbers.length > 5 && ` y ${selectedNumbers.length - 5} más...`}
              </div>
            </div>
            
            <button
              onClick={() => {/* Lógica de compra */}}
              className="w-full sm:w-auto bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              Continuar con compra
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Demo Component
const TicketGridDemo: React.FC = () => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const total = 10000;
  const soldCount = 2743;

  const handleToggle = (number: number) => {
    setSelectedNumbers(prev => 
      prev.includes(number)
        ? prev.filter(n => n !== number)
        : [...prev, number]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">RifAzteca Premium</h1>
          <p className="text-gray-600">Grid de selección de boletos avanzado</p>
        </div>
        
        <TicketGrid
          total={total}
          soldCount={soldCount}
          selectedNumbers={selectedNumbers}
          onToggle={handleToggle}
        />
      </div>
    </div>
  );
};

export default TicketGridDemo;