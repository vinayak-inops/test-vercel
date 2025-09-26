export function EntriesSelector({ entriesPerPage, setEntriesPerPage }:any) {
    return (
      <div className="mb-4 flex items-center">
        <label className="mr-2 text-sm text-gray-600">Show</label>
        <select
          className="border p-2 rounded-md"
          value={entriesPerPage}
          onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="ml-2 text-sm text-gray-600">entries</span>
      </div>
    );
  }
  