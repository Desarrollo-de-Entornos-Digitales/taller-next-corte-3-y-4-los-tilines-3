// cypress/e2e/course-detail.cy.ts
describe('Detalle de Grupo', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();
        cy.window().then((win) => {
            win.localStorage.setItem('access_token', 'fake-token');
            win.localStorage.setItem('user', JSON.stringify({ id: 2, roleName: 'PROFESOR' }));
        });
        cy.visit('/courses');
    });

    it('Debe poder ver el detalle del primer grupo', () => {
        // Si no hay grupos, crear uno
        cy.get('body').then(($body) => {
            if ($body.text().includes('Aún no hay grupos')) {
                cy.visit('/courses/create');
                cy.get('input').first().type('Grupo Detalle Test');
                cy.get('textarea').type('Descripción');
                cy.contains('button', 'Create Grupo').click();
            }
        });
        // Hacer clic en el primer enlace que diga "Administrar Grupo"
        cy.contains('Administrar Grupo').first().click();
        cy.url().should('match', /\/courses\/\d+$/);
        cy.contains('Explorar módulos y ejercicios').should('be.visible');
    });
});
