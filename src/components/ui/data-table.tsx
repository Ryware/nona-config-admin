import { For, Show, createSignal } from "solid-js";
import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/solid-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./table";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData>(props: DataTableProps<TData>) {
  const [sorting, setSorting] = createSignal<SortingState>([]);
  const [rowSelection, setRowSelection] = createSignal<RowSelectionState>({});

  const table = createSolidTable({
    get data() {
      return props.data;
    },
    get columns() {
      return props.columns;
    },
    state: {
      get sorting() {
        return sorting();
      },
      get rowSelection() {
        return rowSelection();
      },
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div class="bg-[#111827] border rounded-xl overflow-hidden" style="border-color: rgba(255,255,255,0.07);">
      <Table>
        <TableHeader>
          <For each={table.getHeaderGroups()}>
            {(headerGroup) => (
              <TableRow>
                <For each={headerGroup.headers}>
                  {(header) => (
                    <TableHead colSpan={header.colSpan}>
                      <Show when={!header.isPlaceholder}>
                        <div
                          class={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none flex items-center gap-2"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <Show when={header.column.getCanSort()}>
                            <span class="text-text-secondary">
                              {{
                                asc: "↑",
                                desc: "↓",
                              }[header.column.getIsSorted() as string] ?? "↕"}
                            </span>
                          </Show>
                        </div>
                      </Show>
                    </TableHead>
                  )}
                </For>
              </TableRow>
            )}
          </For>
        </TableHeader>
        <TableBody>
          <Show
            when={table.getRowModel().rows.length > 0}
            fallback={
              <TableRow>
                <TableCell
                  colSpan={props.columns.length}
                  class="text-center py-12"
                >
                  No data available
                </TableCell>
              </TableRow>
            }
          >            <For each={table.getRowModel().rows}>
              {(row) => (
                <TableRow
                  onClick={() => props.onRowClick?.(row.original)}
                >
                  <For each={row.getVisibleCells()}>
                    {(cell) => (
                      <TableCell>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )}
                  </For>
                </TableRow>
              )}
            </For>
          </Show>
        </TableBody>
      </Table>
    </div>
  );
}
