import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, ChevronLeft, ChevronRight, Download, ArrowUpDown, ArrowUp, ArrowDown, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  filterOptions?: string[];
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: string[];
  pageSize?: number;
  exportFilename?: string;
  onExportCSV?: () => void;
  actions?: React.ReactNode;
  emptyMessage?: string;
  dateFilterKey?: string;
  rowActions?: (row: T) => React.ReactNode;
}

type SortDir = "asc" | "desc" | null;

export function DataTable<T extends Record<string, any>>({
  data, columns, searchKeys = [], pageSize = 15, exportFilename, onExportCSV, actions, emptyMessage = "No data found", dateFilterKey, rowActions
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const pageSizeOptions = [20, 50, 100];

  const filtered = useMemo(() => {
    let result = [...data];

    // Search
    if (search && searchKeys.length > 0) {
      const q = search.toLowerCase();
      result = result.filter(row => searchKeys.some(k => String(row[k] ?? "").toLowerCase().includes(q)));
    }

    // Column filters
    Object.entries(filters).forEach(([key, val]) => {
      if (val && val !== "__all__") {
        result = result.filter(row => String(row[key]) === val);
      }
    });

    // Date range filter
    if (dateFilterKey && dateRange?.from) {
      result = result.filter(row => {
        const val = row[dateFilterKey];
        if (!val) return false;
        const d = new Date(val);
        if (dateRange.from && d < dateRange.from) return false;
        if (dateRange.to) {
          const endOfDay = new Date(dateRange.to);
          endOfDay.setHours(23, 59, 59, 999);
          if (d > endOfDay) return false;
        }
        return true;
      });
    }

    // Sort
    if (sortKey && sortDir) {
      result.sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
        return sortDir === "desc" ? -cmp : cmp;
      });
    }

    return result;
  }, [data, search, searchKeys, filters, sortKey, sortDir, dateFilterKey, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / currentPageSize));
  const paginated = filtered.slice(page * currentPageSize, (page + 1) * currentPageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => prev === "asc" ? "desc" : prev === "desc" ? null : "asc");
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleExportCSV = () => {
    if (onExportCSV) { onExportCSV(); return; }
    const headers = columns.map(c => c.label).join(",");
    const rows = filtered.map(row => columns.map(c => {
      const val = row[c.key];
      return typeof val === "string" && val.includes(",") ? `"${val}"` : String(val ?? "");
    }).join(","));
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFilename || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filterableCols = columns.filter(c => c.filterOptions && c.filterOptions.length > 0);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {searchKeys.length > 0 && (
          <div className="relative flex-1 min-w-64 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-10" />
          </div>
        )}

        {filterableCols.map(col => (
          <Select key={col.key} value={filters[col.key] || "__all__"} onValueChange={v => { setFilters(prev => ({ ...prev, [col.key]: v })); setPage(0); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={col.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All {col.label}</SelectItem>
              {col.filterOptions!.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        ))}

        {/* Date Range Filter */}
        {dateFilterKey && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("gap-2 min-w-[200px] justify-start text-left font-normal", !dateRange?.from && "text-muted-foreground")}>
                <CalendarIcon className="h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? `${format(dateRange.from, "dd MMM")} – ${format(dateRange.to, "dd MMM yyyy")}` : format(dateRange.from, "dd MMM yyyy")
                ) : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => { setDateRange(range); setPage(0); }}
                numberOfMonths={2}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        )}

        {dateFilterKey && dateRange?.from && (
          <Button variant="ghost" size="sm" onClick={() => { setDateRange(undefined); setPage(0); }} className="gap-1 text-muted-foreground">
            <X className="h-3 w-3" /> Clear dates
          </Button>
        )}

        <div className="flex-1" />

        {actions}

        {exportFilename && (
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => (
                <TableHead key={col.key} className={col.className}>
                  {col.sortable ? (
                    <button onClick={() => handleSort(col.key)} className="flex items-center gap-1 hover:text-foreground transition-colors font-medium">
                      {col.label}
                      {sortKey === col.key ? (
                        sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                    </button>
                  ) : col.label}
                </TableHead>
              ))}
              {rowActions && <TableHead className="w-20 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (rowActions ? 1 : 0)} className="text-center py-12 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : paginated.map((row, i) => (
              <TableRow key={row.id || i}>
                {columns.map(col => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                  </TableCell>
                ))}
                {rowActions && (
                  <TableCell className="text-right">
                    {rowActions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <p>Showing {filtered.length === 0 ? 0 : page * currentPageSize + 1}–{Math.min((page + 1) * currentPageSize, filtered.length)} of {filtered.length} results</p>
          <div className="flex items-center gap-2">
            <span className="text-xs">Rows:</span>
            <Select value={String(currentPageSize)} onValueChange={v => { setCurrentPageSize(Number(v)); setPage(0); }}>
              <SelectTrigger className="h-8 w-[70px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(0)} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" /><ChevronLeft className="h-4 w-4 -ml-2" />
          </Button>
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i)
            .filter(i => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
            .reduce<(number | "ellipsis")[]>((acc, i, idx, arr) => {
              if (idx > 0 && arr[idx - 1] !== i - 1) acc.push("ellipsis");
              acc.push(i);
              return acc;
            }, [])
            .map((item, idx) =>
              item === "ellipsis" ? (
                <span key={`e-${idx}`} className="px-1 text-muted-foreground">…</span>
              ) : (
                <Button key={item} variant={page === item ? "default" : "outline"} size="sm" onClick={() => setPage(item)} className="h-8 w-8 p-0 text-xs">
                  {(item as number) + 1}
                </Button>
              )
            )}
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" /><ChevronRight className="h-4 w-4 -ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
