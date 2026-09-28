/**
 * ==============================================================================
 * SOUTHERN SPOON RESTAURANT & CAFE - GOOGLE APPS SCRIPT LIVE SALES SYNC
 * ==============================================================================
 * 
 * Instructions to install in Google Sheets:
 * 1. Open your Google Sheet ("Southernspoon")
 * 2. Click "Extensions" > "Apps Script" in top menu bar
 * 3. Replace all existing code with this script
 * 4. Click "Deploy" > "Manage deployments" > Edit icon > Version: "New version" > "Deploy"
 *    (Ensure "Execute as: Me" and "Who has access: Anyone")
 * 5. That's it! When orders are settled in POS, the "Itemized_Sales" sheet
 *    will automatically fill with:
 *    - Date and Time
 *    - Item Name with Portion Type
 *    - Quantity
 *    - Amount (LKR)
 *    - Sum of Amount (LKR)
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload received' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // =========================================================================
    // 1. POPULATE / UPDATE "Itemized_Sales" SHEET
    // Columns: Date and Time | Item Name with Portion Type | Quantity | Amount | Sum of Amount
    // =========================================================================
    var itemSheetName = "Itemized_Sales";
    var itemSheet = ss.getSheetByName(itemSheetName);
    if (!itemSheet) {
      itemSheet = ss.insertSheet(itemSheetName, 0);
      var headerRow = [
        "Date and Time",
        "Item Name with Portion Type",
        "Quantity",
        "Amount (LKR)",
        "Sum of Amount (LKR)",
        "Order #",
        "Table / Channel",
        "Payment Method"
      ];
      itemSheet.appendRow(headerRow);
      
      // Style headers
      var headerRange = itemSheet.getRange(1, 1, 1, headerRow.length);
      headerRange.setBackground("#0F172A")
                 .setFontColor("#38BDF8")
                 .setFontWeight("bold")
                 .setFontSize(11)
                 .setHorizontalAlignment("center");
      itemSheet.setFrozenRows(1);
    }

    var itemRecords = payload.itemized_sales || (payload.daily && payload.daily.itemized_sales) || [];
    
    if (itemRecords && itemRecords.length > 0) {
      // Find existing signatures to prevent duplicate entries
      var lastRow = itemSheet.getLastRow();
      var existingSignatures = {};
      if (lastRow > 1) {
        var existingData = itemSheet.getRange(2, 1, lastRow - 1, 6).getValues();
        for (var i = 0; i < existingData.length; i++) {
          var sig = existingData[i][0] + "|" + existingData[i][1] + "|" + existingData[i][5];
          existingSignatures[sig] = true;
        }
      }

      var rowsToAppend = [];
      for (var j = 0; j < itemRecords.length; j++) {
        var rec = itemRecords[j];
        var itemSig = rec.date_time + "|" + rec.item_name_with_portion + "|" + rec.order_number;
        if (!existingSignatures[itemSig]) {
          var nextRowIndex = lastRow + rowsToAppend.length + 1;
          // Sum of amount formula: =SUM(D$2:D[nextRowIndex])
          var sumFormula = "=SUM(D$2:D" + nextRowIndex + ")";
          
          rowsToAppend.push([
            rec.date_time,
            rec.item_name_with_portion,
            rec.quantity,
            rec.amount,
            sumFormula,
            rec.order_number,
            rec.table_or_type || "Takeaway",
            rec.payment_method || "CASH"
          ]);
          existingSignatures[itemSig] = true;
        }
      }

      if (rowsToAppend.length > 0) {
        itemSheet.getRange(lastRow + 1, 1, rowsToAppend.length, rowsToAppend[0].length)
                 .setValues(rowsToAppend);
        
        var numRows = rowsToAppend.length;
        var startRow = lastRow + 1;
        // Format Amount and Sum as Currency (#,##0.00)
        itemSheet.getRange(startRow, 4, numRows, 2).setNumberFormat("#,##0.00");
        // Center Quantity
        itemSheet.getRange(startRow, 3, numRows, 1).setHorizontalAlignment("center");
      }
    }

    // =========================================================================
    // 2. ALSO MAINTAIN "Terminal_Sales_Performance" SHEET
    // =========================================================================
    var perfSheetName = "Terminal_Sales_Performance";
    var perfSheet = ss.getSheetByName(perfSheetName);
    if (!perfSheet) {
      perfSheet = ss.insertSheet(perfSheetName);
      var perfHeader = [
        "Sync Timestamp",
        "Report Date",
        "Terminal",
        "Total Orders",
        "Net Sales (LKR)",
        "Cash (LKR)",
        "Card (LKR)",
        "LankaQR (LKR)",
        "Food Items Sold",
        "Discounts (LKR)",
        "Average Check (LKR)"
      ];
      perfSheet.appendRow(perfHeader);
      perfSheet.getRange(1, 1, 1, perfHeader.length)
               .setBackground("#1E293B")
               .setFontColor("#FFFFFF")
               .setFontWeight("bold");
      perfSheet.setFrozenRows(1);
    }

    if (payload.daily) {
      var d = payload.daily;
      var cashTotal = 0, cardTotal = 0, qrTotal = 0;
      if (d.sales_by_payment) {
        d.sales_by_payment.forEach(function(p) {
          if (p.method.indexOf("CASH") > -1) cashTotal = p.total;
          else if (p.method.indexOf("CARD") > -1) cardTotal = p.total;
          else if (p.method.indexOf("QR") > -1) qrTotal = p.total;
        });
      }

      perfSheet.appendRow([
        payload.timestamp || new Date().toISOString(),
        d.date || new Date().toISOString().slice(0, 10),
        payload.terminal || "REG-01 (Labuduwa)",
        d.order_count || 0,
        d.total_net_sales || 0,
        cashTotal,
        cardTotal,
        qrTotal,
        d.total_items_sold || 0,
        d.total_discount || 0,
        Math.round(d.average_order_value || 0)
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'success', 
      items_synced: itemRecords.length,
      timestamp: new Date().toISOString() 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ 
    status: 'ok', 
    service: 'Southern Spoon POS Cloud Sync Engine',
    version: '2.0.0',
    columns_supported: [
      'Date and Time',
      'Item Name with Portion Type',
      'Quantity',
      'Amount (LKR)',
      'Sum of Amount (LKR)'
    ]
  })).setMimeType(ContentService.MimeType.JSON);
}
