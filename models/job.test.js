const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds,
} = require("./_testCommon");
const { findAll } = require("./user");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

//create

describe('create', function () {
    let newJob = {
        companyHandle: "c1",
        title: "Test",
        salary: 100,
        equity: "0.1"
    }

    test('works', async function () {
        let job = await Job.create(newJob)
        expect(job).toEqual({
            companyHandle: "c1",
            title: "Test",
            salary: 100,
            equity: "0.1",
            id: expect.any(Number)
        })
    })
})

//findAll

describe('findAll', function () {
    test("works", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: testJobIds[0],
                title: "Job1",
                salary: 100,
                equity: "0.1",
                companyHandle: "c1",
                companyName: "C1",
            },
            {
                id: testJobIds[1],
                title: "Job2",
                salary: 200,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1",
            },
            {
                id: testJobIds[2],
                title: "Job3",
                salary: 300,
                equity: "0",
                companyHandle: "c1",
                companyName: "C1",
            },
            {
                id: testJobIds[3],
                title: "Job4",
                salary: null,
                equity: null,
                companyHandle: "c1",
                companyName: "C1",
            },
        ]);
    })

    test('Has Equity', async function () {
        let jobs = await Job.findAll({ hasEquity: true })
        expect(jobs).toEqual([
            {
                id: testJobIds[0],
                title: "Job1",
                salary: 100,
                equity: "0.1",
                companyHandle: "c1",
                companyName: "C1",
            },
            {
                id: testJobIds[1],
                title: "Job2",
                salary: 200,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1",
            }
        ])

    })

    test("works with 2 filters - name and min salary", async function () {
        let jobs = await Job.findAll({ title: "Job1", minSalary: 100 })
        expect(jobs).toEqual([
            {
                id: testJobIds[0],
                title: "Job1",
                salary: 100,
                equity: "0.1",
                companyHandle: "c1",
                companyName: "C1"
            }
        ])
    })

})

//get by id

describe('get', function () {
    test('works', async function () {
        let job = await Job.get(testJobIds[0])
        expect(job).toEqual({
            id: testJobIds[0],
            title: "Job1",
            salary: 100,
            equity: "0.1",
            company: {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
            }
        })
    })
    
    test('job not found', async function() {
        try {
            await Job.get(0)
            fail()
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy()
        }
    })
})

//update

describe('update', function() {
    let updateData = {
        title: "Update",
        salary: 400,
        equity: "0.5"
    }
    test('works', async function() {
        let job = await Job.update(testJobIds[0], updateData)
        expect(job).toEqual({
            id: testJobIds[0],
            companyHandle: "c1",
            ...updateData
        })
    })

})

//delete

describe('remove', function() {
    test('works', async function() {
        await Job.remove(testJobIds[0])
        const res = await db.query("SELECT id FROM jobs WHERE id=$1", [testJobIds[0]])
        expect(res.rows.length).toEqual(0)
    })

    test('Job not found to delete', async function() {
        try {
            await Job.remove(0)
            fail()
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy()
        }
    })
})