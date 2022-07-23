const algo = require("./algorithm");
require("dotenv").config();

const calculateDelivery = (list, address) => {
  const defaultAdd = parseInt(process.env.OTHERS_DELIVER);
  for (let i = 0; i < list.length; i++) {
    list[i].delivery = list[i].delivery[address] || defaultAdd;
  }

  return list;
};

// Actual Implimentation
const filterDelivery = (list, max = true) => {
  algo.quickSort(list, 0, list.length - 1, "delivery");

  if (max === true) {
    return list;
  }

  const end = algo.binarySearch(list, 0, list.length - 1, max + 1, "delivery");
  if (end === -1) {
    return list;
  }

  return list.slice(0, end);
};

const filterBrand = (list, brand) => {
  const newList = [];
  for (let i = 0; i < list.length; i++) {
    if (list[i].brand.toLowerCase() === brand) {
      newList.push(list[i]);
    }
  }

  return newList;
};

const sortRating = (list, htl = true) => {
  algo.quickSort(list, 0, list.length - 1, "reviews", htl);
  return list;
};
const sortPrice = (list, htl = true) => {
  algo.quickSort(list, 0, list.length - 1, "price", htl);
  return list;
};

// const pList = [
//   {
//     brand: "apple",
//     name: "mac",
//     reviews: 20,
//     price: 40000,
//     delivery: { mumbai: 9, delhi: 10, uk: 5 },
//   },
//   {
//     brand: "apple",
//     name: "iphone",
//     reviews: 10,
//     price: 20000,
//     delivery: { delhi: 14, uk: 5 },
//   },
//   {
//     brand: "oppo",
//     name: "android",
//     reviews: 18,
//     price: 10000,
//     delivery: { mumbai: 4, delhi: 6, uk: 7 },
//   },
//   {
//     brand: "realme",
//     name: "mobile",
//     reviews: 40,
//     price: 20000,
//     delivery: { mumbai: 15, delhi: 7, uk: 14 },
//   },
//   {
//     brand: "rawats",
//     name: "glass",
//     reviews: 5,
//     price: 5000,
//     delivery: { mumbai: 7, delhi: 12, uk: 8 },
//   },
//   {
//     brand: "rawats",
//     name: "ganja",
//     reviews: 8,
//     price: 60000,
//     delivery: { mumbai: 2, delhi: 1, uk: 4 },
//   },
// ];

module.exports = {
  calculateDelivery,
  filterDelivery,
  filterBrand,
  sortPrice,
  sortRating,
};
