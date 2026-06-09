// cypress/e2e/register.cy.ts

describe('Página de Registro', () => {
    beforeEach(() => {
        cy.visit('/register'); // Ajusta la ruta si es diferente
    });

    it('Debe mostrar el formulario correctamente', () => {
        cy.contains('h1', "Let's get you started!").should('be.visible');
        cy.get('input[name="username"]').should('be.visible');
        cy.get('input[name="email"]').should('be.visible');
        cy.get('input[name="password"]').should('be.visible');
        cy.get('input[name="bio"]').should('be.visible');
        cy.get('select[name="roleName"]').should('be.visible');
        cy.get('input[type="checkbox"]').should('be.visible');
        cy.get('button').contains('Create account').should('be.visible');
    });

    it('Debe mostrar error si falta algún campo requerido', () => {
        // Enviar formulario vacío
        cy.get('button').contains('Create account').click();

        // Verificar que los mensajes de validación nativa aparecen (o el backend devuelve error)
        // Como el formulario usa required, el navegador mostrará tooltips, pero también podemos
        // comprobar que no se produce redirección.
        cy.url().should('include', '/register');
    });

    describe('Envío exitoso', () => {
        it('Debe registrar un usuario correctamente y redirigir al login', () => {
            // Interceptar la petición POST al endpoint de registro
            cy.intercept('POST', '/auth/register', (req) => {
                // Verificar que el body tiene los datos que esperamos
                expect(req.body).to.include({
                    username: 'Usuario Test',
                    email: 'test@example.com',
                    roleName: 'ESTUDIANTE',
                });
                req.reply({
                    statusCode: 201,
                    body: { message: 'Usuario creado exitosamente' },
                });
            }).as('registerRequest');

            // Limpiar cualquier valor previo y escribir el nuevo
            cy.get('input[name="username"]').clear().type('Usuario Test');
            cy.get('input[name="email"]').clear().type('test@example.com');
            cy.get('input[name="password"]').clear().type('Password123!');
            cy.get('input[name="bio"]').clear().type('Soy un usuario de pruebas');
            cy.get('select[name="roleName"]').select('ESTUDIANTE');
            cy.get('input[type="checkbox"]').check();

            // Enviar formulario
            cy.get('button').contains('Create account').click();

            // Esperar la petición
            cy.wait('@registerRequest');

            // Verificar alerta de éxito
            cy.on('window:alert', (text) => {
                expect(text).to.equal('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
            });

            // Verificar redirección a /login
            cy.url().should('include', '/login');
        });
    });

    describe('Manejo de errores del backend', () => {
        it('Debe mostrar error cuando el email ya está registrado', () => {
            cy.intercept('POST', '/auth/register', {
                statusCode: 400,
                body: { message: 'El email ya está en uso' },
            }).as('registerError');

            cy.get('input[name="username"]').type('Usuario Duplicado');
            cy.get('input[name="email"]').type('existente@example.com');
            cy.get('input[name="password"]').type('Password123!');
            cy.get('input[name="bio"]').type('Bio');
            cy.get('select[name="roleName"]').select('ESTUDIANTE');
            cy.get('input[type="checkbox"]').check();
            cy.get('button').contains('Create account').click();

            cy.wait('@registerError');
            cy.get('[role="alert"]').should('contain.text', 'El email ya está en uso');
            cy.url().should('include', '/register');
        });

        it('Debe mostrar error de conexión con el servidor', () => {
            cy.intercept('POST', '/auth/register', {
                forceNetworkError: true,
            }).as('networkError');

            cy.get('input[name="username"]').type('Usuario Red');
            cy.get('input[name="email"]').type('red@example.com');
            cy.get('input[name="password"]').type('Password123!');
            cy.get('input[name="bio"]').type('Bio');
            cy.get('select[name="roleName"]').select('ESTUDIANTE');
            cy.get('input[type="checkbox"]').check();
            cy.get('button').contains('Create account').click();

            cy.wait('@networkError');
            cy.get('[role="alert"]').should('contain.text', 'No se pudo conectar con el servidor');
            cy.url().should('include', '/register');
        });
    });

    describe('Validaciones del lado del cliente', () => {
        it('Debe requerir aceptar los términos y condiciones', () => {
            // No marcar checkbox
            cy.get('input[name="username"]').type('Usuario Terminos');
            cy.get('input[name="email"]').type('terminos@example.com');
            cy.get('input[name="password"]').type('Password123!');
            cy.get('input[name="bio"]').type('Bio');
            cy.get('select[name="roleName"]').select('ESTUDIANTE');
            // No se checkea el checkbox
            cy.get('button').contains('Create account').click();

            // El navegador no enviará el formulario porque el checkbox es required
            // Verificar que no se hizo ninguna petición
            cy.url().should('include', '/register');
        });
    });
});
