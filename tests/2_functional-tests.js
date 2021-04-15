const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test('Create an issue with every field: POST request to /api/issues/{project}', () => {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({issue_title: 'issue-tracker',
        issue_text: 'issue-sample-text',
        created_by: 'rrichy',
        assigned_to: 'yhcirr',
        status_text: 'ongoing'})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.issue_title, 'issue-tracker');
        assert.equal(res.body.issue_text, 'issue-sample-text');
        assert.equal(res.body.created_by, 'rrichy');
        assert.equal(res.body.assigned_to, 'yhcirr');
        assert.equal(res.body.status_text, 'ongoing');
        assert.equal(res.body.open, true);
      });
  });

  test('Create an issue with only required fields: POST request to /api/issues/{project}', () => {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({issue_title: 'issue-tracker',
        issue_text: 'issue-sample-text',
        created_by: 'rrichy'})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.issue_title, 'issue-tracker');
        assert.equal(res.body.issue_text, 'issue-sample-text');
        assert.equal(res.body.created_by, 'rrichy');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.equal(res.body.open, true);
      });
  });

   test('Create an issue with missing required fields: POST request to /api/issues/{project}', () => {
    chai.request(server)
      .post('/api/issues/apitest')
      .send({ assigned_to: 'yhcirr', status_text: 'ongoing' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.deepEqual(res.body, { error: 'required field(s) missing' });
      });
  });
  test('View issues on a project: GET request to /api/issues/{project}', () => {
    chai.request(server)
      .get('/api/issues/apitest')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
      });
  });
  test('View issues on a project with one filter: GET request to /api/issues/{project}', () => {
    chai.request(server)
      .get('/api/issues/apitest?issue_title=issue-tracker')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
      });
  });
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', () => {
    chai.request(server)
      .get('/api/issues/apitest?issue_title=issue-tracker&open=true')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
      });
  });
  test('Update one field on an issue: PUT request to /api/issues/{project}', () => {
    chai.request(server)
      .get('/api/issues/apitest')
      .end((err, res) => {
        assert.equal(res.status, 200);
        const id = res.body[0]._id;
        
      });
  });
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', () => {
    chai.request(server);
  });
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', () => {
    chai.request(server);
  });
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', () => {
    chai.request(server);
  });
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', () => {
    chai.request(server);
  });
/*  test('Delete an issue: DELETE request to /api/issues/{project}', () => {
    chai.request(server);
  });
  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', () => {
    chai.request(server);
  });
  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', () => {
    chai.request(server);
  }); */

});
