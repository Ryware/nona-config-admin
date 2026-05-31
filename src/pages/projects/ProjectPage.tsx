import { Title } from "@solidjs/meta";
import { useParams } from "@solidjs/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import {
  Show,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";

import { AppLayout } from "../../widgets/app-shell/AppLayout";
import { ConfirmDialog } from "../../shared/ui/confirm-dialog";
import { useToast } from "../../shared/ui/toast";
import { configEntryService } from "../../entities/project/api/config-entry.service";
import { environmentService } from "../../entities/project/api/environment.service";
import { projectService } from "../../entities/project/api/project.service";

import type { ParsedImport } from "../../features/project-bulk-import/ProjectBulkImport";
import { ProjectBulkImport } from "../../features/project-bulk-import/ProjectBulkImport";
import { ProjectEnvironments } from "../../features/project-environments/ProjectEnvironments";
import { ProjectParamEditDrawer } from "../../features/project-param-edit/ProjectParamEditDrawer";
import { ProjectParamsTab } from "../../features/project-params/ProjectParamsTab";
import { ProjectApiKeys } from "./components/ProjectApiKeys";
import { ProjectHeader } from "./components/ProjectHeader";
import { ProjectPageSkeleton } from "./components/ProjectPageSkeleton";

import type {
  CreateConfigEntryRequest,
  CreateEnvironmentRequest,
  Project,
  ConfigEntry,
} from "../../types";
import {
  localParamMetadataService,
  autoFormatKey,
} from "../../entities/project/api/metadata.service";
import type { ParamRevision } from "../../entities/project/api/metadata.service";
import { authStore } from "../../entities/auth/model/store";
import { projectKeys } from "../../entities/project/queries/keys";
import { useEscapeKey } from "../../shared/hooks/useEscapeKey";
import { MSG } from "../../shared/lib/messages";



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
  const [editingEntry, setEditingEntry] = createSignal<ConfigEntry | null>(null);
  const [editDisplayName, setEditDisplayName] = createSignal("");
  const [editDescription, setEditDescription] = createSignal("");
  const [historyRevisions, setHistoryRevisions] = createSignal<ParamRevision[]>(
    [],
  );
  const [showBulkImport, setShowBulkImport] = createSignal(false);

  const projectsQuery = useQuery(() => ({
    queryKey: projectKeys.list(),
    queryFn: () => projectService.getAll(),
  }));

  const project = createMemo(() =>
    projectsQuery.data?.find((p: Project) => p.urlSlug === params.slug),
  );

  const projectId = createMemo(() => project()?.name ?? "");

  const environmentsQuery = useQuery(() => ({
    queryKey: projectKeys.environments(params.slug),
    queryFn: () => environmentService.getAll(projectId()),
    enabled: !!project(),
  }));

  createEffect(() => {
    const envs = environmentsQuery.data;
    if (envs && envs.length > 0 && !activeEnvName()) {
      setActiveEnvName(envs[0].name);
    }
  });

  const configQuery = useQuery(() => ({
    queryKey: projectKeys.configEntries(params.slug, activeEnvName()),
    queryFn: () => configEntryService.getAll(projectId(), activeEnvName()),
    enabled: !!project() && !!activeEnvName(),
  }));

  const filteredConfig = createMemo(() => {
    const q = paramSearch().toLowerCase().trim();
    if (!q) return configQuery.data ?? [];
    return (configQuery.data ?? []).filter(
      (e: ConfigEntry) =>
        e.key.toLowerCase().includes(q) ||
        e.value.toLowerCase().includes(q) ||
        localParamMetadataService
          .getMeta(projectId(), activeEnvName(), e.key)
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
      addToast(MSG.COPY_FAILED, "error");
    }
  };

  // Close drawers on Escape
  useEscapeKey(() => {
    setEditingEntry(null);
    setShowConfigForm(false);
    setShowEnvForm(false);
    setShowBulkImport(false);
  });

  // Env creation mutation
  const createEnvMutation = useMutation(() => ({
    mutationFn: (req: CreateEnvironmentRequest) =>
      environmentService.create(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.environments(params.slug) });
      setShowEnvForm(false);
      addToast(MSG.ENV_CREATED, "success");
    },
    onError: () => addToast(MSG.ENV_CREATE_FAILED, "error"),
  }));

  // Env deletion mutation
  const deleteEnvMutation = useMutation(() => ({
    mutationFn: (environmentName: string) =>
      environmentService.delete(projectId(), environmentName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.environments(params.slug) });
      addToast(MSG.ENV_DELETED, "success");
    },
    onError: () => addToast(MSG.ENV_DELETE_FAILED, "error"),
  }));

  // Param creation mutation
  const createConfigMutation = useMutation(() => ({
    mutationFn: (req: CreateConfigEntryRequest) =>
      configEntryService.upsert(req.projectId, activeEnvName(), req.key, req),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.configEntries(params.slug, activeEnvName()) });
      const meta = localParamMetadataService.getMeta(
        projectId(),
        activeEnvName(),
        variables.key,
      );
      localParamMetadataService.addRevision(
        projectId(),
        activeEnvName(),
        variables.key,
        variables.value,
        authStore.getSession()?.email ?? "system",
        meta.displayName,
        meta.description,
      );
      setShowConfigForm(false);
      addToast(MSG.PARAM_CREATED, "success");
    },
    onError: () => addToast(MSG.PARAM_CREATE_FAILED, "error"),
  }));

  // Param deletion mutation
  const deleteConfigMutation = useMutation(() => ({
    mutationFn: (id: string) =>
      configEntryService.delete(projectId(), activeEnvName(), id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.configEntries(params.slug, activeEnvName()) });
      addToast(MSG.PARAM_DELETED, "success");
    },
    onError: () => addToast(MSG.PARAM_DELETE_FAILED, "error"),
  }));

  // Drawer handlers
  const handleOpenEditDrawer = (entry: ConfigEntry) => {
    setEditingEntry(entry);
    const meta = localParamMetadataService.getMeta(
      projectId(),
      activeEnvName(),
      entry.key,
    );
    setEditDisplayName(meta.displayName);
    setEditDescription(meta.description);
    setHistoryRevisions(
      localParamMetadataService.getRevisions(
        projectId(),
        activeEnvName(),
        entry.key,
      ),
    );
  };

  // Param update settings mutation
  const updateConfigMutation = useMutation(() => ({
    mutationFn: (req: {
      key: string;
      value: string;
      contentType: ConfigEntry['contentType'];
      scope: ConfigEntry['scope'];
      displayName?: string;
      description?: string;
    }) =>
      configEntryService.upsert(projectId(), activeEnvName(), req.key, {
        value: req.value,
        contentType: req.contentType,
        scope: req.scope,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.configEntries(params.slug, activeEnvName()) });

      const dispName =
        variables.displayName !== undefined
          ? variables.displayName.trim()
          : editDisplayName().trim();
      const desc =
        variables.description !== undefined
          ? variables.description.trim()
          : editDescription().trim();

      if (editingEntry()) {
        localParamMetadataService.setMeta(
          projectId(),
          activeEnvName(),
          editingEntry()!.key,
          { displayName: dispName, description: desc },
        );
      }

      localParamMetadataService.addRevision(
        projectId(),
        activeEnvName(),
        variables.key,
        variables.value,
        authStore.getSession()?.email ?? "system",
        dispName,
        desc,
      );

      const entry = editingEntry();
      if (entry) {
        setHistoryRevisions(
          localParamMetadataService.getRevisions(
            projectId(),
            activeEnvName(),
            entry.key,
          ),
        );
      }

      setEditingEntry(null);
      addToast(MSG.PARAM_UPDATED, "success");
    },
    onError: () => addToast(MSG.PARAM_UPDATE_FAILED, "error"),
  }));

  // Bulk import callback
  const handleBulkImport = async (selectedItems: ParsedImport[]) => {
    for (const item of selectedItems) {
      const dispName = autoFormatKey(item.key);
      const desc = `Imported parameter: ${item.key}`;

      localParamMetadataService.setMeta(projectId(), activeEnvName(), item.key, {
        displayName: dispName,
        description: desc,
      });
      localParamMetadataService.addRevision(
        projectId(),
        activeEnvName(),
        item.key,
        item.value,
        authStore.getSession()?.email ?? "system",
        dispName,
        desc,
      );

      await configEntryService.upsert(projectId(), activeEnvName(), item.key, {
        value: item.value,
        contentType: item.contentType,
        scope: item.scope,
      });
    }

    queryClient.invalidateQueries({ queryKey: projectKeys.configEntries(params.slug, activeEnvName()) });
    setShowBulkImport(false);
    addToast(
      `Imported ${selectedItems.length} parameters successfully`,
      "success",
    );
  };

  const handleRestoreRevision = (rev: ParamRevision) => {
    const entry = editingEntry();
    if (entry) {
      const currentMeta = localParamMetadataService.getMeta(
        projectId(),
        activeEnvName(),
        entry.key,
      );
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

  // API key reroll mutation
  const rerollKeysMutation = useMutation(() => ({
    mutationFn: (keyType: 'Server' | 'Client') =>
      projectService.rerollKeys(projectId(), keyType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(params.slug) });
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
      addToast(MSG.API_KEY_REGENERATED, "success");
    },
    onError: () => addToast(MSG.API_KEY_REGEN_FAILED, "error"),
  }));

  return (
    <AppLayout>
      <Title>
        {project()
          ? `${project()!.name} | Nona Config Admin`
          : "Project | Nona Config Admin"}
      </Title>
      <div class="space-y-6">
        <Show when={!projectsQuery.isLoading} fallback={<ProjectPageSkeleton />}>
        <ProjectHeader
          project={project()}
          showConfigForm={showConfigForm()}
          showBulkImport={showBulkImport()}
          showEnvForm={showEnvForm()}
          onToggleEnvForm={() => setShowEnvForm(!showEnvForm())}
          onToggleBulkImport={() => {
            setShowBulkImport(!showBulkImport());
            setShowConfigForm(false);
          }}
          onToggleConfigForm={() => {
            setShowConfigForm(!showConfigForm());
            setShowBulkImport(false);
          }}
        />

        <Show when={project()}>
          <ProjectApiKeys
            project={project()!}
            isRolling={rerollKeysMutation.isPending}
            onReroll={(keyType) => rerollKeysMutation.mutate(keyType)}
            onCopied={(msg) => addToast(msg, "success")}
          />
        </Show>

        <Show when={showBulkImport()}>
          <ProjectBulkImport
            onCancel={() => setShowBulkImport(false)}
            onImport={handleBulkImport}
            existingEntries={configQuery.data ?? []}
            isPending={updateConfigMutation.isPending}
            addToast={addToast}
          />
        </Show>

        <ProjectEnvironments
          environments={environmentsQuery.data ?? []}
          activeEnvName={activeEnvName()}
          setActiveEnvName={setActiveEnvName}
          onCreateEnv={(name: string) =>
            createEnvMutation.mutate({ projectId: projectId(), name })
          }
          onDeleteEnv={setConfirmDeleteEnv}
          showEnvForm={showEnvForm()}
          setShowEnvForm={setShowEnvForm}
          createEnvPending={createEnvMutation.isPending}
        />

        <ProjectParamsTab
          activeEnvName={activeEnvName()}
          environments={environmentsQuery.data ?? []}
          filteredConfig={filteredConfig()}
          isLoading={configQuery.isLoading}
          projectId={projectId()}
          paramSearch={paramSearch()}
          onParamSearch={setParamSearch}
          showConfigForm={showConfigForm()}
          onCancelCreate={() => setShowConfigForm(false)}
          onSubmitCreate={(data) => {
            localParamMetadataService.setMeta(
              projectId(),
              activeEnvName(),
              data.key,
              { displayName: data.displayName, description: data.description },
            );
            createConfigMutation.mutate({
              projectId: projectId(),
              key: data.key,
              value: data.value,
              contentType: data.contentType,
              scope: data.scope,
            });
          }}
          isCreatePending={createConfigMutation.isPending}
          onSelectEntry={handleOpenEditDrawer}
          onDeleteEntry={setConfirmDeleteEntry}
          copiedKey={copiedKey()}
          onCopyValue={copyValue}
          getParamMeta={(proj, env, key) =>
            localParamMetadataService.getMeta(proj, env, key)
          }
        />

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
        </Show>
      </div>

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
