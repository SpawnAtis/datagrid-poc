<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'


import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])

type Person = {
  id: number
  name: string
  email: string
  role: 'Admin' | 'Editor' | 'Viewer'
  status: 'Active' | 'Invited' | 'Suspended'
  createdAt: string 
}

const rowData = ref<Person[]>(
  Array.from({ length: 50 }, (_, i) => {
    const roles: Person['role'][] = ['Admin', 'Editor', 'Viewer']
    const statuses: Person['status'][] = ['Active', 'Invited', 'Suspended']
    const d = new Date(2024, i % 12, (i % 28) + 1)
    return {
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: roles[i % roles.length],
      status: statuses[i % statuses.length],
      createdAt: d.toISOString().slice(0, 10)
    }
  })
)

const defaultColDef = computed(() => ({
  sortable: true,
  filter: true,
  floatingFilter: true,
  resizable: true,
  minWidth: 120,
  flex: 1,
}))



const columnDefs = ref([
  { field: 'id', headerName: 'ID', width: 90, filter: 'agNumberColumnFilter' },
  { field: 'name', headerName: 'Name' },
  { field: 'email', headerName: 'Email', minWidth: 220 },
  
  { field: 'role', headerName: 'Role', filter: 'agTextColumnFilter' },
  { field: 'status', headerName: 'Status', filter: 'agTextColumnFilter' },
  {
    field: 'createdAt',
    headerName: 'Created',
    filter: 'agDateColumnFilter',
    valueGetter: (p: any) => new Date(p.data.createdAt),
    valueFormatter: (p: any) => new Date(p.value).toLocaleDateString()
  },
  {
    headerName: 'Actions',
    field: 'actions',
    width: 160,
    sortable: false,
    filter: false,
    cellRenderer: () =>
      `<div style="display:flex;gap:8px;justify-content:center">
         <button data-action="edit" aria-label="Edit">Edit</button>
         <button data-action="delete" aria-label="Delete">Delete</button>
       </div>`
  }
])

const pageSize = ref(10)


const quickFilter = ref('')
const wrapText = ref(false)
const density = ref<'compact' | 'normal' | 'comfortable'>('normal')

const mergedDefaultColDef = computed(() => ({
  ...defaultColDef.value,
  wrapText: wrapText.value,
  autoHeight: wrapText.value,
}))
const rowHeight = computed(() => (density.value === 'compact' ? 28 : density.value === 'comfortable' ? 44 : 36))

const loading = ref(false)
const error = ref<string | null>(null)


const gridApi = ref<any>(null)
const columnApi = ref<any>(null)

function onGridReady(params: any) {
  gridApi.value = params.api
  columnApi.value = params.columnApi
  console.log('grid-ready displayed rows:', params.api.getDisplayedRowCount())
  if (!rowData.value.length) params.api.showNoRowsOverlay()
}

watch(rowData, (rows) => {
  if (!gridApi.value) return
  console.log('rowData changed, displayed rows:', gridApi.value.getDisplayedRowCount())
  if (!rows.length) gridApi.value.showNoRowsOverlay()
  else gridApi.value.hideOverlay()
})


function onCellClicked(event: any) {
  if (event.colDef.field !== 'actions') return
  const target = event.event?.target as HTMLElement | null
  if (!target) return
  const action = (target as HTMLElement).getAttribute('data-action')
  if (action === 'edit') alert(`Edit user ${event.data.name}`)
  if (action === 'delete') {
    if (confirm(`Delete ${event.data.name}?`)) {
      rowData.value = rowData.value.filter((r) => r.id !== event.data.id)
    }
  }
}


function saveState() {
  if (!columnApi.value) return
  const state = columnApi.value.getColumnState()
  localStorage.setItem('aggrid-vue-col-state', JSON.stringify(state))
  alert('Column state saved')
}
function restoreState() {
  if (!columnApi.value) return
  const raw = localStorage.getItem('aggrid-vue-col-state')
  if (!raw) return alert('No saved state')
  columnApi.value.applyColumnState({ state: JSON.parse(raw), applyOrder: true })
}


const visibleCols = ref<Record<string, boolean>>({
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true
})
function toggleColumn(key: string) {
  visibleCols.value[key] = !visibleCols.value[key]
  columnApi.value?.setColumnVisible(key, visibleCols.value[key])
}


async function simulateLoading() {
  error.value = null
  loading.value = true
  gridApi.value?.showLoadingOverlay()
  await new Promise((r) => setTimeout(r, 1200))
  loading.value = false
  gridApi.value?.hideOverlay()
}
function simulateError() {
  error.value = 'Failed to load data.'
  rowData.value = []
}
function clearError() {
  error.value = null
}
</script>

<template>
  <section>
    <h1>AG Grid Community POC (Vue)</h1>
    <p class="description">
      Sorting, filtering, pagination, resizing, actions, theming, and state persistence.
    </p>

    <!-- Toolbar -->
    <div class="toolbar">
      <input
        placeholder="Global search..."
        v-model="quickFilter"
        aria-label="Global search"
      />
      <label>
        <input type="checkbox" v-model="wrapText" /> Wrap text
      </label>
      <label>
        Density:
        <select v-model="density" aria-label="Density">
          <option value="compact">Compact</option>
          <option value="normal">Normal</option>
          <option value="comfortable">Comfortable</option>
        </select>
      </label>
      <div class="cols">
        <span>Columns:</span>
        <label v-for="key in ['name','email','role','status','createdAt']" :key="key">
          <input type="checkbox" :checked="visibleCols[key]" @change="toggleColumn(key)" /> {{ key }}
        </label>
      </div>
      <button @click="saveState">Save columns</button>
      <button @click="restoreState">Restore columns</button>
      <button @click="simulateLoading" :disabled="loading">Simulate loading</button>
      <button @click="simulateError">Simulate error</button>
      <span v-if="error" class="error">
        {{ error }} <button @click="clearError">Dismiss</button>
      </span>
    </div>

    <div style="height: 540px; width: 1000px; margin: 0 auto; background:#ffffff">
      <AgGridVue
        :rowData="rowData"
        :columnDefs="columnDefs"
        :defaultColDef="mergedDefaultColDef"
        :theme="themeQuartz.withParams({
          
          backgroundColor: '#ffffff',
          foregroundColor: '#111827',
          
          headerBackgroundColor: '#0b5cff',
          headerTextColor: '#ffffff',
          
          rowHoverColor: '#f0f6ff',
          selectedRowBackgroundColor: '#eef2ff',
          
          fontSize: 13,
        })"
        :pagination="true"
        :paginationPageSize="pageSize"
        :paginationPageSizeSelector="[10, 20, 50]"
        :rowSelection="{ mode: 'singleRow', enableClickSelection: false }"
        :quickFilterText="quickFilter"
        :rowHeight="rowHeight"
        domLayout="autoHeight"
        :suppressMultiSort="false"
        :enableCellTextSelection="true"
        :suppressDragLeaveHidesColumns="true"
        @grid-ready="onGridReady"
        @cell-clicked="onCellClicked"
      />
    </div>
  </section>
</template>

<style scoped>
.description {
  color: var(--vt-c-text-2);
  margin-bottom: 12px;
}
.toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
  
</style>
