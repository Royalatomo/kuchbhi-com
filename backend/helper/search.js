const { validate } = require("email-validator");
const Users = require("../schema/user");

// Getuser based on email/username
const getUser = async (str) => {
  // if email
  if (validate(str)) {
    try {
      const user = await Users.findOne({ email: str });
      return user;
    } catch (error) {
      return false;
    }
  }

  return false;
};

const queriedProducts = (list, q) => {
  if (!q) return list;
  q = q.trim().toLowerCase();
  const tags = q.split(" ");
  const newList = [];

  for (let product of list) {
    if (product.name.toLowerCase().indexOf(q) !== -1) {
      newList.push(product);
    } else {
      for (let tag of tags) {
        if (product.tags.indexOf(tag) !== -1) {
          newList.push(product);
          continue;
        }
      }
    }
  }

  return newList;
};

module.exports = { getUser, queriedProducts };
