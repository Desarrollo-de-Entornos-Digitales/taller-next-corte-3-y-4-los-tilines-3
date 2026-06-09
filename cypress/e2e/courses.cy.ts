describe('Página de Cursos', () => {
    beforeEach(() => {
        cy.window().then((win) => {
            win.localStorage.setItem('access_token', 'fake-token');
            win.localStorage.setItem('user', JSON.stringify({ id: 2, roleName: 'PROFESOR' }));
        });
        cy.visit('/courses');
    });

    it('Muestra el título y el botón de crear grupo', () => {
        cy.contains('Tus Grupos Creados').should('be.visible');
        cy.contains('New Grupo').should('be.visible');
    });

    it('Muestra al menos un grupo o un mensaje de que no hay grupos', () => {
        cy.get('body').then(($body) => {
            if ($body.find('.bg-white.rounded-2xl').length) {
                cy.get('.bg-white.rounded-2xl').should('have.length.at.least', 1);
            } else {
                cy.contains('Aún no hay grupos').should('be.visible');
            }
        });
    });

    it('Al hacer clic en "New Grupo" redirige a /courses/create', () => {
        cy.contains('New Grupo').click();
        cy.url().should('include', '/courses/create');
        cy.go('back');
    });
});
