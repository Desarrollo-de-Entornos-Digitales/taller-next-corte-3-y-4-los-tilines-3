// cypress/e2e/login.cy.ts
describe('Página de Login', () => {
    beforeEach(() => {
        cy.visit('/login');
        cy.clearLocalStorage();
        cy.clearCookies();
    });

    it('Debe mostrar el formulario correctamente', () => {
        cy.get('input[name="email"]').should('be.visible');
        cy.get('input[name="password"]').should('be.visible');
        cy.get('button[type="submit"]').should('be.visible');
        cy.contains('button', /I don't have an account/i).should('be.visible');
    });

    describe('Inicio de sesión exitoso', () => {
        it('Debe iniciar sesión y mostrar la página Feed', () => {
            cy.intercept('POST', '/auth/login', {
                statusCode: 200,
                body: {
                    access_token: 'fake-token',
                    user: { id: 1, username: 'estudiante', roleName: 'ESTUDIANTE' },
                },
            }).as('login');

            cy.get('input[name="email"]').type('estudiante@ejemplo.com');
            cy.get('input[name="password"]').type('Password123');
            cy.get('button[type="submit"]').click();

            cy.url().should('include', '/feed');
        });

        it('Redirige a /modules/manage para admin', () => {
            cy.intercept('POST', '/auth/login', {
                statusCode: 200,
                body: {
                    access_token: 'fake-token-admin',
                    user: { id: 2, username: 'admin', roleName: 'ADMIN' },
                },
            }).as('loginAdmin');

            cy.get('input[name="email"]').type('admin@ejemplo.com');
            cy.get('input[name="password"]').type('AdminPass');
            cy.get('button[type="submit"]').click();

            cy.url().should('include', '/modules/manage');
        });
    });

    describe('Manejo de errores', () => {
        it('Muestra error con credenciales incorrectas', () => {
            cy.intercept('POST', '/auth/login', {
                statusCode: 401,
                body: { message: 'Credenciales incorrectas' },
            }).as('loginError');

            cy.get('input[name="email"]').type('mal@ejemplo.com');
            cy.get('input[name="password"]').type('wrong');
            cy.get('button[type="submit"]').click();

            cy.contains('Credenciales incorrectas').should('be.visible');
            cy.url().should('include', '/login');
        });

        it('Muestra error de conexión', () => {
            cy.intercept('POST', '/auth/login', { forceNetworkError: true }).as('networkError');

            cy.get('input[name="email"]').type('test@ejemplo.com');
            cy.get('input[name="password"]').type('pass');
            cy.get('button[type="submit"]').click();

            cy.contains('No se pudo conectar con el servidor').should('be.visible');
            cy.url().should('include', '/login');
        });
    });
});
