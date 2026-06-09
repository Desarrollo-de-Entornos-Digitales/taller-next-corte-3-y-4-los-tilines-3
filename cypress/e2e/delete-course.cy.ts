// cypress/e2e/delete-course.cy.ts
describe('Eliminar Grupo', () => {
    let courseId: number;
    let courseTitle: string;

    before(() => {
        cy.window().then((win) => {
            win.localStorage.setItem('access_token', 'fake-token');
            win.localStorage.setItem('user', JSON.stringify({ id: 2, roleName: 'PROFESOR' }));
        });

        courseTitle = `Temp ${Date.now()}`;
        cy.request({
            method: 'POST',
            url: 'http://localhost:3001/courses',
            body: {
                title: courseTitle,
                description: 'Para eliminar',
                professor_id: 2,
            },
        }).then((resp) => {
            expect(resp.status).to.eq(201);
            courseId = resp.body.id;
        });
    });

    beforeEach(() => {
        cy.window().then((win) => {
            win.localStorage.setItem('access_token', 'fake-token');
            win.localStorage.setItem('user', JSON.stringify({ id: 2, roleName: 'PROFESOR' }));
        });
    });

    it('Debe eliminar el grupo', () => {
        cy.visit(`/courses/${courseId}`);
        cy.url().should('include', `/courses/${courseId}`);

        cy.contains('button', 'Delete').click();

        cy.contains('Are you sure').should('be.visible');

        cy.get('.fixed.inset-0').within(() => {
            cy.contains('button', 'Delete').click();
        });

        cy.url().should('include', '/courses');
        cy.contains(courseTitle).should('not.exist');
    });
});
