const validator = require("validator");
const isEmpty = require("./is_empty");

module.exports = data => {
  let errors = {};

  if (!validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "name must be between 2 to 30 characters";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
