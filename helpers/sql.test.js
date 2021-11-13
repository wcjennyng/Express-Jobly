const { sqlForPartialUpdate } = require("./sql")

describe('sqlForPartialUpdate', function() {
    test('Returns 1 value', function () {
        const res = sqlForPartialUpdate(
            { firstName: 'Jenny' },
            { firstName: 'first_name', age: 25 })
        expect(res).toEqual({
            setCols: "\"first_name\"=$1",
            values: ["Jenny"]
        })
    })

    test('Returns 2 values', function () {
        const res = sqlForPartialUpdate(
            { firstName: 'Jenny', age: 25},
            { age: 'age' })
        expect(res).toEqual({
            setCols: "\"firstName\"=$1, \"age\"=$2",
            values: ["Jenny", 25]
        })
        
    })
})