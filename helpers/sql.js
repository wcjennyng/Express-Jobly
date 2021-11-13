const { BadRequestError } = require("../expressError");

/**
 * Makes selective update queries. 
 * 
 * dataToUpdate takes in an object. Example: {first_name: 'Jenny', age: 25}
 * jsToSql takes in an object. Maps js data to db column names. 
 * Example: { firstName: "first_name", age: "age" }
 * 
 * returns an object -> {setCols, dataToUpdate}
 * {firstName: 'Jenny', age: 25} => { setCols: '"first_name"=$1, "age"=$2', 
 *                                   values: ['Jenny', 25]}
**/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
