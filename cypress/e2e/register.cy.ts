// cypress/e2e/register.cy.ts
describe('Página de Registro', () => {
    beforeEach(() => {
        cy.visit('/register');
        cy.clearLocalStorage();
        cy.clearCookies();
    });

    it('Debe mostrar el formulario correctamente', () => {
        cy.get('input[name="username"]').should('be.visible');
        cy.get('input[name="email"]').should('be.visible');
        cy.get('input[name="password"]').should('be.visible');
        cy.get('input[name="bio"]').should('be.visible');
        cy.get('select[name="roleName"]').should('be.visible');
        cy.get('input[type="checkbox"]').should('be.visible');
        cy.get('button[type="submit"]').should('be.visible');
    });

    describe('Registro exitoso', () => {
        it('Debe registrar un nuevo usuario y redirigir a /login', () => {
            cy.intercept('POST', '/auth/register', {
                statusCode: 201,
                body: { message: 'Usuario creado exitosamente' },
            }).as('registerRequest');

            cy.get('input[name="username"]').type('Usuario Test');
            cy.get('input[name="email"]').type('test@example.com');
            cy.get('input[name="password"]').type('Password123!');
            cy.get('input[name="bio"]').type('Bio de prueba');
            cy.get('select[name="roleName"]').select('ESTUDIANTE');
            cy.get('input[type="checkbox"]').check();
            cy.get('button[type="submit"]').click();

            cy.url().should('include', '/login');
            // Verificar alerta de éxito (si existe)
            cy.on('window:alert', (text) => {
                expect(text).to.equal('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
            });
        });
    });

    describe('Manejo de errores', () => {
        it('Debe mostrar error si el email ya existe', () => {
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
            cy.get('button[type="submit"]').click();

            cy.contains('El email ya está en uso').should('be.visible');
            cy.url().should('include', '/register');
        });

        it('Debe mostrar error de conexión', () => {
            cy.intercept('POST', '/auth/register', { forceNetworkError: true }).as('networkError');

            cy.get('input[name="username"]').type('Usuario Red');
            cy.get('input[name="email"]').type('red@example.com');
            cy.get('input[name="password"]').type('Password123!');
            cy.get('input[name="bio"]').type('Bio');
            cy.get('select[name="roleName"]').select('ESTUDIANTE');
            cy.get('input[type="checkbox"]').check();
            cy.get('button[type="submit"]').click();

            cy.contains('No se pudo conectar con el servidor').should('be.visible');
            cy.url().should('include', '/register');
        });
    });
});
