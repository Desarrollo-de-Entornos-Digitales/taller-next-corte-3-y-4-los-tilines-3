// cypress/e2e/edit-course.cy.ts
describe('Editar Grupo', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();
        cy.window().then((win) => {
            win.localStorage.setItem('access_token', 'fake-token');
            win.localStorage.setItem('user', JSON.stringify({ id: 2, roleName: 'PROFESOR' }));
        });
        cy.visit('/courses');
        // Asegurar que hay al menos un grupo; si no, crear uno temporal
        cy.get('body').then(($body) => {
            if ($body.text().includes('Aún no hay grupos')) {
                cy.visit('/courses/create');
                cy.get('input').first().type('Grupo Temporal para Editar');
                cy.get('textarea').type('Descripción temporal');
                cy.contains('button', 'Create Grupo').click();
                cy.url().should('include', '/courses');
            }
        });
    });

    it('Debe poder editar el primer grupo de la lista', () => {
        // Seleccionar la primera tarjeta y hacer hover para mostrar botón editar
        cy.get('.bg-white.rounded-2xl').first().trigger('mouseover');
        cy.contains('✏️').click({ force: true }); // botón de editar (icono lápiz)
        cy.url().should('match', /\/courses\/\d+\/edit/);

        // Modificar nombre
        const nuevoNombre = `Editado ${Date.now()}`;
        cy.get('input').first().clear().type(nuevoNombre);
        cy.get('textarea').type(' (con edición)');
        cy.contains('button', 'Save Changes').click();

        // Redirige al detalle y muestra el nuevo nombre
        cy.url().should('match', /\/courses\/\d+$/);
        cy.contains(nuevoNombre).should('be.visible');
    });
});
