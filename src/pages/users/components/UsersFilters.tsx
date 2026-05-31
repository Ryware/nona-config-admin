import { Input } from "../../../shared/ui/input";
import { Select } from "../../../shared/ui/select";

interface UsersFiltersProps {
  search: string;
  roleFilter: string;
  onSearchChange: (val: string) => void;
  onRoleFilterChange: (val: string) => void;
}

export function UsersFilters(props: UsersFiltersProps) {
  return (
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="flex-1 max-w-sm">
        <Input
          type="text"
          placeholder="Search by name or email…"
          value={props.search}
          onInput={(e: any) => props.onSearchChange(e.currentTarget.value)}
          class="h-10"
          leftIcon="search"
        />
      </div>
      <div class="w-full sm:w-48">
        <Select
          value={props.roleFilter}
          onChange={(val: string) => props.onRoleFilterChange(val)}
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
