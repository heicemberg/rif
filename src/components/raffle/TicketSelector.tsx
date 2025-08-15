'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useRaffleStore } from '@/stores/raffle-store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { formatTicketNumber, generateRandomNumbers } from '@/lib/utils';

interface TicketSelectorProps {
  className?: string;
  variant?: 'grid' | 'list' | 'compact';
  maxVisible?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  showStats?: boolean;
  onSelectionChange?: (tickets: number[]) => void;
}

export function TicketSelector({
  className,
  variant = 'grid',
  maxVisible = 100,
  showSearch = true,
  showFilters = true,
  showStats = true,
  onSelectionChange,
}: TicketSelectorProps) {
  const {
    rifaActual,
    boletosSeleccionados,
    boletosOcupados,
    seleccionarBoleto,
    deseleccionarBoleto,
    toggleBoleto,
    limpiarSeleccion,
    seleccionRapida,
    estaDisponible,
    estaSeleccionado,
  } = useRaffleStore();

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'disponibles' | 'seleccionados'>('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const [vistaExpandida, setVistaExpandida] = useState(false);
  const [animandoSeleccion, setAnimandoSeleccion] = useState<number | null>(null);
  const [mostrarInfo, setMostrarInfo] = useState(false);

  const boletosPerPage = vistaExpandida ? maxVisible * 2 : maxVisible;

  // Calcular rango de boletos visibles
  const rangoVisible = useMemo(() => {
    if (!rifaActual) return { inicio: 0, fin: 0 };
    const inicio = (paginaActual - 1) * boletosPerPage + 1;
    const fin = Math.min(inicio + boletosPerPage - 1, rifaActual.boletos.total);
    return { inicio, fin };
  }, [paginaActual, boletosPerPage, rifaActual]);

  // Filtrar boletos según criterios
  const boletesFiltrados = useMemo(() => {
    if (!rifaActual) return [];
    
    const todos: number[] = [];
    for (let i = rangoVisible.inicio; i <= rangoVisible.fin; i++) {
      todos.push(i);
    }

    let filtrados = todos;

    // Aplicar filtro de búsqueda
    if (busqueda) {
      const numeroBuscado = parseInt(busqueda);
      if (!isNaN(numeroBuscado)) {
        filtrados = filtrados.filter(num => 
          num.toString().includes(busqueda) ||
          formatTicketNumber(num).includes(busqueda)
        );
      }
    }

    // Aplicar filtro de estado
    switch (filtro) {
      case 'disponibles':
        filtrados = filtrados.filter(num => 
          !boletosOcupados.includes(num) && !boletosSeleccionados.includes(num)
        );
        break;
      case 'seleccionados':
        filtrados = filtrados.filter(num => boletosSeleccionados.includes(num));
        break;
    }

    return filtrados;
  }, [rangoVisible, busqueda, filtro, boletosOcupados, boletosSeleccionados, rifaActual]);

  // Total de páginas
  const totalPaginas = useMemo(() => {
    if (!rifaActual) return 0;
    return Math.ceil(rifaActual.boletos.total / boletosPerPage);
  }, [rifaActual, boletosPerPage]);

  // Manejar selección de boleto
  const handleTicketClick = useCallback((numero: number) => {
    if (boletosOcupados.includes(numero)) return;
    
    setAnimandoSeleccion(numero);
    toggleBoleto(numero);
    
    setTimeout(() => setAnimandoSeleccion(null), 300);
    
    if (onSelectionChange) {
      const nuevaSeleccion = estaSeleccionado(numero)
        ? boletosSeleccionados.filter(n => n !== numero)
        : [...boletosSeleccionados, numero];
      onSelectionChange(nuevaSeleccion);
    }
  }, [boletosOcupados, toggleBoleto, estaSeleccionado, boletosSeleccionados, onSelectionChange]);

  // Selección rápida de rango
  const seleccionarRango = useCallback((inicio: number, fin: number) => {
    const nuevosSeleccionados: number[] = [];
    
    for (let i = inicio; i <= fin && i <= rifaActual?.boletos.total!; i++) {
      if (estaDisponible(i) && !estaSeleccionado(i)) {
        nuevosSeleccionados.push(i);
      }
    }

    nuevosSeleccionados.forEach(num => seleccionarBoleto(num));
  }, [rifaActual, estaDisponible, estaSeleccionado, seleccionarBoleto]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'a': // Seleccionar todos los visibles
            e.preventDefault();
            boletesFiltrados.forEach(num => {
              if (estaDisponible(num) && !estaSeleccionado(num)) {
                seleccionarBoleto(num);
              }
            });
            break;
          case 'd': // Deseleccionar todos
            e.preventDefault();
            limpiarSeleccion();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [boletesFiltrados, estaDisponible, estaSeleccionado, seleccionarBoleto, limpiarSeleccion]);

  if (!rifaActual) {
    return (
      <div className={cn('p-8 text-center text-muted-foreground', className)}>
        No hay rifa activa
      </div>
    );
  }

  // Estadísticas
  const stats = {
    disponibles: boletesFiltrados.filter(n => estaDisponible(n) && !estaSeleccionado(n)).length,
    seleccionados: boletosSeleccionados.length,
    ocupados: boletesFiltrados.filter(n => boletosOcupados.includes(n)).length,
  };

  // Vista compacta
  if (variant === 'compact') {
    return (
      <div className={cn('space-y-4', className)}>
        {showStats && (
          <div className="flex gap-4 text-sm">
            <span>Disponibles: <strong>{stats.disponibles}</strong></span>
            <span>Seleccionados: <strong className="text-primary">{stats.seleccionados}</strong></span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-1">
          {boletesFiltrados.slice(0, 50).map(numero => (
            <button
              key={numero}
              onClick={() => handleTicketClick(numero)}
              disabled={boletosOcupados.includes(numero)}
              className={cn(
                'w-8 h-8 text-xs rounded border transition-all',
                estaSeleccionado(numero) && 'bg-primary text-white border-primary',
                boletosOcupados.includes(numero) && 'bg-gray-200 cursor-not-allowed opacity-50',
                !estaSeleccionado(numero) && !boletosOcupados.includes(numero) && 
                'hover:border-primary hover:bg-primary/10',
                animandoSeleccion === numero && 'animate-ticketSelect'
              )}
            >
              {numero}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Vista lista
  if (variant === 'list') {
    return (
      <div className={cn('space-y-4', className)}>
        {showSearch && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar número..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <Button variant="outline" onClick={() => setBusqueda('')}>
              Limpiar
            </Button>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {boletesFiltrados.map(numero => (
            <div
              key={numero}
              onClick={() => handleTicketClick(numero)}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all',
                estaSeleccionado(numero) && 'bg-primary text-white border-primary',
                boletosOcupados.includes(numero) && 'bg-gray-100 cursor-not-allowed opacity-50',
                !estaSeleccionado(numero) && !boletosOcupados.includes(numero) && 
                'hover:border-primary hover:bg-primary/5'
              )}
            >
              <span className="font-mono">#{formatTicketNumber(numero)}</span>
              <span className="text-sm">
                {boletosOcupados.includes(numero) ? 'Ocupado' :
                 estaSeleccionado(numero) ? 'Seleccionado' : 'Disponible'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vista grid (default)
  return (
    <div className={cn('space-y-4', className)}>
      {/* Controles superiores */}
      <div className="space-y-4">
        {/* Búsqueda y filtros */}
        {(showSearch || showFilters) && (
          <div className="flex flex-col sm:flex-row gap-3">
            {showSearch && (
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar número de boleto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
            
            {showFilters && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={filtro === 'todos' ? 'default' : 'outline'}
                  onClick={() => setFiltro('todos')}
                >
                  Todos
                </Button>
                <Button
                  size="sm"
                  variant={filtro === 'disponibles' ? 'default' : 'outline'}
                  onClick={() => setFiltro('disponibles')}
                >
                  Disponibles
                </Button>
                <Button
                  size="sm"
                  variant={filtro === 'seleccionados' ? 'default' : 'outline'}
                  onClick={() => setFiltro('seleccionados')}
                >
                  Seleccionados
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Estadísticas */}
        {showStats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <AnimatedNumber 
                value={stats.disponibles} 
                className="text-2xl font-bold text-green-600"
              />
              <p className="text-sm text-green-700 dark:text-green-400">Disponibles</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <AnimatedNumber 
                value={stats.seleccionados} 
                className="text-2xl font-bold text-blue-600"
              />
              <p className="text-sm text-blue-700 dark:text-blue-400">Seleccionados</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg text-center">
              <AnimatedNumber 
                value={stats.ocupados} 
                className="text-2xl font-bold text-gray-600"
              />
              <p className="text-sm text-gray-700 dark:text-gray-400">Ocupados</p>
            </div>
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => seleccionRapida(5)}
          >
            🎲 Selección aleatoria (5)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => seleccionarRango(rangoVisible.inicio, rangoVisible.inicio + 9)}
          >
            Seleccionar 10 consecutivos
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={limpiarSeleccion}
            disabled={boletosSeleccionados.length === 0}
          >
            Limpiar selección
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMostrarInfo(!mostrarInfo)}
          >
            {mostrarInfo ? 'Ocultar' : 'Mostrar'} leyenda
          </Button>
        </div>
      </div>

      {/* Leyenda */}
      {mostrarInfo && (
        <div className="flex flex-wrap gap-4 p-3 bg-muted rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-gray-300 bg-white" />
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary" />
            <span>Seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gray-300" />
            <span>Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-primary bg-primary/10 animate-pulse" />
            <span>Seleccionando...</span>
          </div>
        </div>
      )}

      {/* Grid de boletos */}
      <div className="relative">
        <div className={cn(
          'grid gap-2 p-4 bg-muted/30 rounded-lg',
          'grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15'
        )}>
          {boletesFiltrados.map(numero => {
            const seleccionado = estaSeleccionado(numero);
            const ocupado = boletosOcupados.includes(numero);
            const animando = animandoSeleccion === numero;

            return (
              <button
                key={numero}
                onClick={() => handleTicketClick(numero)}
                disabled={ocupado}
                className={cn(
                  'relative aspect-square rounded-lg border-2 font-mono text-sm transition-all',
                  'hover:z-10 focus:outline-none focus:ring-2 focus:ring-primary',
                  
                  // Estados
                  ocupado && 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-60',
                  seleccionado && !ocupado && 'bg-primary border-primary text-white shadow-lg',
                  !seleccionado && !ocupado && 'bg-white border-gray-300 hover:border-primary hover:bg-primary/5',
                  
                  // Animación
                  animando && 'animate-ticketSelect scale-110 z-20'
                )}
                title={`Boleto #${formatTicketNumber(numero)}`}
              >
                <span className="absolute inset-0 flex items-center justify-center">
                  {formatTicketNumber(numero)}
                </span>
                
                {/* Indicadores */}
                {seleccionado && !ocupado && (
                  <svg 
                    className="absolute top-0 right-0 w-4 h-4 text-white"
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                
                {ocupado && (
                  <svg 
                    className="absolute top-0 right-0 w-4 h-4 text-gray-500"
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Overlay de carga si hay muchos boletos */}
        {boletesFiltrados.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
            <p className="text-muted-foreground">No se encontraron boletos</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando boletos {rangoVisible.inicio} - {rangoVisible.fin} de {rifaActual.boletos.total}
          </p>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
            >
              Anterior
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                const pagina = paginaActual - 2 + i;
                if (pagina < 1 || pagina > totalPaginas) return null;
                
                return (
                  <Button
                    key={pagina}
                    size="sm"
                    variant={pagina === paginaActual ? 'default' : 'outline'}
                    onClick={() => setPaginaActual(pagina)}
                    className="w-8"
                  >
                    {pagina}
                  </Button>
                );
              })}
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Vista expandida toggle */}
      <div className="text-center">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setVistaExpandida(!vistaExpandida)}
        >
          {vistaExpandida ? 'Ver menos' : 'Ver más'} boletos
        </Button>
      </div>
    </div>
  );
}