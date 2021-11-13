const request = require("supertest");

const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds,
    u1Token,
    adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

//POST

describe('POST /jobs', function () {
    test('admin', async function () {
        const res = await request(app).post(`/jobs`)
            .send({ companyHandle: "c1", title: "new", salary: 10, equity: "0.1" })
            .set("authorization", `Bearer ${adminToken}`)
        expect(res.statusCode).toEqual(201)
        expect(res.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "new",
                salary: 10,
                equity: "0.1",
                companyHandle: "c1"
            }
        })
    })

    test('unauthorized for users', async function () {
        const res = await request(app).post(`/jobs`)
            .send({ companyHandle: "c1", title: "new", salary: 10, equity: "0.1" })
            .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toEqual(401)
    })
})

//GET /jobs

describe("GET /jobs", function () {
    test('works - no authorization', async function () {
        const res = await request(app).get(`/jobs`)
        expect(res.body).toEqual({
            jobs: [
                {
                    id: expect.any(Number),
                    title: "J1",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                {
                    id: expect.any(Number),
                    title: "J2",
                    salary: 2,
                    equity: "0.2",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                {
                    id: expect.any(Number),
                    title: "J3",
                    salary: 3,
                    equity: null,
                    companyHandle: "c1",
                    companyName: "C1",
                },
            ],

        })


    })

    test('works - filter by equity', async function () {
        const res = await request(app).get(`/jobs`).query({ hasEquity: true })
        expect(res.body).toEqual({
            jobs: [
                {
                    id: expect.any(Number),
                    title: "J1",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                {
                    id: expect.any(Number),
                    title: "J2",
                    salary: 2,
                    equity: "0.2",
                    companyHandle: "c1",
                    companyName: "C1",
                },
            ]
        })
    })

    test('works - filter by title and minSalary', async function () {
        const res = await request(app).get(`/jobs`).query({ title: "3", minSalary: 2 })
        expect(res.body).toEqual({
            jobs: [
                {
                    id: expect.any(Number),
                    title: "J3",
                    salary: 3,
                    equity: null,
                    companyHandle: "c1",
                    companyName: "C1",
                },
            ]
        })
    })

})

//GET /jobs/:id

describe("GET /jobs/:id", function () {
    test('works - no authorization', async function() {
        const res = await request(app).get(`/jobs/${testJobIds[1]}`)
        expect(res.body).toEqual({
            job: {
                id: testJobIds[1],
                title: "J2",
                salary: 2,
                equity: "0.2",
                company: {
                  handle: "c1",
                  name: "C1",
                  description: "Desc1",
                  numEmployees: 1,
                  logoUrl: "http://c1.img",
                }
            }
        })
    })

    test('job not found', async function() {
        const res = await request(app).get(`/jobs/0`)
        expect(res.statusCode).toEqual(404)
    })
})

//PATCH /jobs/:id

describe('PATCH /jobs/:id', function () {
    test('works - admin required', async function() {
        const res = await request(app).patch(`/jobs/${testJobIds[0]}`)
                    .send({ title: "Updated" })
                    .set("authorization", `Bearer ${adminToken}`)
        expect(res.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "Updated",
                salary: 1,
                equity: "0.1",
                companyHandle: "c1"
            }
        })
    })

    test('unauthorized for users', async function() {
        const res = await request(app).patch(`/jobs/${testJobIds[0]}`)
                    .send({ title: "Updated" })
                    .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toEqual(401)
    })

    test('job not found', async function() {
        const res = await request(app).patch(`/jobs/0`).send({ title: "not found" })
                    .set("authorization", `Bearer ${adminToken}`)
        expect(res.statusCode).toEqual(404)
    })
})

//DELETE /jobs/:id

describe("DELETE /jobs/:id", function () {
    test('works - admin required', async function () {
        const res = await request(app).delete(`/jobs/${testJobIds[0]}`)
                    .set("authorization", `Bearer ${adminToken}`)
        expect(res.body).toEqual({ deleted: testJobIds[0] })
    })

    test('unauthorized for users', async function() {
        const res = await request(app).delete(`/jobs/${testJobIds[0]}`)
                    .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toEqual(401)            
    })

    test('Job not found', async function() {
        const res = await request(app).delete(`/jobs/0`)
                    .set("authorization", `Bearer ${adminToken}`)
        expect(res.statusCode).toEqual(404)
    })
})

