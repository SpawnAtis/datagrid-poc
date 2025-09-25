import React, { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "./App.css";
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
} from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

type Person = {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "Active" | "Invited" | "Suspended";
  createdAt: string; // ISO date string
};

function App() {
  // Demo dataset
  const [rowData, setRowData] = useState<Person[]>(
    Array.from({ length: 50 }, (_, i) => {
      const roles: Person["role"][] = ["Admin", "Editor", "Viewer"];
      const statuses: Person["status"][] = ["Active", "Invited", "Suspended"];
      const d = new Date(2024, i % 12, (i % 28) + 1);
      return {
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: roles[i % roles.length],
        status: statuses[i % statuses.length],
        createdAt: d.toISOString().slice(0, 10),
      } as Person;
    })
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      floatingFilter: true,
      resizable: true,
      minWidth: 120,
    }),
    []
  );

  // Row-level actions
  const onEdit = (name: string) => window.alert(`Edit user ${name}`);
  const onDelete = (id: number, name: string) => {
    if (window.confirm(`Delete ${name}?`)) {
      setRowData((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const columnDefs = useMemo(
    () => [
      {
        field: "id",
        headerName: "ID",
        width: 90,
        filter: "agNumberColumnFilter",
      },
      { field: "name", headerName: "Name" },
      { field: "email", headerName: "Email", minWidth: 220 },
      {
        field: "role",
        headerName: "Role",
        filter: "agTextColumnFilter",
      },
      {
        field: "status",
        headerName: "Status",
        filter: "agTextColumnFilter",
      },
      {
        field: "createdAt",
        headerName: "Created",
        filter: "agDateColumnFilter",
        valueGetter: (p: any) => new Date(p.data.createdAt),
        valueFormatter: (p: any) => new Date(p.value).toLocaleDateString(),
      },
      {
        headerName: "Actions",
        field: "actions",
        width: 160,
        sortable: false,
        filter: false,
        cellRenderer: () =>
          `<div style="display:flex;gap:8px;justify-content:center">
             <button data-action="edit" aria-label="Edit">Edit</button>
             <button data-action="delete" aria-label="Delete">Delete</button>
           </div>`,
      },
    ],
    []
  );

  const paginationPageSize = 10;

  const gridRef = useRef<AgGridReact<Person>>(null);
  const apiRef = useRef<any>(null);
  const columnApiRef = useRef<any>(null);
  const [quickFilter, setQuickFilter] = useState("");
  const [wrapText, setWrapText] = useState(false);
  const [density, setDensity] = useState<"compact" | "normal" | "comfortable">(
    "normal"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({
    name: true,
    email: true,
    role: true,
    status: true,
    createdAt: true,
  });
  const toggleColumn = (key: string) => {
    const next = !visibleCols[key as keyof typeof visibleCols];
    setVisibleCols((prev) => ({ ...prev, [key]: next }));
    columnApiRef.current?.setColumnVisible(key, next);
  };

  const rowHeight =
    density === "compact" ? 28 : density === "comfortable" ? 44 : 36;

  const saveState = () => {
    const api = apiRef.current;
    if (!api) return;
    const colState = api.getColumnState();
    localStorage.setItem("aggrid-react-col-state", JSON.stringify(colState));
    window.alert("Column state saved");
  };
  const restoreState = () => {
    const api = apiRef.current;
    if (!api) return;
    const raw = localStorage.getItem("aggrid-react-col-state");
    if (!raw) return window.alert("No saved state");
    api.applyColumnState({ state: JSON.parse(raw), applyOrder: true });
  };

  // Simulate loading/error/empty states
  const simulateLoading = async () => {
    setError(null);
    setLoading(true);
    apiRef.current?.showLoadingOverlay();
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    apiRef.current?.hideOverlay();
  };
  const simulateError = () => {
    setError("Failed to load data.");
    setRowData([]);
  };
  const clearError = () => setError(null);

  useEffect(() => {
    // No-rows overlay for empty or no-match scenario
    if (!apiRef.current) return;
    const api = apiRef.current;
    const hasRows = (rowData?.length ?? 0) > 0;
    if (!hasRows) {
      api.showNoRowsOverlay();
    } else {
      api.hideOverlay();
    }
  }, [rowData]);

  const onFilterChanged = () => {
    const api = apiRef.current;
    if (!api) return;
    if (api.getDisplayedRowCount() === 0) api.showNoRowsOverlay();
    else api.hideOverlay();
  };

  const onCellClicked = (event: any) => {
    if (event.colDef.field !== "actions") return;
    const target: HTMLElement | null = event.event?.target as any;
    if (!target) return;
    const action = target.getAttribute("data-action");
    if (action === "edit") onEdit(event.data.name);
    if (action === "delete") onDelete(event.data.id, event.data.name);
  };

  const onGridReady = (params: any) => {
    apiRef.current = params.api;
    columnApiRef.current = params.columnApi;
    if ((rowData?.length ?? 0) === 0) params.api.showNoRowsOverlay();
  };

  return (
    <div className="App">
      <h1>AG Grid Community POC (React)</h1>
      <p className="description">
        Sorting, filtering, pagination, resizing, actions, theming, and state
        persistence.
      </p>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <input
          placeholder="Global search..."
          value={quickFilter}
          onChange={(e) => setQuickFilter(e.target.value)}
          aria-label="Global search"
        />
        <label>
          <input
            type="checkbox"
            checked={wrapText}
            onChange={(e) => setWrapText(e.target.checked)}
          />{" "}
          Wrap text
        </label>
        <label>
          Density:
          <select
            value={density}
            onChange={(e) => setDensity(e.target.value as any)}
            aria-label="Density"
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="comfortable">Comfortable</option>
          </select>
        </label>
        <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <span>Columns:</span>
          {(["name", "email", "role", "status", "createdAt"] as const).map(
            (key) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={visibleCols[key]}
                  onChange={() => toggleColumn(key)}
                />{" "}
                {key}
              </label>
            )
          )}
        </div>
        <button onClick={saveState}>Save columns</button>
        <button onClick={restoreState}>Restore columns</button>
        <button onClick={simulateLoading} disabled={loading}>
          Simulate loading
        </button>
        <button onClick={simulateError}>Simulate error</button>
        {error && (
          <span style={{ color: "red" }}>
            {error} <button onClick={clearError}>Dismiss</button>
          </span>
        )}
      </div>

      <div style={{ height: 540, width: "100%", margin: "0 auto" }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs as any}
          defaultColDef={{ ...defaultColDef, wrapText, autoHeight: wrapText }}
          theme={themeQuartz.withParams({
            headerBackgroundColor: "#0b5cff",
            headerTextColor: "#ffffff",
            rowHoverColor: "#f0f6ff",
            selectedRowBackgroundColor: "#eef2ff",
            fontSize: 13,
          })}
          pagination={true}
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={[10, 20, 50]}
          rowSelection={{ mode: "singleRow", enableClickSelection: false }}
          quickFilterText={quickFilter}
          rowHeight={rowHeight}
          suppressMultiSort={false} // hold Shift to multi-sort
          enableCellTextSelection={true}
          suppressDragLeaveHidesColumns={true}
          onFilterChanged={onFilterChanged}
          onGridReady={onGridReady}
          onCellClicked={onCellClicked}
        />
      </div>
    </div>
  );
}

// Accessibility notes: AG Grid provides ARIA and keyboard navigation OOTB

export default App;
