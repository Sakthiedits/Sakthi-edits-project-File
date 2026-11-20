import * as apiLib from '../lib/api';
import type { Project, ProjectFormData, LoginCredentials, AdminUser, VideoSourceType } from '../types';

export * from '../lib/api';

export const checkAdminAuth = async (): Promise<boolean> => {
  try {
    const res = await apiLib.checkAdminSession();
    return res.success && !!res.data;
  } catch {
    return false;
  }
};
