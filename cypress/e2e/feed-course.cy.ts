// cypress/e2e/feed-course.cy.ts
describe('Feed - Curso de aprendizaje', () => {
    beforeEach(() => {
        cy.window().then((win) => {
            win.localStorage.setItem('access_token', 'fake-token');
            win.localStorage.setItem('user', JSON.stringify({ id: 2, roleName: 'PROFESOR' }));
        });
        cy.visit('/ejercicios/course/1');
        // Esperamos que la página termine de cargar (hasta que el spinner desaparezca o aparezca un elemento)
        cy.get('[class*="loading"]', { timeout: 10000 }).should('not.exist');
    });

    it('Carga la página sin errores', () => {
        cy.get('main, .main, [role="main"]').should('be.visible');
        cy.get('nav, .navbar, header').should('be.visible');
    });

    it('Muestra al menos un módulo (card de módulo)', () => {
        cy.get('[class*="card"], [class*="module"], [class*="CaminoPath"]').should('exist');
    });

    it('El botón "Entrar al módulo" funciona', () => {
        cy.contains('button, a', /Entrar al módulo|Entrar|Iniciar/).click();
        cy.url().should('match', /\/module\/\d+/);
    });
});
