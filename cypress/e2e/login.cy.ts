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
        // Test SIMPLE: login y muestra el feed (solo verifica URL)
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

            // Solo verificamos la URL - no esperamos ningún elemento adicional
            cy.url().should('include', '/feed');
        });

        it('Redirige a /feed para estudiante', () => {
            cy.intercept('POST', '/auth/login', {
                statusCode: 200,
                body: {
                    access_token: 'fake-token-estudiante',
                    user: { id: 1, username: 'estudiante', roleName: 'ESTUDIANTE' },
                },
            }).as('loginEstudiante');

            cy.get('input[name="email"]').type('estudiante@ejemplo.com');
            cy.get('input[name="password"]').type('Password123');
            cy.get('button[type="submit"]').click();

            cy.url().should('include', '/feed');
            cy.window().then((win) => {
                expect(win.localStorage.getItem('access_token')).to.equal('fake-token-estudiante');
            });
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

        it('Redirige a /modules/manage para profesor', () => {
            cy.intercept('POST', '/auth/login', {
                statusCode: 200,
                body: {
                    access_token: 'fake-token-profesor',
                    user: { id: 3, username: 'profesor', roleName: 'PROFESOR' },
                },
            }).as('loginProfesor');

            cy.get('input[name="email"]').type('profesor@ejemplo.com');
            cy.get('input[name="password"]').type('ProfPass');
            cy.get('button[type="submit"]').click();

            cy.url().should('include', '/modules/manage');
        });
    });

    describe('Manejo de errores', () => {
        it('Muestra error cuando las credenciales son incorrectas', () => {
            cy.intercept('POST', '/auth/login', {
                statusCode: 401,
                body: { message: 'Credenciales incorrectas' },
            }).as('loginError');

            cy.get('input[name="email"]').type('mal@ejemplo.com');
            cy.get('input[name="password"]').type('wrong');
            cy.get('button[type="submit"]').click();

            cy.contains('.bg-red-100', 'Credenciales incorrectas').should('be.visible');
            cy.url().should('include', '/login');
        });

        it('Muestra error cuando el servidor no responde', () => {
            cy.intercept('POST', '/auth/login', { forceNetworkError: true }).as('networkError');

            cy.get('input[name="email"]').type('test@ejemplo.com');
            cy.get('input[name="password"]').type('pass');
            cy.get('button[type="submit"]').click();

            cy.contains('.bg-red-100', 'No se pudo conectar con el servidor').should('be.visible');
            cy.url().should('include', '/login');
        });

        it('Muestra error si la respuesta no contiene token', () => {
            cy.intercept('POST', '/auth/login', {
                statusCode: 200,
                body: { user: { name: 'test' } },
            }).as('noToken');

            cy.get('input[name="email"]').type('test@ejemplo.com');
            cy.get('input[name="password"]').type('pass');
            cy.get('button[type="submit"]').click();

            cy.contains('.bg-red-100', 'No se recibió un token válido del servidor').should('be.visible');
            cy.url().should('include', '/login');
        });
    });
});
