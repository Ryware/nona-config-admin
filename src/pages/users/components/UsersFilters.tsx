import { Input } from "../../../components/ui/input";
import { Select } from "../../../components/ui/select";

interface UsersFiltersProps {
  search: string;
  roleFilter: string;
  onSearchChange: (val: string) => void;
  onRoleFilterChange: (val: string) => void;
}

export function UsersFilters(props: UsersFiltersProps) {
  return (
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1 max-w-sm">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">search</span>
        <Input
          type="text"
          placeholder="Search by name or email…"
          value={props.search}
          onInput={(e) => props.onSearchChange(e.currentTarget.value)}
          class="h-10"
        />
      </div>
      <div class="w-full sm:w-48">
        <Select
          value={props.roleFilter}
          onChange={(val) => props.onRoleFilterChange(val)}
          class="h-10"
          options={[
            { value: "all", label: "All Roles" },
            { value: "admin", label: "Admin" },
            { value: "editor", label: "Editor" },
            { value: "viewer", label: "Viewer" },
          ]}
        />
      </div>
    </div>
  );
}
