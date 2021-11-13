"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
    /** Create a job (from data), update db, return new job data.
     *
     * data should be { title, salary, equity, companyHandle }
     *
     * Returns { id, title, salary, equity, companyHandle }
     **/

    static async create(data) {
        const res = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle)
               VALUES ($1, $2, $3, $4)
               RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
            [data.title, data.salary, data.equity, data.companyHandle]);
        let job = res.rows[0];
        return job;
    }

    /** Find all jobs (filter is optional)
     * 
     * Filters include:
     * -title: find job by title
     * -minSalary: find job with at least that salary
     * -hasEquity: If true, find job(s) with equity that is not 0.
     *            -If false, find all jobs
     */

    static async findAll(filters = {}) {
        let jobRes = `SELECT j.id, j.title, j.salary, j.equity, j.company_handle AS "companyHandle", 
                      c.name AS "companyName" FROM jobs j LEFT JOIN companies c ON c.handle = j.company_handle`
                      
        let whereAddon = []
        let res = []

        const { title, minSalary, hasEquity} = filters;

        //For each filter, we push each cooresponding WHERE condition and result needed to complete the SQL query.
        if(title !== undefined) {
            res.push(`%${title}%`)
            whereAddon.push(`title ILIKE $${res.length}`)
        }
        
        if(minSalary !== undefined) {
            res.push(minSalary)
            whereAddon.push(`salary >= $${res.length}`)
        }

        if(hasEquity === true) {
            whereAddon.push(`equity > 0`)
        }

        if(whereAddon.length > 0) {
            jobRes += " WHERE " + whereAddon.join(" AND ")
        }

        jobRes += " ORDER BY title"
        const finalFindAll = await db.query(jobRes, res)
        return finalFindAll.rows; 

    }

    /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle, company }
   *   where company is { handle, name, description, numEmployees, logoUrl }
   *
   * Throws NotFoundError if not found.
    **/    

    static async get(id) {
        const jobRes = await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
                                        FROM jobs WHERE id = $1`, [id])

        const job = jobRes.rows[0]

        if(!job) throw new NotFoundError("Job not found")

        const companiesRes = await db.query(`SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"
                                            FROM companies WHERE handle = $1`, [job.companyHandle])

        delete job.companyHandle
        job.company = companiesRes.rows[0]

        return job
    }

    /**Update job data 
     * 
     * Updates whichever field user changed
     * 
     * Data can include: { title, salary, equity }
     * 
     * Returns { id, title, salary, equity, companyHandle }
     * 
     * Throws NotFoundError if not found
     */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {})
        const idVarIndex = '$' + (values.length + 1)

        const querySql = `UPDATE jobs SET ${setCols} WHERE id = ${idVarIndex}
                         RETURNING id, title, salary, equity, company_handle AS "companyHandle"`

        const res = await db.query(querySql, [...values, id])
        const job = res.rows[0]

        if(!job) throw new NotFoundError("Job not found")

        return job
    }

    /**Delete job from database, returns undefined
     * 
     * Throws NotFoundError if not found
     */

    static async remove(id) {
        const res = await db.query(`DELETE FROM jobs WHERE id = $1 RETURNING id`, [id])
        const job = res.rows[0]

        if(!job) throw new NotFoundError("Job not found")
    }

}

module.exports = Job