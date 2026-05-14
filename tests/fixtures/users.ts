/**
 * Datos del usuario de prueba.
 * Es creado automáticamente por ensureTestUser() en el global setup.
 */
export const TEST_USER = {
  nombre: 'Usuario Playwright',
  email: 'playwright@test.local',
  password: 'TestPass1234'
};

export const ADMIN_USER = {
  nombre: 'Administrador',
  email: 'admin@test.local',
  password: 'AdminPass1234'
};

export const INVALID_USER = {
  email: 'no-existe@dominio.test',
  password: 'wrong-password-1234'
};

export const MALFORMED_USER = {
  email: 'no-es-un-email',
  password: '123' // demasiado corta
};
