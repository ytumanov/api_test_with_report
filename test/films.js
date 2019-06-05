const {base} = require('../config.json');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const {expect, assert} = chai;

chai.use(chaiHttp);

describe('GET all films', () => {

  it('should return OK and results on /films endpoint', async () => {
    try {
      const res = await chai.request(base)
      .get('films')
      .send();
      res.should.have.status(200);
      const result = JSON.parse(res.text);

      assert.isNumber(result.count);
      assert.isNull(result.previous);
      assert.isNull(result.next);
      assert.isArray(result.results);

    } catch (error) {
      throw error;
    }
  });

  it('should return OK and results on /films/?page=1 endpoint', async () => {
    try {
      const res = await chai.request(base)
      .get('films/?page=1')
      .send();
      res.should.have.status(200);
      const result = JSON.parse(res.text);

      assert.isNumber(result.count);
      assert.isNull(result.previous);
      assert.isNull(result.next);
      assert.isArray(result.results);
      
    } catch (error) {
      throw error;
    }
  });

  it('should return 404 status Not found on not valid page /films/?page=2', async () => {
    try {
      const res = await chai.request(base)
      .get('films/?page=2')
      .send();
      res.should.have.status(404);
      const result = JSON.parse(res.text);
      expect(result.detail).to.equal('Not found');
      
    } catch (error) {
      throw error;
    }
  });

});

