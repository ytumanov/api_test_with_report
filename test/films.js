'use strict';

const {base} = require('../config.json');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const {expect, assert} = chai;

chai.use(chaiHttp);

describe('GET all films', () => {

  it('should return OK and results on /films endpoint', async () => {
    const res = await chai.request(base)
    .get('films')
    .send();
    res.should.have.status(200);
    const result = JSON.parse(res.text);

    assert.isNumber(result.count);
    assert.isNull(result.previous);
    assert.isNull(result.next);
    assert.isArray(result.results);
  });

  it('should return OK and results on /films/?page=1 endpoint', async () => {
    const res = await chai.request(base)
    .get('films/?page=1')
    .send();
    res.should.have.status(200);
    const result = JSON.parse(res.text);

    assert.isNumber(result.count);
    assert.isNull(result.previous);
    assert.isNull(result.next);
    assert.isArray(result.results);
  });

  it('should return 404 status and Not found detail on not valid page /films/?page=2', async () => {
    const res = await chai.request(base)
    .get('films/?page=2')
    .send();
    res.should.have.status(404);
    const result = JSON.parse(res.text);
    expect(result.detail).to.equal('Not found');
  });

  it('should have count equal to results.count and each result in results should have required keys(based on schema)', async () => {
    const res = await chai.request(base)
    .get('films')
    .send();
    res.should.have.status(200);
    const result = JSON.parse(res.text);

    expect(result.count).to.be.above(0);
    expect(result.count).to.equal(result.results.length);

    result.results.map(obj => {
      assert.hasAllKeys(obj, [
        'title',
        'episode_id',
        'opening_crawl',
        'director',
        'producer',
        'release_date',
        'characters',
        'planets',
        'starships',
        'vehicles',
        'species',
        'url',
        'created',
        'edited'
      ]);

      assert.isString(obj['title']);
      assert.isNumber(obj['episode_id']);
      assert.isString(obj['opening_crawl']);
      assert.isString(obj['director']);
      assert.isString(obj['producer']);
      assert.isString(obj['release_date']);
      assert.isArray(obj['characters']);
      assert.isArray(obj['planets']);
      assert.isArray(obj['starships']);
      assert.isArray(obj['species']);
      assert.isString(obj['url']);
      assert.isString(obj['created']);
      assert.isString(obj['edited']);

      assert.isNotEmpty(obj['title']);
      expect(obj['episode_id']).to.be.above(0);
      assert.isNotEmpty(obj['opening_crawl']);
      assert.isNotEmpty(obj['director']);
      assert.isNotEmpty(obj['producer']);
      assert.isNotEmpty(obj['release_date']);
      assert.isNotEmpty(obj['characters']);
      assert.isNotEmpty(obj['planets']);
      assert.isNotEmpty(obj['starships']);
      assert.isNotEmpty(obj['species']);
      assert.isNotEmpty(obj['url']);
      assert.isNotEmpty(obj['created']);
      assert.isNotEmpty(obj['edited']);

    });
  });

});

describe('GET film by id', () => {

  it('should return OK and results on /films/1 by id', async () => {
    const res = await chai.request(base)
    .get('films/1')
    .send();
    res.should.have.status(200);
    const results = JSON.parse(res.text);

    results.characters.forEach(url => {
      expect(url).to.have.string(`${base}people/`);
    });

    results.planets.forEach(url => {
      expect(url).to.have.string(`${base}planets/`);
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
  });

  it('should return OK and results on /films/7 by id', async () => {
    const id = 7;
    const res = await chai.request(base)
    .get(`films/${id}`)
    .send();
    res.should.have.status(200);
    const results = JSON.parse(res.text);
    assert.isObject(results);
    expect(results.url).to.equal(`${base}films/${id}/`);
  });

  it('should return 404 status and Not found detail on not valid /films/8 endpoint', async () => {
    const id = 8;
    const res = await chai.request(base)
    .get(`films/${id}`)
    .send();
    res.should.have.status(404);
    const result = JSON.parse(res.text);
    expect(result.detail).to.equal('Not found');
  });

  it('should have created/edited type date-time', async () => {
    const id = 4;
    const twoThousand = 946684800000;
    const res = await chai.request(base)
    .get(`films/${id}`)
    .send();
    res.should.have.status(200);
    const results = JSON.parse(res.text);
    const createdTimestamp = Date.parse(results.created);
    const editedTimestamp = Date.parse(results.edited);

    expect(createdTimestamp).to.be.above(twoThousand);
    expect(editedTimestamp).to.be.above(twoThousand);
  });

});
