/**
 * Centralised user-facing toast / notification strings.
 * Import these constants instead of using inline string literals.
 */
export const MSG = {
  // --- Parameters ---
  PARAM_CREATED: "Parameter created",
  PARAM_UPDATED: "Parameter updated successfully",
  PARAM_DELETED: "Parameter deleted",
  PARAM_CREATE_FAILED: "Failed to create parameter",
  PARAM_UPDATE_FAILED: "Failed to update parameter",
  PARAM_DELETE_FAILED: "Failed to delete parameter",

  // --- Environments ---
  ENV_CREATED: "Environment created",
  ENV_DELETED: "Environment deleted",
  ENV_CREATE_FAILED: "Failed to create environment",
  ENV_DELETE_FAILED: "Failed to delete environment",

  // --- Projects ---
  PROJECT_CREATED: "Project created",
  PROJECT_DELETED: "Project deleted",
  PROJECT_CREATE_FAILED: "Failed to create project",
  PROJECT_DELETE_FAILED: "Failed to delete project",

  // --- API Keys ---
  API_KEY_REGENERATED: "API key regenerated",
  API_KEY_REGEN_FAILED: "Failed to regenerate API key",
  COPIED: "Copied to clipboard",
  COPY_FAILED: "Copy failed",

  // --- Users / Members ---
  INVITE_GENERATED: "Invitation link generated",
  INVITE_COPIED: "Invitation link copied",
  INVITE_COPY_FAILED: "Failed to copy invitation link",
  MEMBER_UPDATED: "Member updated successfully",
  MEMBER_REMOVED: "Team member removed",
  MEMBER_UPDATE_FAILED: "Failed to update member",
  MEMBER_REMOVE_FAILED: "Failed to remove member",

  // --- Validation ---
  EMAIL_REQUIRED: "Email is required",
  NAME_REQUIRED: "Name is required",

  // --- Bulk Import ---
  BULK_IMPORT_NO_SELECTION: "No parameters selected to import",
} as const;
