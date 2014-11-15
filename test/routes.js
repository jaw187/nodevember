var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');
var Routes = require('../lib/routes');


// Declare shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

Routes.pop(); // Remove / GET due to lack of hapi-auth-cookie in testing


describe('routing', function () {

    describe('GET /radios', function () {

        it('returns radios', function (done) {

            var server = new Hapi.Server();
            server.route(Routes);
            server.inject({ method: 'get', url: '/radios' }, function (res) {

                expect(res.statusCode).to.equal(200);
                expect(res.result).to.exist;
                done();
            })
        });
    });

    describe('PUT /radio/{radioId}', function () {

        it('creates a radio', function (done) {

            var server = new Hapi.Server();
            server.route(Routes);
            server.inject({ method: 'put', url: '/radio/1', payload: '{ "id": "1" }' }, function (res) {

                expect(res.statusCode).to.equal(200);
                expect(res.result).to.exist;
                done();
            })
        });
    });

    describe('Get /radio/{radioId}', function () {

        it('gets a radio', function (done) {

            var server = new Hapi.Server();
            server.route(Routes);
            server.inject({ method: 'get', url: '/radio/1' }, function (res) {

                expect(res.statusCode).to.equal(200);
                expect(res.result).to.exist;
                done();
            })
        });
    });
});
