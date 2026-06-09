// cypress/e2e/arena-exercise.cy.ts
describe('Arena - Ejercicio', () => {
    beforeEach(() => {
        cy.window().then((win) => {
            win.localStorage.setItem('access_token', 'fake-token');
            win.localStorage.setItem('user', JSON.stringify({ id: 2, roleName: 'PROFESOR' }));
        });
        cy.intercept('GET', '/exercise/101', {
            statusCode: 200,
            body: {
                id: 101,
                title: 'Hola Mundo',
                description: 'Imprime "Hola Mundo"',
                exercise_type: 'coding',
                content: { initialCode: 'print("Hola Mundo")' },
                module_id: 10,
            },
        }).as('getExercise');
        cy.intercept('GET', '/modules/10/exercises', {
            statusCode: 200,
            body: [{ id: 101 }],
        });
    });

    it('El ejercicio carga sin errores', () => {
        cy.visit('/arena/101?courseId=1&moduleId=10');
        cy.get('.bg-red-100').should('not.exist');
        cy.get('body').should('be.visible');
    });

    it('Existe el botón de enviar solución', () => {
        cy.visit('/arena/101?courseId=1&moduleId=10');
        // Buscamos un botón que contenga "Enviar" (texto común)
        cy.contains('button, [role="button"]', /enviar|submit/i).should('be.visible');
    });
});
