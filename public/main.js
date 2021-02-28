const db = firebase.database();
const orders = {};
// function fetchOrders() {
const ck = "ck_e7a75e598b9551db54b160750153656c0d985ef1";
const cs = "cs_b341a298a50106f4756c5b62c03f47b2ea9a1ceb";
const websiteURL = "https://nudefoodsmarket.com";
const date = new Date().toISOString;
const apiURL = "/wp-json/wc/v3/";
const url =
  websiteURL +
  apiURL +
  "orders" +
  "?consumer_key=" +
  ck +
  "&consumer_secret=" +
  cs +
  "&per_page=100";

// let options = {
//   method: "GET",
//   "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
//   muteHttpExceptions: true,
// };
console.log(url);
// asdsa;
let pages = 0;

fetch(url).then((response) => {
  // const apiPromises = [];
  pages = response.headers["X-WP-TotalPages"];
  console.log(response.headers);
  console.log(response.headers["Date"]);
  console.log(pages);
  for (let i = 1; i <= pages; i++) {
    let pageURL = url + "&page=" + i;
    fetch(pageURL)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        for (const value of Object.values(data)) {
          orders[value.number] = value;
        }
        db.ref("orders").set(orders);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

// const http = new XMLHttpRequest();
// http.open("GET", url);
// http.send();
// http.onreadystatechange = (e) => {
//   console.log(http.responseText);
// };
// };
