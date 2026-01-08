describe('Canonical User Flow with Task Completion', () => {

  beforeEach(() => {
    cy.mockApiResponses();
    cy.mockEndscreen(85, 120000);
  });

  it('allows a user to start the game, complete a task, and finish', () => {

    cy.visit('/');

    // Start screen
    cy.get('img[alt="Bureaucracy Simulator"]').should('be.visible');

    cy.get('input[placeholder="Nickname..."]').type('KafkaUser');
    cy.contains('Play').click();

    // cy.wait('@postUser');
    cy.url().should('include', '/game');

    // Game screen
    cy.contains('Welcome User').should('be.visible');
    cy.contains('Your presence has been acknowledged').should('be.visible');
    cy.get('img[alt="Game logo"]').should('be.visible');
    cy.contains('Statute 47-B').should('be.visible');
    cy.contains('Filing a Standard Judicial Report').should('be.visible');
    cy.contains('Proceed with caution').should('be.visible');
    cy.get('body').should('be.visible');

    // Timer should be running
    // cy.window().its('gameContext').should('exist');

    // cy.intercept(
    //   'GET',
    //   '**/user/homescreen/tasks/**'
    // ).as('getTask');

    // USER ACTION: click form task
    cy.contains('Department of Unreadable Forms').click();
    // cy.wait('@getTask');

    // cy.intercept(
    //   'PUT',
    //   '**/user/homescreen/tasks/*/form-check',
    //   {
    //     statusCode: 200,
    //     body: {
    //       success: true,
    //       data: {
    //         completed: true,
    //         message: 'Form task completed successfully',
    //       },
    //     },
    //   }
    // ).as('formTaskCheck');

    cy.fillForm({
      fullName: 'Franz Kafka',
      idNumber: '123-45-6789',
      dob: '1995-12-14',
      purpose: 'Personal Use',
      address: 'Prague, Czech Republic',
      signature: 'Franz Kafka'
    });

    cy.contains('Submit').click();
    // cy.wait('@formTaskCheck');

    // cy.contains('Form accepted')
    // .should('be.visible');

    // USER ACTION: click audit task
    // cy.intercept(
    //   'GET',
    //   '**/user/homescreen/tasks/**'
    // ).as('getTask');

    cy.contains('Unjustified Audit Office').click();

    cy.completeDisplayTask();

    cy.contains('Audit complete')
    .should('be.visible');

    // USER ACTION: click cofee task
    cy.intercept(
      'GET',
      '**/user/homescreen/tasks/**'
    ).as('getTask');

    cy.contains('Serious Headquarters of Seriousness').click();

    cy.completeCoffeTask();

    cy.contains('Signature accepted')
    .should('be.visible')

    // USER ACTION: click puzzle task
    cy.contains('Secretary of Bored and Shady Individuals').click();

    cy.solvePuzzle();

    cy.contains('Correct', { timeout: 8000 }).should('be.visible');
    cy.wait(2000);

    cy.solvePuzzle();

    cy.contains('Task finished').should('be.visible');

    // Finish game (no remaining tasks)
    cy.contains('Finish').click();

    cy.url().should('include', '/end');

    // End screen
    cy.contains('Congratulations').should('be.visible');
    cy.contains('you made it!').should('be.visible');
  });
});
