import axiosClient from '../../../lib/axios/client';

export interface UserBrief {
  id: number;
  username: string;
  email?: string;
  roleName?: string;
  role_id?: number;
  roleId?: number;
}

interface RoleItem {
  id: number;
  name: string;
}

interface RawUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  name?: string;
  email?: string;
  roleName?: string;
  role_name?: string;
  role_id?: number;
  roleId?: number;
  role?: { name?: string } | string;
}

const findUsersArray = (payload: any, depth = 0): RawUser[] => {
  if (depth > 3 || payload == null) return [];
  if (Array.isArray(payload)) {
    const looksLikeUsers = payload.every(
      (item) => item && typeof item === 'object' && ('id' in item || 'username' in item || 'email' in item)
    );
    return looksLikeUsers ? (payload as RawUser[]) : [];
  }
  if (typeof payload !== 'object') return [];

  for (const key of ['data', 'items', 'results', 'rows', 'content', 'users', 'records', 'list']) {
    const nested = (payload as Record<string, any>)[key];
    const result = findUsersArray(nested, depth + 1);
    if (result.length > 0) return result;
  }

  // Last fallback: scan object values.
  for (const value of Object.values(payload as Record<string, any>)) {
    const result = findUsersArray(value, depth + 1);
    if (result.length > 0) return result;
  }

  return [];
};

const normalizeUsersPayload = (payload: any): RawUser[] => {
  return findUsersArray(payload);
};

const normalizeRoleName = (user: RawUser): string => {
  const rawRole =
    user.roleName ??
    user.role_name ??
    (typeof user.role === 'string' ? user.role : user.role?.name) ??
    '';
  return String(rawRole).toLowerCase();
};

const toUserBrief = (user: RawUser): UserBrief => ({
  id: user.id,
  username:
    user.username ??
    user.full_name ??
    `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() ??
    user.name ??
    `User ${user.id}`,
  email: user.email,
  roleName: normalizeRoleName(user),
  role_id: user.role_id,
  roleId: user.roleId,
});

const getProfessorRoleIds = async (): Promise<number[]> => {
  try {
    const response = await axiosClient.get('/roles');
    const rolesRaw = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    const roles = rolesRaw as RoleItem[];
    return roles
      .filter((r) => ['profesor', 'professor'].includes(String(r.name).toLowerCase()))
      .map((r) => r.id);
  } catch {
    return [];
  }
};

export const getProfessors = async (): Promise<UserBrief[]> => {
  let lastError: any = null;

  const tryRequest = async (url: string, params?: Record<string, any>): Promise<UserBrief[]> => {
    try {
      const response = await axiosClient.get(url, params ? { params } : undefined);
      return normalizeUsersPayload(response.data).map(toUserBrief);
    } catch (error) {
      lastError = error;
      return [];
    }
  };

  try {
    // Try server-side filters first (both EN and ES role names), across common endpoints.
    const directProfessorUsers = await tryRequest('/users', { role: 'professor' });
    if (directProfessorUsers.length > 0) return directProfessorUsers;

    const directProfesorUsers = await tryRequest('/users', { role: 'profesor' });
    if (directProfesorUsers.length > 0) return directProfesorUsers;

    const fromUsersAll = await tryRequest('/users/all');
    if (fromUsersAll.length > 0) return fromUsersAll;

    const fromAdminUsers = await tryRequest('/admin/users');
    if (fromAdminUsers.length > 0) return fromAdminUsers;

    const fromAuthUsers = await tryRequest('/auth/users');
    if (fromAuthUsers.length > 0) return fromAuthUsers;

    // Fallback: fetch all users and filter by roleName/role_id.
    const allUsers = await tryRequest('/users');
    const professorRoleIds = await getProfessorRoleIds();

    const filtered = allUsers.filter((u) => {
      const roleName = String(u.roleName ?? '').toLowerCase();
      const roleByName = roleName === 'profesor' || roleName === 'professor';
      const roleById =
        ((typeof u.role_id === 'number' && professorRoleIds.includes(u.role_id)) ||
          (typeof u.roleId === 'number' && professorRoleIds.includes(u.roleId))) &&
        professorRoleIds.length > 0;
      return roleByName || roleById;
    });

    // If role mapping fails, return all users so admin can still identify IDs by name/email.
    const source = filtered.length > 0 ? filtered : allUsers;
    if (source.length === 0 && lastError) {
      const message =
        (lastError as any)?.response?.data?.message ||
        (lastError as any)?.message ||
        'Unable to load users from backend';
      throw new Error(String(message));
    }

    return source;
  } catch (error) {
    console.error('Error fetching professors:', error);
    throw error;
  }
};
