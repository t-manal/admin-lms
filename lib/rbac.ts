/**
 * RBAC Configuration for Admin Panel
 * 
 * SECURITY: This panel is for INSTRUCTOR role.
 * Database has no ADMIN role in practice - INSTRUCTOR is the control panel user.
 */

// =========================================================
// CANONICAL ROLE DEFINITIONS (PHASE 2 - FINAL)
// =========================================================
export const ADMIN_PANEL_ROLES = ['INSTRUCTOR'] as const;

export type AdminPanelRole = typeof ADMIN_PANEL_ROLES[number];

/**
 * Check if a role is authorized for admin panel access (INSTRUCTOR only)
 */
export function isInstructor(role: string | undefined | null): boolean {
  if (!role) return false;
  return role === 'INSTRUCTOR';
}

/**
 * @deprecated Use isInstructor instead. Kept for backward compat during migration.
 */
export function isAdminPanelRole(role: string | undefined | null): boolean {
  return isInstructor(role);
}
