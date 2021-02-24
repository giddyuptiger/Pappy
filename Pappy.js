function myFunction() {
  var sheet_name = SpreadsheetApp.getActiveSpreadsheet()
    .getActiveSheet()
    .getName();
  fetch_orders(sheet_name);
  console.log(sheet_name);

  function fetch_orders(sheet_name) {
    var ck = "ck_e7a75e598b9551db54b160750153656c0d985ef1";

    var cs = "cs_b341a298a50106f4756c5b62c03f47b2ea9a1ceb";

    var website = "https://nudefoodsmarket.com";

    var manualDate = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(sheet_name)
      .getRange("B6")
      .getValue(); // Set your order start date in spreadsheet in cell B6

    var m = new Date().toISOString();
    console.log("date: ", m);

    var surl =
      website +
      "/wp-json/wc/v3/orders?consumer_key=" +
      ck +
      "&consumer_secret=" +
      cs +
      "&per_page=5";
    // + "&after=" + m ;
    var url = surl;
    Logger.log(url);

    var options = {
      method: "GET",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      muteHttpExceptions: true,
    };

    var result = UrlFetchApp.fetch(url, options);

    Logger.log(result.getResponseCode());
    if (result.getResponseCode() == 200) {
      var params = JSON.parse(result.getContentText());
      // Logger.log(params);
      // console.log('headers: ', result.getHeaders());
      // console.log('all headers: ', result.getAllHeaders());
    }

    var pages = result.getHeaders()["x-wp-totalpages"];
    // console.log(pages);
    // var params = {};
    // var pageParams = {};
    /*
      for (let i = 0; i < 1; i++) {
        var url =
          website +
          "/wp-json/wc/v3/orders?consumer_key=" +
          ck +
          "&consumer_secret=" +
          cs +
          "&per_page=100" +
          "&page=" +
          (i + 1);
        Logger.log(url);
        var result = UrlFetchApp.fetch(url, options);
        if (result.getResponseCode() == 200) {
          // console.log('contenttext: ', JSON.parse(result.getContentText()));
          // pageParams[i] = JSON.parse(result.getContentText());
                  // pageParams[i] = {an: "object", another: "object or something"};
  
          // Logger.log('types below');
          // Logger.log(typeof result.getContentText());
          // Logger.log(typeof JSON.parse(result.getContentText()));
          // Logger.log(typeof pageParams[i]);
  
          // var testParams = JSON.parse(result.getContentText());
          // Logger.log(pageParams);
          // console.log(result.getHeaders());
        } else {
          console.log("error: ", result.getResponseCode());
        }
        // params = {
        //   ...params,
        //   ...pageParams
        // }
  
        // Logger.log('pageParams below')
        // Logger.log(typeof pageParams[0]);
      }
      */
    // Logger.log('pageParams length below ')
    // Logger.log(pageParams.length);
    // Logger.log(pageParams[0][0][0]);
    // Logger.log(pageParams[0]);

    // for (var i = 0; i < pages; i++) {
    //   for (var j = 0; j < 100; j++) {
    //     var count = j + i * 100;
    //     // params[count] = pageParams[i][j];
    //     console.log(params[i][j]);
    //   }
    // }
    Logger.log(params);

    var doc = SpreadsheetApp.getActiveSpreadsheet();

    var temp = doc.getSheetByName(sheet_name);

    var ordersArray = [];

    var headers = [
      "First",
      "Last",
      "Billing Address",
      "Shipping Address",
      "Phone",
      "Email",
      "Customer Note",
      "Pay Method",
      "Items",
      "Total Qty",
      "Total",
      "Discount",
      "Refunded",
      "Total - Refund",
      "Refunded Items",
      "id",
      "Date Created",
      "Date Modified",
      "Status",
      "Order Key",
    ];
    ordersArray.push(headers);

    var consumption = {};

    var arrayLength = params.length;
    // Logger.log(arrayLength);
    for (var i = 0; i < arrayLength; i++) {
      if (params[i]["status"] !== "processing") {
        continue;
      }
      var a, c, d;
      var container = [];

      a = container.push(params[i]["billing"]["first_name"]);
      Logger.log(a);

      a = container.push(params[i]["billing"]["last_name"]);

      a = container.push(
        params[i]["billing"]["address_1"] +
          " " +
          params[i]["billing"]["postcode"] +
          " " +
          params[i]["billing"]["city"]
      );

      a = container.push(
        params[i]["shipping"]["first_name"] +
          " " +
          params[i]["shipping"]["last_name"] +
          " " +
          params[i]["shipping"]["address_1"] +
          " " +
          params[i]["shipping"]["postcode"] +
          " " +
          params[i]["shipping"]["city"] +
          " " +
          params[i]["shipping"]["country"]
      );

      a = container.push(params[i]["billing"]["phone"]);

      a = container.push(params[i]["billing"]["email"]);

      a = container.push(params[i]["customer_note"]);

      a = container.push(params[i]["payment_method_title"]);

      c = params[i]["line_items"].length;

      var items = "";
      var total_line_items_quantity = 0;
      for (var k = 0; k < c; k++) {
        var item, item_f, qty, meta;

        item = params[i]["line_items"][k]["name"];

        qty = params[i]["line_items"][k]["quantity"];

        item_f = qty + " x " + item;

        items = items + item_f + ",\n";

        total_line_items_quantity += qty;
      }

      a = container.push(items);

      a = container.push(total_line_items_quantity); // Quantity

      a = container.push(params[i]["total"]); //Price

      a = container.push(params[i]["discount_total"]); // Discount

      d = params[i]["refunds"].length;

      var refundItems = "";

      var refundValue = 0;

      for (var r = 0; r < d; r++) {
        var item, item_f, value;

        item = params[i]["refunds"][r]["reason"];

        value = params[i]["refunds"][r]["total"];

        refundValue += parseInt(value);

        item_f = value + " - " + item;

        refundItems += item_f + ",\n";
      }

      a = container.push(refundValue); //Refunded value from order

      a = container.push(parseFloat(container[10]) + refundValue); // Total minus refund

      a = container.push(refundItems); //Refunded items from order

      a = container.push(params[i]["id"]);

      a = container.push(params[i]["date_created"]);

      a = container.push(params[i]["date_modified"]);

      a = container.push(params[i]["status"]);

      a = container.push(params[i]["order_key"]);

      // var doc = SpreadsheetApp.getActiveSpreadsheet();

      // var temp = doc.getSheetByName(sheet_name);
      ordersArray.push(container);

      // temp.appendRow(container);

      //        Logger.log(params[i]);

      removeDuplicates(sheet_name);
    }

    var rows = ordersArray.length;
    var cols = ordersArray[0].length;
    temp.getRange(1, 1, rows, cols).setValues(ordersArray);
  }

  function removeDuplicates(sheet_name) {
    var doc = SpreadsheetApp.getActiveSpreadsheet();

    var sheet = doc.getSheetByName(sheet_name);

    var data = sheet.getDataRange().getValues();

    var newData = new Array();

    for (i in data) {
      var row = data[i];
      /*  TODO feature enhancement in de-duplication
          var date_modified =row[row.length-2];
        
          var order_key = row[row.length];
        
          var existingDataSearchParam = order_key + "/" + date_modified; 
         */

      var duplicate = false;

      for (j in newData) {
        var rowNewData = newData[j];

        var new_date_modified = rowNewData[rowNewData.length - 2];

        var new_order_key = rowNewData[rowNewData.length];

        //var newDataSearchParam = new_order_key + "/" + new_date_modified; // TODO feature enhancement in de-duplication

        if (row.join() == newData[j].join()) {
          duplicate = true;
        }

        // TODO feature enhancement in de-duplication
        /*if (existingDataSearchParam == newDataSearchParam){
              duplicate = true;
            }*/
      }
      if (!duplicate) {
        newData.push(row);
      }
    }
    sheet.clearContents();
    sheet.getRange(1, 1, newData.length, newData[0].length).setValues(newData);
  }
}
