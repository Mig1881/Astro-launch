type Props = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortOrder: string;
  onSortChange: (value: string) => void;
  // Filtro por estado de la mision (exito o fallo)
  filterStatus: string;
  onFilterChange: (value: string) => void;
  // NUEVAS PROPS para implementar filtro por tripulación
  crewFilter: string;
  onCrewFilterChange: (value: string) => void;
};

export default function SearchControls({
  searchTerm,
  onSearchChange,
  sortOrder,
  onSortChange,
  filterStatus,
  onFilterChange,
  crewFilter,         // <-- Añadido
  onCrewFilterChange, // <-- Añadido
}: Props) {
  return (
    <div className="search-controls-container" style={{ flexWrap: 'wrap' }}>
      {/* Input de búsqueda */}
      <input
        type="text"
        placeholder="Buscar misión por nombre..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-input"
        style={{ flex: '1 1 200px' }} // Para que no se aplaste al poner 4 controles
      />
      
      {/* Selector de Filtro por Estado */}
      <select
        value={filterStatus}
        onChange={(e) => onFilterChange(e.target.value)}
        className="sort-select"
      >
        <option value="all">Todos los estados</option>
        <option value="success">✅ Solo Éxitos</option>
        <option value="failure">❌ Solo Fallos</option>
      </select>

      {/*Selector de Filtro por Tripulación */}
      <select
        value={crewFilter}
        onChange={(e) => onCrewFilterChange(e.target.value)}
        className="sort-select"
      >
        <option value="all">Toda la flota</option>
        <option value="crewed">👩‍🚀 Solo Tripuladas</option>
        <option value="uncrewed">🛰️ Solo Cargas Útiles</option>
      </select>

      {/* Selector de ordenación */}
      <select
        value={sortOrder}
        onChange={(e) => onSortChange(e.target.value)}
        className="sort-select"
      >
        <option value="desc">Más recientes primero</option>
        <option value="asc">Más antiguos primero</option>
      </select>
    </div>
  );
}