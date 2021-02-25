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
    var params = [];
    var pageParams = [];

    for (let i = 0; i < 3; i++) {
      var url =
        website +
        "/wp-json/wc/v3/orders?consumer_key=" +
        ck +
        "&consumer_secret=" +
        cs +
        "&per_page=100" +
        "&page=" +
        (i + 1);
      // Logger.log(url);
      var result = UrlFetchApp.fetch(url, options);
      if (result.getResponseCode() == 200) {
        // console.log('contenttext: ', JSON.parse(result.getContentText()));
        pageParams = JSON.parse(result.getContentText());
        params = [...params, ...pageParams];
        // Logger.log(pageParams);
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

      // Logger.log('pageParams below')
      // Logger.log(typeof pageParams[0]);
    }

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

    var temp = doc.getSheetByName("ORDERS - processing");
    let otherSheet = doc.getSheetByName("ORDERS - other");
    let completedSheet = doc.getSheetByName("ORDERS - completed");

    var ordersArray = [];
    var ordersCompletedArray = [];
    var ordersOtherArray = [];

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
    ordersCompletedArray.push(headers);
    ordersOtherArray.push(headers);

    var consumption = {};
    let pickList = [];
    let packList = [];
    // let customerList = [];

    var arrayLength = params.length;
    // Logger.log(arrayLength);
    for (var i = 0; i < arrayLength; i++) {
      var a, c, d;
      // let = orderObj
      var container = [];

      a = container.push(params[i]["billing"]["first_name"]);

      a = container.push(params[i]["billing"]["last_name"]);

      let billingAddress =
        params[i]["billing"]["address_1"] +
        " " +
        params[i]["billing"]["postcode"] +
        " " +
        params[i]["billing"]["city"];

      a = container.push(billingAddress);

      let shippingAddress =
        // params[i]["shipping"]["first_name"] +
        // " " +
        // params[i]["shipping"]["last_name"] +
        // " " +
        params[i]["shipping"]["address_1"] +
        " " +
        params[i]["shipping"]["postcode"] +
        " " +
        params[i]["shipping"]["city"] +
        " " +
        params[i]["shipping"]["country"];

      a = container.push(shippingAddress);

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

        let itemObj = { name: item, qty: qty };
        // Logger.log(itemObj);

        let found = false;
        for (let entry of pickList) {
          // Logger.log(itemObj.name, '=', entry.name);
          // Logger.log(entry.qty, itemObj.qty);
          if (itemObj["name"] === entry["name"]) {
            entry["qty"] = entry["qty"] += itemObj["qty"];
            found = true;
            break;
          } else {
            continue;
          }
        }

        if (params[i]["status"] == "processing") {
          //if (itemObj.class ==

          if (!found) {
            pickList.push(itemObj);
          }
          let itemClass = "other";
          if (true) {
            itemClass = "ex: dry goods";
          } else {
            itemClass = "ex: wet goods";
          }

          let packRow = [
            params[i]["billing"]["first_name"],
            params[i]["billing"]["last_name"],
            qty,
            "",
            item,
            itemClass,
            shippingAddress,
            "",
          ];
          packList.push(packRow);
          //on last iteration add quantity
          if (k == c - 1) {
            packRow = [
              params[i]["billing"]["first_name"],
              params[i]["billing"]["last_name"],
              total_line_items_quantity,
              "",
              "ZZTotal",
              "",
              shippingAddress,
              "",
            ];
            packList.push(packRow);
          }
        }
      }
      // customerRow = [params[i]["billing"]["email"], params[i]["billing"]["phone"], params[i]["billing"]["first_name"], params[i]["billing"]["last_name"], shippingAddress, '', '']
      // customerList.push(customerRow);

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
      if (params[i]["status"] == "processing") {
        ordersArray.push(container);
      } else if (params[i]["status"] == "completed") {
        ordersCompletedArray.push(container);
      } else {
        ordersOtherArray.push(container);
      }

      // temp.appendRow(container);

      //        Logger.log(params[i]);

      removeDuplicates(sheet_name);
    }

    //ORDERS
    //make this function to use 3 times
    var rows = ordersArray.length;
    var cols = ordersArray[0].length;
    temp.getRange(1, 1, rows, cols).setValues(ordersArray);

    var completedRows = ordersCompletedArray.length;
    var completedCols = ordersCompletedArray[0].length;
    completedSheet
      .getRange(1, 1, completedRows, completedCols)
      .setValues(ordersCompletedArray);

    var otherRows = ordersOtherArray.length;
    var otherCols = ordersOtherArray[0].length;
    otherSheet.getRange(1, 1, otherRows, otherCols).setValues(ordersOtherArray);

    // //CUSTOMERS
    //       customerHeaders = ['Email', 'Phone','First Name', 'Last Name', 'Address', 'Route', 'COMPLETED - Variation', 'Class', 'Address', 'Route'];

    //PICK
    pickList.sort(sortObjNames);
    let pickArray = [];
    //Build pickArray
    for (let item of pickList) {
      pickArray.push([item.name, item.qty]);
    }
    //Add Headers
    var headers = ["Product", "Quantity"];
    pickArray.unshift(headers);
    //getRange info
    let pickSheet = doc.getSheetByName("PICK");
    var pickRows = pickArray.length;
    var pickCols = pickArray[0].length;
    // pickSheet.getRange(1, 1, pickRows, pickCols).setValues(pickList);

    //Set Values
    pickSheet.getRange(1, 2, pickRows, pickCols).setValues(pickArray);
    //Format
    pickSheet.getRange(1, 1, pickRows + 1, 1).insertCheckboxes();
    for (var i = 0; i < pickRows; i++) {
      if (i % 2 != 0) {
        pickSheet.getRange(i, 1, 1, pickCols).setBackgroundColor("#fffbf2");
      }
    }
    pickSheet
      .getRange(1, 2, pickRows, 1)
      .setFontColor("black")
      .setFontSize("14");
    pickSheet.setColumnWidth(1, 400);
    pickSheet.setColumnWidth(3, 400);
    pickSheet.getRange(1, 3, pickRows, 1).setHorizontalAlignment("center");
    var pickLastColumn = pickSheet.getMaxColumns();
    var pickLastRow = pickSheet.getMaxRows();
    // pickSheet.deleteColumns(pickCols + 2, pickLastColumn - pickCols - 1);
    // pickSheet.deleteRows(pickRows + 1, pickLastRow - pickRows)
    pickSheet.getRange(1, 1, 1, pickCols).setFontWeight("bold");
    //Conditional Formatting
    var pickChecksRange = pickSheet.getRange(1, 1, pickRows, pickCols);
    var pickRule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied("=$A1")
      .setBackground("#666666")
      .setRanges([pickChecksRange])
      .build();
    var pickRules = pickSheet.getConditionalFormatRules();
    pickRules.push(pickRule);
    pickSheet.setConditionalFormatRules(pickRules);
    //protect line item on pick, unprotect with UNDO button at top.

    //PACK
    let packArray = packList.sort(sort2DArr(1, 4));
    Logger.log(packArray);
    //Build packArray
    // for (let item of packList) {
    //   packArray.push([item.name, item.qty])
    // }
    //Add Headers
    packHeaders = [
      "First Name",
      "Last Name",
      "Quantity",
      "Packed?",
      "Product - Variation",
      "Class",
      "Address",
      "Route",
    ];
    packArray.unshift(packHeaders);
    Logger.log(packArray);
    // Logger.log(packArray);
    //getRange info
    let packSheet = doc.getSheetByName("PACK");
    var packRows = packArray.length;
    var packCols = packArray[0].length;
    //Set Values
    packSheet.getRange(1, 1, packRows, packCols).setValues(packArray);
    //Format
    // packSheet.insertColumnAfter(3)
    //highlight every other row for clarity
    for (var i = 0; i < packRows; i++) {
      if (i % 2 != 0) {
        packSheet.getRange(i, 1, 1, packCols + 1).setBackgroundColor("#fffbf2");
      }
    }
    packSheet
      .getRange(2, 3, packRows, 2)
      .setFontColor("black")
      .setFontSize("14");
    packSheet.setColumnWidth(3, 70);
    packSheet.setColumnWidth(4, 50);
    packSheet.setColumnWidth(5, 150);
    packSheet.setColumnWidth(7, 200);
    packSheet.getRange(2, 4, packRows - 1, 1).insertCheckboxes();
    packSheet.getRange(1, 3, packRows, 1).setHorizontalAlignment("center");
    packSheet.getDataRange().setVerticalAlignment("middle");
    // var packHeaders = [["First Name", "Last Name", "Quantity", "", "Product", "Variation", "Address", "Shipping Method"]];
    packSheet.getRange(1, 1, 1, packHeaders.length).setFontWeight("bold");
    for (var i = 0; i < packRows; i++) {
      if (packArray[i][4] == "ZZTotal") {
        packSheet.getRange(i + 1, 3).setFontWeight("bold");
        packSheet
          .getRange(i + 1, 1, 1, packHeaders[0].length)
          .setBackgroundColor("#9bb88e")
          .setFontColor("#f3f3f3");
      } else if (packArray[i][2] > 1) {
        packSheet.getRange(i + 1, 3).setBackgroundColor("#e3f1df");
      }
    }
    var packLastColumn = packSheet.getMaxColumns();
    var packLastRow = packSheet.getMaxRows();
    // packSheet.deleteColumns(packHeaders[0].length + 1, packLastColumn - packHeaders[0].length);
    // packSheet.deleteRows(packRows + 1, packLastRow - packRows);
    //Conditional Formatting
    var packChecksRange = packSheet.getRange(
      1,
      1,
      packRows,
      packHeaders[0].length
    );
    var packRule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied("=$D1")
      .setBackground("#666666")
      .setRanges([packChecksRange])
      .build();
    var packRules = packSheet.getConditionalFormatRules();
    packRules.push(packRule);
    packSheet.setConditionalFormatRules(packRules);
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

function sortObjNames(a, b) {
  if (a["name"] === b["name"]) {
    return 0;
  } else {
    return a["name"] < b["name"] ? -1 : 1;
  }
}

function sortFunction(a, b) {
  if (a[0] === b[0]) {
    return 0;
  } else {
    return a[0] < b[0] ? -1 : 1;
  }
}

function sort2DArray(a, b) {
  if (a[1] === b[1]) {
    return a[4] < b[4] ? -1 : a[4] > b[4] ? 1 : 0;
  } else {
    return a[1] < b[1] ? -1 : 1;
  }
}

function sort2DArr(firstColToSort, secondColToSort) {
  return function sort(a, b) {
    if (a[firstColToSort] === b[firstColToSort]) {
      return a[secondColToSort] < b[secondColToSort]
        ? -1
        : a[secondColToSort] > b[secondColToSort]
        ? 1
        : 0;
    } else {
      return a[firstColToSort] < b[firstColToSort] ? -1 : 1;
    }
  };
}
