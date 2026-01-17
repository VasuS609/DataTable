// ArtworkTable.tsx
import { useState, useEffect} from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';;

// Types (keep them simple)
interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const ROWS_PER_PAGE = 12;

export default function ArtworkTable() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // PrimeReact uses 0-based pages
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Load artworks for a page (API uses 1-based page numbers)
  const loadPage = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${ROWS_PER_PAGE}`);
      const data = await res.json();
      
      setArtworks(data.data);
      setTotal(data.pagination.total); // ✅ Correct field name
    } catch (err) {
      console.error('Error loading artworks:', err);
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  // Load first page when component starts
  useEffect(() => {
    loadPage(1);
  }, []);

  // When user changes page
  const onPageChange = (event: any) => {
    const newPage = event.page; // 0-based
    setCurrentPage(newPage);
    loadPage(newPage + 1); // API needs 1-based
  };

  // Handle row selection
  const onSelectionChange = (event: any) => {
    const selectedRows = event.value || [];
    const ids = new Set(selectedRows.map((item: Artwork) => item.id));
    setSelectedIds(ids);
  };

  // Show how many are selected
  const selectedCount = selectedIds.size;

  // Calculate "Showing X to Y of Z"
  const start = currentPage * ROWS_PER_PAGE + 1;
  const end = Math.min(start + ROWS_PER_PAGE - 1, total);

  return (
    <div className="">
      <h4 className="">
        Selected: <span className="text-blue-500">{selectedCount}</span> rows
      </h4>
      

      <DataTable
  value={artworks}
  dataKey="id"
  paginator
  rows={ROWS_PER_PAGE}
  totalRecords={total}
  lazy
  first={currentPage * ROWS_PER_PAGE}
  onPage={onPageChange}
  selectionMode="multiple"
  selection={artworks.filter(item => selectedIds.has(item.id))}
  onSelectionChange={onSelectionChange}
  loading={loading}
  responsiveLayout="scroll"
  paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
  currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
>
  <Column selectionMode="multiple" style={{ width: '3rem' }} />
  <Column field="title" header="Title" />
  <Column field="place_of_origin" header="Origin" />
  <Column field="artist_display" header="Artist" style={{ minWidth: '200px' }} />
  <Column field="inscriptions" header="Inscriptions" />
  <Column field="date_start" header="Start Date" />
  <Column field="date_end" header="End Date" />
</DataTable>
    
    </div>
  );
}