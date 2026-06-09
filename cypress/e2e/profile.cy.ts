describe('Página de Perfil', () => {
    beforeEach(() => {
        // Mock de autenticación
        cy.window().then((win) => {
            win.localStorage.setItem('access_token', 'fake-token');
            win.localStorage.setItem('user', JSON.stringify({ id: 2, username: 'Kevin', roleName: 'PROFESOR' }));
        });
        cy.visit('/profile');
    });

    it('Carga la página sin errores', () => {
        cy.get('body').should('be.visible');
        cy.get('.bg-red-100').should('not.exist');
    });

    it('Muestra el nombre del usuario', () => {
        cy.contains('Kevin').should('be.visible');
    });

    it('Muestra el resumen de aprendizaje', () => {
        cy.contains('Resumen de aprendizaje').should('be.visible');
        cy.contains('Cursos activos').should('be.visible');
    });

    it('Muestra el botón de editar perfil', () => {
        cy.contains('Editar perfil').should('be.visible');
    });

    it('Muestra la barra de navegación y el footer', () => {
        cy.get('nav, .navbar, header').should('be.visible');
        cy.get('footer').should('be.visible');
    });
});
