/** Routes for jobs. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = express.Router({ mergeParams: true });

/** POST / - returns { job }
 * 
 * 
 * job should have { title, salary, equity, companyHandle }
 * 
 * Returns { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: admin
 */

router.post('/', ensureAdmin, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema)
        if(!validator.valid) {
            const err = validator.errors.map(e => e.stack)
            throw new BadRequestError(err)
        }
        const job = await Job.create(req.body)
        return res.status(201).json({ job })
    } catch (e) {
        return next(e)
    }
})

/** GET / - returns { jobs: [ { id, title, salary, equity, companyHandle, companyName }, ...]}
 * 
 * Search filter available:
 * -title (case-insensitive, partial matches)
 * -minSalary
 * -hasEquity (only jobs with equity > 0 return true, otherwise ignored)
 * 
 * Authorization required: none
 */

router.get('/', async function (req, res, next) {
    const q = req.query
    //str (from querystring) -> int/bool
    if(q.minSalary !== undefined) q.minSalary = +q.minSalary
    q.hasEquity = q.hasEquity === "true"

    try {
        const validator = jsonschema.validate(q, jobSearchSchema)
        if(!validator.valid) {
            const err = validator.errors.map(e => e.stack)
            throw new BadRequestError(err)
        }
        const jobs = await Job.findAll(q)
        return res.json({ jobs })
    } catch (e) {
        return next(e)
    }
})

/** GET /jobId - returns { id, title, salary, equity, company }
 * where company is { handle, name, description, numEmployees, logoUrl }
 * 
 * Authorization required: none
*/

router.get('/:id', async function (req, res, next) {
    try {
        const job = await Job.get(req.params.id)
        return res.json({ job })
    } catch (e) {
        return next(e)
    }
})

/** PATCH /jobId
 * Data that can be updated: { title, salary, equity }
 * Returns { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: admin
 */

router.patch('/:id', ensureAdmin, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema)
        if(!validator.valid) {
            const err = validator.errors.map(e => e.stack)
            throw new BadRequestError(err)
        }
        const job = await Job.update(req.params.id, req.body)
        return res.json({ job })
    } catch (e) {
        return next(e)
    }
})


/** DELETE /jobId - returns { deleted: id }
 * 
 * Authorization required: admin
 */

router.delete('/:id', ensureAdmin, async function(req, res, next) {
    try {
        await Job.remove(req.params.id)
        return res.json({ deleted: +req.params.id })
    } catch (e) {
        return next(e)
    }
})

module.exports = router




























































































































































































































































































































































































































































































































































































































































































































