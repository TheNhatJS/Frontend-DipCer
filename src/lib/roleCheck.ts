/**
 * Helper functions để kiểm tra quyền truy cập dựa trên role
 */

export type UserRole = 'ISSUER' | 'DELEGATE';

/**
 * Kiểm tra xem user có phải là ISSUER không
 */
export function isIssuer(role?: string): boolean {
  return role === 'ISSUER';
}

/**
 * Kiểm tra xem user có phải là DELEGATE không
 */
export function isDelegate(role?: string): boolean {
  return role === 'DELEGATE';
}

/**
 * Kiểm tra xem user có quyền truy cập dashboard không (ISSUER hoặc DELEGATE)
 */
export function canAccessDashboard(role?: string): boolean {
  return role === 'ISSUER' || role === 'DELEGATE';
}

/**
 * Kiểm tra xem user có quyền quản lý trường không (chỉ ISSUER)
 * Bao gồm: xem dashboard trường, quản lý delegates, đổi địa chỉ ví
 */
export function canManageInstitution(role?: string): boolean {
  return role === 'ISSUER';
}

/**
 * Kiểm tra xem user có quyền cấp phát văn bằng không (ISSUER hoặc DELEGATE)
 */
export function canIssueDiploma(role?: string): boolean {
  return role === 'ISSUER' || role === 'DELEGATE';
}

/**
 * Kiểm tra xem user có quyền quản lý văn bằng không (ISSUER hoặc DELEGATE)
 */
export function canManageDiplomas(role?: string): boolean {
  return role === 'ISSUER' || role === 'DELEGATE';
}

/**
 * Kiểm tra xem user có quyền đổi mật khẩu không (ISSUER hoặc DELEGATE)
 */
export function canChangePassword(role?: string): boolean {
  return role === 'ISSUER' || role === 'DELEGATE';
}
