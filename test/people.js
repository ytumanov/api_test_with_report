const {base} = require('../config.json');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const {expect, assert} = chai;

chai.use(chaiHttp);

const getTotal = async () => {
  const res = await chai.request(base)
  .get('people')
  .send();
  const totalPeople = (JSON.parse(res.text)).count;
  const lastPage = Math.ceil(totalPeople / 10);
  return {totalPeople, lastPage};
}

describe('GET all people', () => {

  it('should return OK and results on /people endpoint', async () => {
    const res = await chai.request(base)
    .get('people')
    .send();
    res.should.have.status(200);
    const result = JSON.parse(res.text);

    assert.isNumber(result.count);
    assert.isNull(result.previous);
    assert.isString(result.next);
    assert.isArray(result.results);
  });

  it('should return OK and results on /people/?page=1 endpoint', async () => {
    const res = await chai.request(base)
    .get('people/?page=1')
    .send();
    res.should.have.status(200);
    const result = JSON.parse(res.text);

    assert.isNumber(result.count);
    assert.isNull(result.previous);
    assert.isString(result.next);
    assert.isArray(result.results);
  });

  it('should return OK and results on /people/?page=last_valid endpoint', async () => {
    const {totalPeople, lastPage} = await getTotal();
    
    const res = await chai.request(base)
    .get(`people/?page=${lastPage}`)
    .send();
    res.should.have.status(200);
    const result = JSON.parse(res.text);

    assert.isNumber(result.count);
    assert.isString(result.previous);
    assert.isNull(result.next);
    assert.isArray(result.results);
  });

  it('should return 404 status Not found on not valid page /people/?page=last_valid + 1', async () => {
    const {totalPeople, lastPage} = await getTotal();

    const res = await chai.request(base)
    .get(`people/?page=${lastPage + 1}`)
    .send();
    res.should.have.status(404);
    const result = JSON.parse(res.text);
    expect(result.detail).to.equal('Not found');
  });

  it('should have count equal to results.count and each result in results should have required keys(based on schema)', async () => {
    const validatePage = (data, itemsOnPage) => {
      expect(data.count).to.be.above(0);
      expect(data.results.length).to.equal(itemsOnPage);

      data.results.map(obj => {
        assert.hasAllKeys(obj, [
          'name',
          'height',
          'mass',
          'hair_color',
          'skin_color',
          'eye_color',
          'birth_year',
          'gender',
          'homeworld',
          'films',
          'species',
          'vehicles',
          'starships',
          'url',
          'created',
          'edited'
        ]);
  
        assert.isString(obj['name']);
        assert.isString(obj['height']);
        assert.isString(obj['mass']);
        assert.isString(obj['hair_color']);
        assert.isString(obj['skin_color']);
        assert.isString(obj['eye_color']);
        assert.isString(obj['hair_color']);
        assert.isString(obj['birth_year']);
        assert.isString(obj['gender']);
        assert.isString(obj['homeworld']);
        assert.isArray(obj['films']);
        assert.isArray(obj['species']);
        assert.isArray(obj['vehicles']);
        assert.isArray(obj['starships']);
        assert.isString(obj['url']);
        assert.isString(obj['created']);
        assert.isString(obj['edited']);
  
        // some arrays could be empty or not empty
        assert.isNotEmpty(obj['name']);
        assert.isNotEmpty(obj['height']);
        assert.isNotEmpty(obj['mass']);
        assert.isNotEmpty(obj['hair_color']);
        assert.isNotEmpty(obj['skin_color']);
        assert.isNotEmpty(obj['eye_color']);
        assert.isNotEmpty(obj['hair_color']);
        assert.isNotEmpty(obj['birth_year']);
        assert.isNotEmpty(obj['gender']);
        assert.isNotEmpty(obj['homeworld']);
        assert.isNotEmpty(obj['url']);
        assert.isNotEmpty(obj['created']);
        assert.isNotEmpty(obj['edited']);
  
      });

    }

    const {totalPeople, lastPage} = await getTotal();

    let res = await chai.request(base)
    .get('people/?page=1')
    .send();
    res.should.have.status(200);
    validatePage(JSON.parse(res.text), 10);

    res = await chai.request(base)
    .get('people/?page=5')
    .send();
    res.should.have.status(200);
    validatePage(JSON.parse(res.text), 10);

    res = await chai.request(base)
    .get(`people/?page=${lastPage}`)
    .send();
    res.should.have.status(200);
    const itemsOnLastPage = totalPeople % 10;
    validatePage(JSON.parse(res.text), totalPeople % 10);

  });

});

describe('GET people by id', () => {
  it('should return OK and results on /people/1 by id Each element on array like films(and others) should contain "films" in each link if not empty', async () => {
    const res = await chai.request(base)
    .get('people/1')
    .send();
    res.should.have.status(200);
    const results = JSON.parse(res.text);

    results.films.forEach(url => {
      expect(url).to.have.string(`${base}films/`);
    });

    results.starships.forEach(url => {
      expect(url).to.have.string(`${base}starships/`);
    });

    results.vehicles.forEach(url => {
      expect(url).to.have.string(`${base}vehicles/`);
    });

    results.species.forEach(url => {
      expect(url).to.have.string(`${base}species/`);
    });

    expect(results.homeworld).to.have.string(`${base}planets/`);
  });

  it('should return OK and results on /people/40 by id', async () => {
    const id = 40;
    const res = await chai.request(base)
    .get(`people/${id}`)
    .send();
    res.should.have.status(200);
    const results = JSON.parse(res.text);
    assert.isObject(results);
    expect(results.url).to.equal(`${base}people/${id}/`);
  });

  it('should have created/edited type date-time', async () => {
    const id = 5;
    const twoThousand = 946684800000;
    const res = await chai.request(base)
    .get(`people/${id}`)
    .send();
    res.should.have.status(200);
    const results = JSON.parse(res.text);
    const createdTimestamp = Date.parse(results.created);
    const editedTimestamp = Date.parse(results.edited);

    expect(createdTimestamp).to.be.above(twoThousand);
    expect(editedTimestamp).to.be.above(twoThousand);
  });

  it('should return OK and results on /people/last_valid endpoint', async () => {
    const {totalPeople: id, } = await getTotal();
    const res = await chai.request(base)
    .get(`people/${id}`)
    .send();
    res.should.have.status(200);
    const results = JSON.parse(res.text);
    assert.isObject(results);
    expect(results.url).to.equal(`${base}people/${id}/`);
  });

  it('should return 404 status and Not found detail on not valid /films/last_valid + 1 endpoint', async () => {
    const {totalPeople: id, } = await getTotal();
    const notValidId = id + 1;
    const res = await chai.request(base)
    .get(`films/${notValidId}`)
    .send();
    res.should.have.status(404);
    const result = JSON.parse(res.text);
    expect(result.detail).to.equal('Not found');
  });

});

