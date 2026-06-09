// cypress/e2e/module-exercises.cy.ts
describe('Módulo de ejercicios', () => {
    beforeEach(() => {
        cy.window().then((win) => {
            win.localStorage.setItem('access_token', 'fake-token');
            win.localStorage.setItem('user', JSON.stringify({ id: 2, roleName: 'PROFESOR' }));
        });
    });

    it('Carga la página del módulo 10 del curso 1', () => {
        cy.visit('/ejercicios/course/1/module/10');
        cy.get('body').should('be.visible');
        cy.get('.bg-red-100').should('not.exist');
    });

    it('Muestra al menos un ejercicio en la lista', () => {
        cy.visit('/ejercicios/course/1/module/10');
        cy.get('li').should('have.length.at.least', 1);
    });
});
