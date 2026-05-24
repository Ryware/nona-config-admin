import { Title } from "@solidjs/meta";
import { useParams } from "@solidjs/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import {
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  untrack,
} from "solid-js";

import { AppLayout } from "../../components/layout/AppLayout";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";
import { Input } from "../../components/ui/input";
import { MIcon } from "../../components/ui/icons";
import { useToast } from "../../components/ui/toast";
import { configEntryService } from "../../services/config-entry.service";
import { environmentService } from "../../services/environment.service";
import { projectService } from "../../services/project.service";

import type { ParsedImport } from "./components/ProjectBulkImport";
import { ProjectBulkImport } from "./components/ProjectBulkImport";
import { ProjectEnvironments } from "./components/ProjectEnvironments";
import { ProjectParamCreateForm } from "./components/ProjectParamCreateForm";
import type { ParamRevision } from "./components/ProjectParamEditDrawer";
import { ProjectParamEditDrawer } from "./components/ProjectParamEditDrawer";
import { ProjectParamsTable } from "./components/ProjectParamsTable";

import type {
  CreateConfigEntryRequest,
  CreateEnvironmentRequest,
  Environment,
} from "../../types";

interface AuditLogEntry {
  id: string;
  time: string;
  actor: string;
  actionCode:
    | "CREATE_ENTRY"
    | "UPDATE_ENTRY"
    | "DELETE_ENTRY"
    | "CREATE_PROJECT"
    | "UPDATE_PROJECT"
    | "INVITE_USER";
  ipAddress: string;
  sysId: string;
  project: string;
  environment: string;
  key: string;
  oldValue?: string;
  newValue?: string;
  contentType?: string;
  scope?: string;
  displayName?: string;
  description?: string;
  oldDisplayName?: string;
  oldDescription?: string;
}

interface ParamMeta {
  displayName?: string;
  description?: string;
}

// Local helper to format key name into readable title-case display name
function autoFormatKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Standard fallback descriptions for developer keys
const PRESET_METADATA: Record<string, ParamMeta> = {
  DATABASE_PORT: {
    displayName: "Database Port",
    description: "The port number of the main database instance.",
  },
  DATABASE_URL: {
    displayName: "Database URL",
    description:
      "The primary database connection string, including credentials.",
  },
  SMTP_SERVER_TLS_PORT: {
    displayName: "Mail Server Port (TLS)",
    description: "The port number used for sending secure emails via SMTP TLS.",
  },
  SMTP_PORT: {
    displayName: "Mail Server Port (Standard)",
    description: "Standard SMTP mail server port.",
  },
  SMTP_HOST: {
    displayName: "Mail Server Host",
    description: "The hostname or domain of the outgoing SMTP mail server.",
  },
  JWT_EXPIRY: {
    displayName: "Session Token Expiry",
    description:
      "The duration session JSON Web Tokens (JWT) remain valid (e.g. 24h, 7d).",
  },
  JWT_SECRET: {
    displayName: "Session Signature Secret",
    description:
      "The secret cryptographic key used to sign and verify user session tokens.",
  },
  PORT: {
    displayName: "Application Port",
    description: "The local network port on which the web server listens.",
  },
  NODE_ENV: {
    displayName: "Environment Mode",
    description:
      "Determines build optimizations and logs (production, staging, development).",
  },
  API_URL: {
    displayName: "API Base URL",
    description: "The root URL address of the backend service API.",
  },
  APP_ENV: {
    displayName: "App Deployment Mode",
    description: "Specifies which environment context the application runs in.",
  },
  LOG_LEVEL: {
    displayName: "System Log Detail Level",
    description: "Controls what logs are recorded (debug, info, warn, error).",
  },
};

function getCurrentUser(): string {
  try {
    const token = localStorage.getItem("auth_token");
    if (!token) return "admin@nona.dev";
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return (
      payload.email ||
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ] ||
      payload.sub ||
      "admin@nona.dev"
    );
  } catch {
    return "admin@nona.dev";
  }
}

function addParamRevision(
  project: string,
  environment: string,
  key: string,
  value: string,
  displayName?: string,
  description?: string,
) {
  try {
    const raw = localStorage.getItem("nonaconfig_param_history") || "[]";
    const history: ParamRevision[] = JSON.parse(raw);
    const newRevision: ParamRevision = {
      timestamp: new Date().toISOString(),
      project,
      environment,
      key,
      value,
      actor: getCurrentUser(),
      displayName,
      description,
    };
    history.push(newRevision);
    localStorage.setItem("nonaconfig_param_history", JSON.stringify(history));
  } catch (e) {
    console.error("Failed to write to param history", e);
  }
}

function addAuditLog(
  project: string,
  environment: string,
  key: string,
  actionCode: "CREATE_ENTRY" | "UPDATE_ENTRY" | "DELETE_ENTRY",
  oldValue?: string,
  newValue?: string,
  contentType?: string,
  scope?: string,
  displayName?: string,
  description?: string,
  oldDisplayName?: string,
  oldDescription?: string,
) {
  try {
    const raw = localStorage.getItem("nonaconfig_audit_logs") || "[]";
    const logs: AuditLogEntry[] = JSON.parse(raw);
    const ipAddress = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
    const sysId = `TXN-${Math.floor(1000 + Math.random() * 9000)
      .toString(16)
      .toUpperCase()}`;

    const newLog: AuditLogEntry = {
      id:
        "param-log-" +
        Date.now() +
        "-" +
        Math.random().toString(36).substr(2, 9),
      time: new Date().toISOString(),
      actor: getCurrentUser(),
      actionCode,
      ipAddress,
      sysId,
      project,
      environment,
      key,
      oldValue,
      newValue,
      contentType,
      scope,
      displayName,
      description,
      oldDisplayName,
      oldDescription,
    };
    logs.push(newLog);
    localStorage.setItem("nonaconfig_audit_logs", JSON.stringify(logs));
  } catch (e) {
    console.error("Failed to write audit log", e);
  }
}

function getParamHistory(
  proj: string,
  env: string,
  key: string,
): ParamRevision[] {
  try {
    const raw = localStorage.getItem("nonaconfig_param_history") || "[]";
    const history: ParamRevision[] = JSON.parse(raw);
    const filtered = history.filter(
      (h) => h.project === proj && h.environment === env && h.key === key,
    );
    return filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  } catch {
    return [];
  }
}

function getParamMeta(
  proj: string,
  env: string,
  key: string,
): { displayName: string; description: string } {
  try {
    const raw = localStorage.getItem("nonaconfig_param_meta");
    if (raw) {
      const dict = JSON.parse(raw);
      const keyPath = `${proj}:${env}:${key}`;
      if (dict[keyPath]) {
        return {
          displayName: dict[keyPath].displayName || autoFormatKey(key),
          description:
            dict[keyPath].description || `Configuration setting for ${key}.`,
        };
      }
    }
  } catch (e) {
    console.error("Failed to read metadata", e);
  }

  const preset = PRESET_METADATA[key];
  return {
    displayName: preset?.displayName || autoFormatKey(key),
    description: preset?.description || `Configuration setting for ${key}.`,
  };
}

function setParamMeta(proj: string, env: string, key: string, meta: ParamMeta) {
  try {
    const raw = localStorage.getItem("nonaconfig_param_meta") || "{}";
    const dict = JSON.parse(raw);
    const keyPath = `${proj}:${env}:${key}`;
    dict[keyPath] = { ...dict[keyPath], ...meta };
    localStorage.setItem("nonaconfig_param_meta", JSON.stringify(dict));
  } catch (e) {
    console.error("Failed to save metadata", e);
  }
}

export default function ProjectPage() {
  const params = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [activeEnvName, setActiveEnvName] = createSignal<string>("");
  const [paramSearch, setParamSearch] = createSignal("");
  const [copiedKey, setCopiedKey] = createSignal<string | null>(null);
  const [showEnvForm, setShowEnvForm] = createSignal(false);
  const [showConfigForm, setShowConfigForm] = createSignal(false);
  const [confirmDeleteEntry, setConfirmDeleteEntry] = createSignal<
    string | null
  >(null);
  const [confirmDeleteEnv, setConfirmDeleteEnv] = createSignal<string | null>(
    null,
  );
  const [editingEntry, setEditingEntry] = createSignal<any | null>(null);
  const [editDisplayName, setEditDisplayName] = createSignal("");
  const [editDescription, setEditDescription] = createSignal("");
  const [historyRevisions, setHistoryRevisions] = createSignal<ParamRevision[]>(
    [],
  );
  const [showBulkImport, setShowBulkImport] = createSignal(false);

  const projectsQuery = useQuery(() => ({
    queryKey: ["projects"],
    queryFn: () => projectService.getAll(),
  }));

  const project = createMemo(() =>
    projectsQuery.data?.find((p) => p.urlSlug === params.slug),
  );

  const projectId = createMemo(() => project()?.name ?? "");

  const environmentsQuery = useQuery(() => ({
    queryKey: ["environments", project()?.urlSlug],
    queryFn: () => environmentService.getAll(projectId()),
    enabled: !!project(),
  }));

  createEffect(() => {
    if (
      !untrack(activeEnvName) &&
      environmentsQuery.data &&
      environmentsQuery.data.length > 0
    ) {
      setActiveEnvName(environmentsQuery.data[0].name);
    }
  });

  const configQuery = useQuery(() => ({
    queryKey: ["config-entries", project()?.urlSlug, activeEnvName()],
    queryFn: () => configEntryService.getAll(projectId(), activeEnvName()),
    enabled: !!project() && !!activeEnvName(),
  }));

  const filteredConfig = createMemo(() => {
    const q = paramSearch().toLowerCase().trim();
    if (!q) return configQuery.data ?? [];
    return (configQuery.data ?? []).filter(
      (e) =>
        e.key.toLowerCase().includes(q) ||
        e.value.toLowerCase().includes(q) ||
        getParamMeta(projectId(), activeEnvName(), e.key)
          .displayName.toLowerCase()
          .includes(q),
    );
  });

  const copyValue = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      addToast("Copy failed", "error");
    }
  };

  // Keyboard shortcut listener to close drawers
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setEditingEntry(null);
      setShowConfigForm(false);
      setShowEnvForm(false);
      setShowBulkImport(false);
    }
  };
  onMount(() => document.addEventListener("keydown", handleEscape));
  onCleanup(() => document.removeEventListener("keydown", handleEscape));

  // Env creation mutation
  const createEnvMutation = useMutation(() => ({
    mutationFn: (req: CreateEnvironmentRequest) =>
      environmentService.create(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
      setShowEnvForm(false);
      addToast("Environment created", "success");
    },
    onError: () => addToast("Failed to create environment", "error"),
  }));

  // Env deletion mutation
  const deleteEnvMutation = useMutation(() => ({
    mutationFn: (environmentName: string) =>
      environmentService.delete(projectId(), environmentName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
      addToast("Environment deleted", "success");
    },
    onError: () => addToast("Failed to delete environment", "error"),
  }));

  // Param creation mutation
  const createConfigMutation = useMutation(() => ({
    mutationFn: (req: CreateConfigEntryRequest) =>
      configEntryService.upsert(req.projectId, activeEnvName(), req.key, req),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["config-entries"] });
      const meta = getParamMeta(projectId(), activeEnvName(), variables.key);
      addParamRevision(
        projectId(),
        activeEnvName(),
        variables.key,
        variables.value,
        meta.displayName,
        meta.description,
      );
      addAuditLog(
        projectId(),
        activeEnvName(),
        variables.key,
        "CREATE_ENTRY",
        undefined,
        variables.value,
        variables.contentType,
        variables.scope,
        meta.displayName,
        meta.description,
      );
      setShowConfigForm(false);
      addToast("Parameter created", "success");
    },
    onError: () => addToast("Failed to create parameter", "error"),
  }));

  // Param deletion mutation
  const deleteConfigMutation = useMutation(() => ({
    mutationFn: (id: string) =>
      configEntryService.delete(projectId(), activeEnvName(), id),
    onSuccess: (_, id) => {
      const deletedEntry = configQuery.data?.find((entry) => entry.key === id);
      const oldValue = deletedEntry?.value;
      const deletedMeta = getParamMeta(projectId(), activeEnvName(), id);
      addAuditLog(
        projectId(),
        activeEnvName(),
        id,
        "DELETE_ENTRY",
        oldValue,
        undefined,
        undefined,
        undefined,
        deletedMeta.displayName,
        deletedMeta.description,
      );
      queryClient.invalidateQueries({ queryKey: ["config-entries"] });
      addToast("Parameter deleted", "success");
    },
    onError: () => addToast("Failed to delete parameter", "error"),
  }));

  // Drawer handlers
  const handleOpenEditDrawer = (entry: any) => {
    setEditingEntry(entry);
    const meta = getParamMeta(projectId(), activeEnvName(), entry.key);
    setEditDisplayName(meta.displayName);
    setEditDescription(meta.description);
    setHistoryRevisions(
      getParamHistory(projectId(), activeEnvName(), entry.key),
    );
  };

  // Param update settings mutation
  const updateConfigMutation = useMutation(() => ({
    mutationFn: (req: {
      key: string;
      value: string;
      contentType: any;
      scope: any;
      displayName?: string;
      description?: string;
    }) =>
      configEntryService.upsert(projectId(), activeEnvName(), req.key, {
        value: req.value,
        contentType: req.contentType,
        scope: req.scope,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["config-entries"] });

      const dispName =
        variables.displayName !== undefined
          ? variables.displayName.trim()
          : editDisplayName().trim();
      const desc =
        variables.description !== undefined
          ? variables.description.trim()
          : editDescription().trim();

      // Capture old metadata BEFORE updating it — used for diff display in audit logs
      const oldMeta = getParamMeta(projectId(), activeEnvName(), variables.key);
      const oldDisplayName = oldMeta.displayName;
      const oldDescription = oldMeta.description;

      if (editingEntry()) {
        setParamMeta(projectId(), activeEnvName(), editingEntry()!.key, {
          displayName: dispName,
          description: desc,
        });
      }

      const oldEntry = configQuery.data?.find(
        (entry) => entry.key === variables.key,
      );
      const oldValue = oldEntry?.value;
      addParamRevision(
        projectId(),
        activeEnvName(),
        variables.key,
        variables.value,
        dispName,
        desc,
      );
      addAuditLog(
        projectId(),
        activeEnvName(),
        variables.key,
        "UPDATE_ENTRY",
        oldValue,
        variables.value,
        variables.contentType,
        variables.scope,
        dispName,
        desc,
        oldDisplayName,
        oldDescription,
      );

      const entry = editingEntry();
      if (entry) {
        setHistoryRevisions(
          getParamHistory(projectId(), activeEnvName(), entry.key),
        );
      }

      setEditingEntry(null);
      addToast("Parameter updated successfully", "success");
    },
    onError: () => addToast("Failed to update parameter", "error"),
  }));

  // Bulk import callback
  const handleBulkImport = async (selectedItems: ParsedImport[]) => {
    for (const item of selectedItems) {
      const dispName = autoFormatKey(item.key);
      const desc = `Imported parameter: ${item.key}`;

      setParamMeta(projectId(), activeEnvName(), item.key, {
        displayName: dispName,
        description: desc,
      });

      const oldEntry = configQuery.data?.find(
        (entry) => entry.key === item.key,
      );
      const oldValue = oldEntry?.value;

      addParamRevision(
        projectId(),
        activeEnvName(),
        item.key,
        item.value,
        dispName,
        desc,
      );
      addAuditLog(
        projectId(),
        activeEnvName(),
        item.key,
        oldValue !== undefined ? "UPDATE_ENTRY" : "CREATE_ENTRY",
        oldValue,
        item.value,
        item.contentType,
        item.scope,
        dispName,
        desc,
      );

      await configEntryService.upsert(projectId(), activeEnvName(), item.key, {
        value: item.value,
        contentType: item.contentType,
        scope: item.scope,
      });
    }

    queryClient.invalidateQueries({ queryKey: ["config-entries"] });
    setShowBulkImport(false);
    addToast(
      `Imported ${selectedItems.length} parameters successfully`,
      "success",
    );
  };

  const handleRestoreRevision = (rev: ParamRevision) => {
    const entry = editingEntry();
    if (entry) {
      const currentMeta = getParamMeta(projectId(), activeEnvName(), entry.key);
      const targetDisplayName =
        rev.displayName !== undefined
          ? rev.displayName
          : currentMeta.displayName;
      const targetDescription =
        rev.description !== undefined
          ? rev.description
          : currentMeta.description;

      setEditDisplayName(targetDisplayName);
      setEditDescription(targetDescription);

      updateConfigMutation.mutate({
        key: entry.key,
        value: rev.value,
        contentType: entry.contentType,
        scope: entry.scope,
        displayName: targetDisplayName,
        description: targetDescription,
      });
    }
  };

  return (
    <AppLayout>
      <Title>
        {project()
          ? `${project()!.name} | Nona Config Admin`
          : "Project | Nona Config Admin"}
      </Title>
      <div class="space-y-6">
        {/* Header */}
        <Show
          when={project()}
          fallback={
            <div class="flex items-center justify-between gap-4">
              <div>
                <h2 class="text-[17px] font-headline font-bold text-on-surface tracking-tight">
                  Projects
                </h2>
              </div>
            </div>
          }
        >
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 class="text-[17px] font-headline font-bold text-on-surface tracking-tight">
                {project()!.name}
              </h2>
              <p class="text-[12.5px] text-on-surface-variant mt-1">
                {project()!.description || "No description provided."}
              </p>
            </div>
            <div class="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowEnvForm(!showEnvForm())}
                class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-surface-container-high text-on-surface-variant hover:bg-surface-bright hover:text-on-surface transition-all active:scale-[0.98] border-0 cursor-pointer"
              >
                <MIcon name="add" class="text-[17px]" />
                Add Environment
              </button>
              <button
                onClick={() => {
                  setShowBulkImport(!showBulkImport());
                  setShowConfigForm(false);
                }}
                class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-surface-container-high text-on-surface-variant hover:bg-surface-bright hover:text-on-surface transition-all active:scale-[0.98] border-0 cursor-pointer"
              >
                <MIcon name="publish" class="text-[17px]" />
                Bulk Import
              </button>
              <button
                onClick={() => {
                  setShowConfigForm(!showConfigForm());
                  setShowBulkImport(false);
                }}
                class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-primary text-on-primary transition-all active:scale-[0.98] hover:brightness-105 border-0 cursor-pointer"
              >
                <MIcon name="add" class="text-[17px]" />
                Add Parameter
              </button>
            </div>
          </div>
        </Show>

        {/* Bulk Import section */}
        <Show when={showBulkImport()}>
          <ProjectBulkImport
            onCancel={() => setShowBulkImport(false)}
            onImport={handleBulkImport}
            existingEntries={configQuery.data ?? []}
            isPending={updateConfigMutation.isPending}
            addToast={addToast}
          />
        </Show>

        {/* Environments */}
        <ProjectEnvironments
          environments={environmentsQuery.data ?? []}
          activeEnvName={activeEnvName()}
          setActiveEnvName={setActiveEnvName}
          onCreateEnv={(name) =>
            createEnvMutation.mutate({ projectId: projectId(), name })
          }
          onDeleteEnv={setConfirmDeleteEnv}
          showEnvForm={showEnvForm()}
          setShowEnvForm={setShowEnvForm}
          createEnvPending={createEnvMutation.isPending}
        />

        {/* Config entries table */}
        <div class="space-y-4">
          <div class="flex items-center justify-between gap-4 flex-wrap">
            <p class="text-[10px] font-bold uppercase tracking-widest text-outline font-headline flex items-center gap-2">
              <span>Parameters</span>
              <Show when={activeEnvName()}>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                  {environmentsQuery.data
                    ?.find((e: Environment) => e.name === activeEnvName())
                    ?.name?.toUpperCase()}
                </span>
              </Show>
            </p>
            <Show when={activeEnvName() && (configQuery.data?.length ?? 0) > 0}>
              <div class="relative">
                <MIcon
                  name="search"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none"
                />
                <Input
                  type="text"
                  placeholder="Search parameters…"
                  value={paramSearch()}
                  onInput={(e) => setParamSearch(e.currentTarget.value)}
                  class="h-9 w-52"
                />
              </div>
            </Show>
          </div>

          <Show when={!activeEnvName()}>
            <div class="bg-surface-container-low border border-outline-variant/15 rounded-2xl p-10 text-center text-on-surface-variant text-sm shadow-sm">
              Select an environment above to view its parameters
            </div>
          </Show>

          {/* New Parameter Form */}
          <Show when={activeEnvName() && showConfigForm()}>
            <ProjectParamCreateForm
              onCancel={() => setShowConfigForm(false)}
              onSubmit={(data) => {
                setParamMeta(projectId(), activeEnvName(), data.key, {
                  displayName: data.displayName,
                  description: data.description,
                });
                createConfigMutation.mutate({
                  projectId: projectId(),
                  key: data.key,
                  value: data.value,
                  contentType: data.contentType,
                  scope: data.scope,
                });
              }}
              isPending={createConfigMutation.isPending}
            />
          </Show>

          {/* Parameters table */}
          <Show when={activeEnvName() && (configQuery.data?.length ?? 0) > 0}>
            <ProjectParamsTable
              isLoading={configQuery.isLoading}
              projectId={projectId()}
              activeEnvName={activeEnvName()}
              filteredConfig={filteredConfig()}
              onSelectEntry={handleOpenEditDrawer}
              onDeleteEntry={setConfirmDeleteEntry}
              copiedKey={copiedKey()}
              onCopyValue={copyValue}
              getParamMeta={getParamMeta}
              search={paramSearch()}
            />
          </Show>

          <Show
            when={
              activeEnvName() &&
              !configQuery.isLoading &&
              (configQuery.data?.length ?? 0) === 0
            }
          >
            <div class="bg-surface-container-low border border-outline-variant/15 rounded-2xl p-10 text-center text-on-surface-variant text-sm shadow-sm">
              No parameters yet for this environment
            </div>
          </Show>
        </div>

        {/* Parameter Edit Drawer */}
        <ProjectParamEditDrawer
          entry={editingEntry()}
          activeEnvName={activeEnvName()}
          initialDisplayName={editDisplayName()}
          initialDescription={editDescription()}
          onClose={() => setEditingEntry(null)}
          onSaveSettings={(data) => {
            setEditDisplayName(data.displayName);
            setEditDescription(data.description);
            updateConfigMutation.mutate({
              key: editingEntry()!.key,
              value: data.value,
              contentType: editingEntry()!.contentType,
              scope: editingEntry()!.scope,
              displayName: data.displayName,
              description: data.description,
            });
          }}
          isSaving={updateConfigMutation.isPending}
          historyRevisions={historyRevisions()}
          onRestoreRevision={handleRestoreRevision}
        />
      </div>

      {/* Confirm: delete parameter */}
      <ConfirmDialog
        open={confirmDeleteEntry() !== null}
        title="Delete Parameter?"
        message={
          <>
            Permanently delete{" "}
            <span class="font-mono text-primary font-bold">
              {confirmDeleteEntry()}
            </span>{" "}
            from the{" "}
            <span class="font-medium text-on-surface">{activeEnvName()}</span>{" "}
            environment?
          </>
        }
        confirmLabel="Delete Parameter"
        variant="danger"
        isLoading={deleteConfigMutation.isPending}
        onConfirm={() => {
          const key = confirmDeleteEntry();
          if (key) {
            deleteConfigMutation.mutate(key);
            setConfirmDeleteEntry(null);
          }
        }}
        onCancel={() => setConfirmDeleteEntry(null)}
      />

      {/* Confirm: delete environment */}
      <ConfirmDialog
        open={confirmDeleteEnv() !== null}
        title="Delete Environment?"
        message={
          <>
            Permanently delete the{" "}
            <span class="font-mono text-primary font-bold">
              {confirmDeleteEnv()}
            </span>{" "}
            environment and all its parameters?
          </>
        }
        confirmLabel="Delete Environment"
        variant="danger"
        isLoading={deleteEnvMutation.isPending}
        onConfirm={() => {
          const env = confirmDeleteEnv();
          if (env) {
            deleteEnvMutation.mutate(env);
            setConfirmDeleteEnv(null);
          }
        }}
        onCancel={() => setConfirmDeleteEnv(null)}
      />
    </AppLayout>
  );
}
