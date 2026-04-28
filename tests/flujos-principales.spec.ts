import { test, expect } from '@playwright/test';

test.describe('AstroLaunchX - Flujos E2E Principales', () => {

  // --- FLUJO 1: LOGIN EXITOSO  ---
  test('1. Flujo Feliz: Un usuario válido puede iniciar sesión', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'user@astrolaunch.com');
    await page.fill('input[type="password"]', 'user');
    await page.getByRole('button', { name: /Entrar a la Base/i }).click();

    await page.waitForURL('**/');
    const botonSalir = page.getByText(/Salir/i);
    await expect(botonSalir).toBeVisible();
  });

  // --- FLUJO 2: LOGIN FALLIDO  ---
  test('2. Flujo Triste: Credenciales incorrectas muestran mensaje de error', async ({ page }) => {
    await page.goto('/login');
    
    // Metemos un usuario que no existe
    await page.fill('input[type="email"]', 'hacker@pirata.com');
    await page.fill('input[type="password"]', '123456');
    await page.getByRole('button', { name: /Entrar a la Base/i }).click();
    //Se comprueba que NO cambia de URL y aparece el error
    const mensajeError = page.getByText(/Credenciales incorrectas. Verifica tu email y contraseña./i);
    await expect(mensajeError).toBeVisible();
  });

  // --- FLUJO 3: SEGURIDAD Y RUTAS PROTEGIDAS (RBAC) ---
  test('3. Seguridad: Intento de acceso sin sesión redirige o bloquea', async ({ page }) => {
    //Se intenta entrar directamente al panel de administración sin loguearse
    await page.goto('/admin'); 
    //Tiene que Echar al usuario de vuelta al login
    await expect(page).toHaveURL(/.*login/);
  });

  // --- FLUJO 4: CERRAR SESIÓN ---
  test('4. Navegación: El usuario puede cerrar sesión y destruir su token', async ({ page }) => {
    //Se logea al ususario
    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@astrolaunch.com');
    await page.fill('input[type="password"]', 'user');
    await page.getByRole('button', { name: /Entrar a la Base/i }).click();
    await page.waitForURL('**/');

    await page.getByText(/Salir/i).click();

    //Se Comprueba que el botón de salir desaparece (se cerró la sesión)
    const botonSalir = page.getByText(/Salir/i);
    await expect(botonSalir).not.toBeVisible();
  });

  // --- FLUJO 5: FORMULARIO DE CONTACTO (Validaciones) ---
  test('5. Interacción: El formulario de contacto no se envía si está vacío', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('button[type="submit"]').click();

    //Se comprueba que salta la validación. 
    const mensajeError = page.getByText(/obligatorio/i).first();
    await expect(mensajeError).toBeVisible();
  });

  // --- FLUJO 6: PANEL ADMIN (Cambio de Roles con Confirmación) ---
  test('6. Panel Admin: Un administrador puede cambiar el rol de un usuario a Prensa', async ({ page }) => {
    //Se inicia sesión como ADMINISTRADOR
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@astrolaunch.com'); 
    await page.fill('input[type="password"]', 'admin'); // <-- Ajusta la contraseña de tu admin
    await page.getByRole('button', { name: /Entrar a la Base/i }).click();
    //Se espera a estar dentro y vamos al panel
    await page.waitForURL('**/');
    await page.goto('/admin');
    //Se encuentra AL USUARIO
    const filaUsuario = page.locator('tr').filter({ hasText: 'nuevopiloto@gmail.com' });
    //Se le dice al robot: "La próxima vez que salga un diálogo, acéptalo".
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    //Se hace click. Esto disparará el confirm, y el robot lo aceptará al vuelo.
    await filaUsuario.getByTitle('Dar privilegios de Sala de Prensa').click();
    //Se comprueba que en esa misma fila ahora se lee la etiqueta amarilla "PRENSA"
    await expect(filaUsuario).toContainText(/prensa/i);
  });

  // --- FLUJO 7: FILTROS Y NAVEGACIÓN DINÁMICA ---
  test('7. Exploración: Usuario filtra misiones tripuladas y entra al detalle de Crew-1', async ({ page }) => {
    //Se inicia sesión como PILOTO (Usuario estándar)
    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@astrolaunch.com'); 
    await page.fill('input[type="password"]', 'user');
    await page.getByRole('button', { name: /Entrar a la Base/i }).click();

    //Se expera a que la redirección nos deje en la página principal
    await page.waitForURL('**/');

    //Se aplica EL FILTRO "Solo Tripuladas"
    const selectorTripulacion = page.locator('select').filter({ hasText: 'Solo Tripuladas' });
    await selectorTripulacion.selectOption('crewed');

    // Al seleccionar la opción, React filtra la lista. Se espera a que aparezca Crew-1 y se hace clic.
    await page.getByText(/Crew-1/i).first().click();

    //Se verifica que estamos en la página de detalle
    //El título "Crew-1" es un Heading (H1)
    const tituloDetalle = page.getByRole('heading', { level: 1, name: /Crew-1/i });
    await expect(tituloDetalle).toBeVisible();
  });

  // --- FLUJO 8: DASHBOARD DE PRENSA (Tabs y Buscador Real-time) ---
  test('8. Prensa: Login, navegar a Cargas Útiles y filtrar por ABS con 3 resultados', async ({ page }) => {
    //Se inicia SESIÓN COMO PRENSA
    await page.goto('/login');
    await page.fill('input[type="email"]', 'prensa@spacex.com'); 
    await page.fill('input[type="password"]', 'prensa');
    await page.getByRole('button', { name: /Entrar a la Base/i }).click();

    await page.waitForURL('**/');
    await expect(page.getByText(/Piloto: prensa/i)).toBeVisible();
    await page.getByRole('link', { name: /Sala de Prensa/i }).click();

    //Se selecciona LA PESTAÑA "Cargas Útiles"
    const pestañaCargas = page.getByRole('button', { name: /Cargas Útiles/i });
    await pestañaCargas.click();

    // Verificación visual de que la pestaña se ha activado (opcional, según tu CSS)
    // await expect(pestañaCargas).toHaveClass(/active/); 

    //Se realiza LA BÚSQUEDA EN EL FILTRO, con un pequeño delay para simular escritura humana
    const buscador = page.locator('input[type="text"]');
    await buscador.type('ABS', { delay: 100 });

    //Se verifican los RESULTADOS
    await expect(page.getByText('ABS-2')).toBeVisible();
    await expect(page.getByText('ABS-2A')).toBeVisible();
    await expect(page.getByText('ABS-3A')).toBeVisible();

    //La prueba definitiva de que el filtro funcionó: Un elemento que estaba antes 'ACEO' ahora no es visble.
    const elementoOculto = page.getByText('ACEO');
    await expect(elementoOculto).not.toBeVisible();
  });

});