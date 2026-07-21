import { useProcesses } from "./hooks/useProcesses";
import ProcessToolbar from "./components/ProcessToolbar";
import ProcessTable from "./components/ProcessTable";
import ProcessFilterBar from "./components/ProcessFilterBar";

export default function ProcessesPage() {
  const {
    processes,
    filteredProcesses,
    loading,
    refresh,
    refreshInterval,
    setRefreshInterval,
    search,
    setSearch,

    sortField,
    sortDirection,
    toggleSort,

    filter,
    setFilter,



    
  } = useProcesses();

  return (
    <div className="p-6 space-y-6">

      <ProcessToolbar
        processCount={processes.length}
        search={search}
        onSearchChange={setSearch}

        refreshInterval={refreshInterval}
        onRefreshIntervalChange={setRefreshInterval}

        onRefresh={refresh}
      />
      
      <ProcessFilterBar
        filter={filter}
        onFilterChange={setFilter}
      />

      <ProcessTable
        processes={filteredProcesses}
        loading={loading}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={toggleSort}
      />

      
    </div>
  );
}