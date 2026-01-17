import { useState, useEffect, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import type { DataTablePageEvent, DataTableSelectionMultipleChangeEvent } from 'primereact/datatable';
import type { Table, ApiResponse } from '../types/TableData';
import { usePersistentSelection } from '../hooks/usePersistentSelection';

const ROWS_PER_PAGE = 12;

export default function ArtworkTable() {
  const [data, setData] = useState<Table[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // 0-based for DataTable
  const [loading, setLoading] = useState(true);

  const { setAllRowsOnPage, getSelectedIdsForPage } = usePersistentSelection();
  // Fetch data for a specific page (1-based)
  const fetchPage = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${ROWS_PER_PAGE}`);
      const result: ApiResponse = await res.json();
      setData(result.data);
      setTotalRecords(result.pagination.total_object);
    } catch (err) {
      console.error('Failed to fetch artworks:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load first page when component mounts
  useEffect(() => {
    fetchPage(1);
  }, []);

  // Get currently selected rows (for DataTable display)
  const selectedRows = useMemo(() => {
    const oneBased = currentPage + 1;
    const selectedIds = getSelectedIdsForPage(oneBased);
    return data.filter(item => selectedIds.has(item.id));
  }, [data, currentPage, getSelectedIdsForPage]);

  // Handle pagination (when user clicks next/prev page)
  const handlePageChange = (event: DataTablePageEvent) => {
    const pageIndex = event.page ?? 0;
    setCurrentPage(pageIndex);
    fetchPage(pageIndex + 1); // Convert to 1-based for API
  };

  
  // Handle checkbox selections in the table
  const handleSelectionChange = (event: DataTableSelectionMultipleChangeEvent<Table[]>) => {
    const selectedItems = event.value || [];
    const selectedIds = selectedItems.map(item => item.id);
    const oneBased = currentPage + 1;
    setAllRowsOnPage(oneBased, selectedIds, true);
  };

  return (
    <div className="">
   
      <h4>Selected: <span className='text-blue-500'> {selectedRows.length} </span> rows</h4>
      {/* Data Table */}
      <DataTable
        value={data}
        dataKey="id"
        paginator
        rows={ROWS_PER_PAGE}
        totalRecords={totalRecords}
        lazy
        first={currentPage * ROWS_PER_PAGE}
        onPage={handlePageChange}
        selection={selectedRows}
        onSelectionChange={handleSelectionChange}
        selectionMode="multiple"
        loading={loading}
        
      >
        <Column selectionMode="multiple" style={{ width: '1rem' }} />
        <Column field="title" header="Title"  />
        <Column field="place_of_origin" header="Origin"  />
        <Column field="artist_display" header="Artist" style={{ minWidth: '200px' }} />
        <Column field="inscription" header="Inscription" />
        <Column field="date_start" header="Start Date"  />
        <Column field="date_end" header="End Date"/>
      </DataTable>
    </div>
  );
}