"use client";

import {
  SortableTable,
  type SortableColumn,
} from "@/components/interior/sortable-table";

type Reviewer = {
  id: string;
  name: string;
  open: number;
  seen: string;
  ago: number;
};

const REVIEWERS: Reviewer[] = [
  { id: "r1", name: "Priya Raman", open: 12, seen: "2h ago", ago: 120 },
  { id: "r2", name: "Marco Silva", open: 3, seen: "1d ago", ago: 1440 },
  { id: "r3", name: "Ada Okonjo", open: 21, seen: "18m ago", ago: 18 },
  { id: "r4", name: "Tom Beckett", open: 7, seen: "4d ago", ago: 5760 },
  { id: "r5", name: "Lena Fischer", open: 15, seen: "6h ago", ago: 360 },
  { id: "r6", name: "Noah Kim", open: 1, seen: "9h ago", ago: 540 },
];

const COLUMNS: SortableColumn<Reviewer>[] = [
  { id: "name", header: "Reviewer", value: (r) => r.name },
  {
    id: "open",
    header: "Open",
    width: "72px",
    align: "end",
    numeric: true,
    value: (r) => r.open,
  },
  {
    id: "seen",
    header: "Last seen",
    width: "96px",
    align: "end",
    value: (r) => r.ago,
    cell: (r) => r.seen,
  },
];

export function SortableTableDemo() {
  return (
    <div className="mx-auto w-full max-w-[440px]">
      <SortableTable
        label="Reviewers"
        rows={REVIEWERS}
        getRowId={(r) => r.id}
        getRowLabel={(r) => r.name}
        markable
        columns={COLUMNS}
      />
    </div>
  );
}
