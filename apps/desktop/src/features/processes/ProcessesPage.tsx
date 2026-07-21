import { useProcesses } from "./hooks/useProcesses";
import ProcessToolbar from "./components/ProcessToolbar";
import ProcessTable from "./components/ProcessTable";

export default function ProcessesPage() {
  const {
    processes,
    filteredProcesses,
    loading,
    refresh,
    search,
    setSearch,
    sortField,
    sortDirection,
    toggleSort,
  } = useProcesses();

  return (
    <div className="p-6 space-y-6">

      <ProcessToolbar
        processCount={processes.length}
        search={search}
        onSearchChange={setSearch}
        onRefresh={refresh}
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