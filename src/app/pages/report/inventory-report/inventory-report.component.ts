import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";

import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
} from "@angular/forms";
import { Injectable } from "@angular/core";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

import { ToastrService } from "ngx-toastr";

import swal from "sweetalert2";

export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

@Component({
  selector: "app-inventory-report",
  templateUrl: "./inventory-report.component.html",
  styleUrls: ["./inventory-report.component.scss"],
})
export class InventoryReportComponent implements OnInit {
   entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  RefillingReportForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = "";
  _FilteredList: any;
  _StatusList: any;
  _HeaderList: any;
  _IndexPendingList: any;
  currentDate: Date;
  _ColNameList = [
    // "request_id",
    // "lan_no",
    // "carton_no",
    // "document_type",
    // "file_no",
    // "item_status",
    // "applicant_name",
    // "branch_name",
    // "created_by",
    // "created_date",
    // "request_status",

    // "Request_ID",
    // "Document_Type",
    // "lan_no",
    // "carton_no",
    // "file_no",
    // "item_status",
    // "app_branch_code",
    // "Branch_Name",
    // "disb_date",
    // "zone_name",
    // "disb_number",
    // "applicant_name",
    // "scheme_name",
    // "smemel_product",
    // "total_disb_amt",
    // "pos",
    // "bal_disb_amt",
    // "schedule_date",
    // "Inventory_By",
    // "Inventory_Date",
    // "request_status",
    // "File_Status",

    "Batch_ID",
    "Carton_No",
    "Department_Name",
    "Batch_Created_By",
    "Approved_By",
    "warehouse_Entry_By",
    "warehouse_Approved_By",
    "Batch_Created_Date",
    "Apporved_Date",
    "Rejected_Date",
    "warehouse_Entry_Date",
    "warehouse_Approved_Date",
    "pickup_Date",
    "warehouse_location_updated_Date",
    "Inventory_Date",
    "status",
    "Inventory_By",

  ];

  // { field: "item_status", header: "ITEM STATUS", index: 2 },      
  // { field: "applicant_name", header: "APPLICANT NAME", index: 2 },      
  // { field: "branch_name", header: "BRANCH NAME", index: 2 },       

  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  first = 0;
  rows = 10;

  constructor(
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants
  ) { }

  ngOnInit() {
    this.currentDate = new Date();
    this.RefillingReportForm = this.formBuilder.group({
      ToDate: [''],
      FromDate: [''],
      status: [0],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });

    this.RefillingReportForm.controls['status'].setValue(0);
   // this.getreffilingreport();
    this.GetInventoryList();
  }

  paginate(e) {
    //this.first = e.first;
    this.first = 0;
    this.rows = e.rows;
  }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = false;
  private formatDate(originalDateString: any) {
    const date = new Date(originalDateString);

    const day = this.padZero(date.getDate());
    const month = this.padZero(date.getMonth() + 1); // Months are zero-based
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    FileSaver.saveAs(blob, fileName + ".xlsx");
  }

  prepareTableData(tableData, headerList) {
    debugger;
    let formattedData = [];
    loading: true;
    let tableHeader: any = [
      // { field: "srNo", header: "SR NO", index: 1 },
      // { field: "request_id", header: "REQUEST NO", index: 2 },
      // { field: "lan_no", header: "LAN NUMBER", index: 2 },
      // { field: "file_no", header: "FILE BARCODE", index: 2 },
      // { field: "carton_no", header: "CARTON NUMBER", index: 7 },
      // { field: "item_status", header: "ITEM STATUS", index: 2 },
      // { field: "applicant_name", header: "CUSTOMER NAME", index: 2 },
      // { field: "document_type", header: "DOCUMENT TYPE", index: 2 },
      // { field: "branch_name", header: "BRANCH NAME", index: 2 },
      // { field: "app_branch_code", header: "BRANCH CODE", index: 2 },
      // { field: "disb_date", header: "DISBURSEMENT DATE", index: 7 }, 
      // { field: "created_by", header: "REQUESTED BY", index: 2 },
      // { field: "created_date", header: "REQUESTED DATE", index: 2 },
      // { field: "InwardBy", header: "INWARDED BY", index: 2 },
      // { field: "InwardAt", header: "INWARDED DATE", index: 2 },
      // { field: "crown_branch_name", header: "CROWN BRANCH NAME", index: 2 },
      // { field: 'pickedup_by', header: 'PICKED UP BY', index: 2 },
      // { field: 'pickedup_date', header: 'PICKED UP DATE', index: 2 },
      // { field: 'pickedup_remark', header: 'PICKED UP REMARK', index: 2 },
      { field: "BatchId", header: "BATCH ID", index: 2 },
      { field: "CartonNo", header: "CARTON NO", index: 2 },
      { field: "DepartmentName", header: "DEPARTMENT NAME", index: 2 },
      { field: "documents", header: "DOCUMENTS", index: 2 },
      { field: "DocumentDetails", header: "DOCUMENT DETAILS", index: 2 },      
      { field: "BatchCreatedBy", header: "BATCH CREATED BY", index: 2 },
      { field: "BatchCreatedDate", header: "BATCH CREATED DATE", index: 2 },
      { field: "InventoryBy", header: "INVENTORY BY", index: 2 },
      { field: "InventoryDate", header: "INVENTORY DATE", index: 2 },
      { field: "ApprovedBy", header: "APPROVED BY", index: 2 },
      { field: "ApprovedDate", header: "APPROVED DATE", index: 2 },
      { field: "RejectedDate", header: "REJECTED DATE", index: 2 },
      { field: "WarehouseEntryBy", header: "WAREHOUSE ENTRY BY", index: 2 },
      { field: "WarehouseEntryDate", header: "WAREHOUSE ENTRY DATE", index: 2 },
      { field: "WarehouseApprovedBy", header: "WAREHOUSE APPROVED BY", index: 2 },
      { field: "WarehouseApprovedDate", header: "WAREHOUSE APPROVED DATE", index: 2 },
      { field: "PickupDate", header: "PICKUP DATE", index: 2 },
      { field: "WarehouseLocationUpdatedDate", header: "WAREHOUSE LOCATION UPDATED DATE", index: 2 },
      //{ field: "Status", header: "STATUS", index: 2 },
      { field: "ItemLcoation", header: "ITEM LOCATION", index: 2 },            
      { field: "warehouseName", header: "WAREHOUSE NAME", index: 2 },
      { field: "ReteionPeriod", header: "RETEION PERIOD", index: 2 },
      { field: "Status", header: "STATUS", index: 2 },

            
      
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        // srNo: parseInt(index + 1),
        // request_id: el.request_id,
        // lan_no: el.lan_no,
        // file_no: el.file_no,
        // carton_no: el.carton_no,
        // item_status: el.item_status,
        // applicant_name: el.applicant_name,
        // document_type: el.document_type,
        // branch_name: el.branch_name,
        // app_branch_code: el.app_branch_code,
        // disb_date: el.disb_date,
        // created_by: el.created_by,
        // created_date: el.created_date,
        // InwardBy: el.InwardBy,
        // InwardAt: el.InwardAt,
        // crown_branch_name: el.crown_branch_name,
        // pickedup_by: el.pickedup_by,
        // pickedup_date: el.pickedup_date,
        // pickedup_remark: el.pickedup_remark,
         BatchId: el.BatchId,
        CartonNo: el.CartonNo,
        DepartmentName: el.DepartmentName,
        DocumentDetails:el.DocumentDetails,

        documents:el.documents,
        BatchCreatedBy: el.BatchCreatedBy,
        ApprovedBy: el.ApprovedBy,
        WarehouseEntryBy: el.WarehouseEntryBy,
        WarehouseApprovedBy: el.WarehouseApprovedBy,
        BatchCreatedDate: el.BatchCreatedDate,
        ApprovedDate: el.ApprovedDate,
        RejectedDate: el.RejectedDate,
        WarehouseEntryDate: el.WarehouseEntryDate,
        WarehouseApprovedDate: el.WarehouseApprovedDate,
        PickupDate: el.PickupDate,
        WarehouseLocationUpdatedDate: el.WarehouseLocationUpdatedDate,
        InventoryDate: el.InventoryDate,
        Status: el.Status,
        InventoryBy: el.InventoryBy,
        ItemLcoation:el.ItemLcoation,
        warehouseName:el.warehouseName,
        ReteionPeriod:el.ReteionPeriod

      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;

    // console.log(this.formattedData);
  }

  searchTable($event) {

   if (!this.RefillingReportForm.controls["FromDate"].value || !this.RefillingReportForm.controls["ToDate"].value) {
 
      // this.toastr.show(
      //   '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">There should be some data before you download!</span></div>',
      //   "",
      //   {
      //     timeOut: 3000,
      //     closeButton: true,
      //     enableHtml: true,
      //     tapToDismiss: false,
      //     titleClass: "alert-title",
      //     positionClass: "toast-top-center",
      //     toastClass:
      //       "ngx-toastr alert alert-dismissible alert-danger alert-notify"
      //   }
      // );
      // return;
    
 
 
    let val = $event.target.value;
    if (val == "") {
      this.formattedData = this.immutableFormattedData;
    } else {
      let filteredArr = [];
      const strArr = val.split(",");
      this.formattedData = this.immutableFormattedData.filter(function (d) {
        for (var key in d) {
          strArr.forEach((el) => {
            if (
              d[key] &&
              el !== "" &&
              (d[key] + "").toLowerCase().indexOf(el.toLowerCase()) !== -1
            ) {
              if (filteredArr.filter((el) => el.srNo === d.srNo).length === 0) {
                filteredArr.push(d);
              }
            }
          });
        }
      });
      this.formattedData = filteredArr;
    }
  }

    let val = $event.target.value;
    if (val == "") {
      this.formattedData = this.immutableFormattedData;
    } else {
      let filteredArr = [];
      const strArr = val.split(",");
      this.formattedData = this.immutableFormattedData.filter(function (d) {
        for (var key in d) {
          strArr.forEach((el) => {
            if (
              d[key] &&
              el !== "" &&
              (d[key] + "").toLowerCase().indexOf(el.toLowerCase()) !== -1
            ) {
              if (filteredArr.filter((el) => el.srNo === d.srNo).length === 0) {
                filteredArr.push(d);
              }
            }
          });
        }
      });
      this.formattedData = filteredArr;
    }
  }

  getreffilingreport1() {
    if (this.RefillingReportForm.value.ToDate && this.RefillingReportForm.value.FromDate) {
      this.RefillingReportForm.controls['status'].setValue(1);
      this.getreffilingreport();
    } else {
      this.toastr.show(
        '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please select from date and to date!</span></div>',
        "",
        {
          timeOut: 3000,
          closeButton: true,
          enableHtml: true,
          tapToDismiss: false,
          titleClass: "alert-title",
          positionClass: "toast-top-center",
          toastClass:
            "ngx-toastr alert alert-dismissible alert-danger alert-notify"
        }
      );

    }

  }


  getreffilingreport() {
    const apiUrl = this._global.baseAPIUrl + "Report/GetFileInventoryReport"; 
    this._onlineExamService.postData(this.RefillingReportForm.value, apiUrl).subscribe((data) => {
        // this._StatusList = data;
        // this._FilteredList = data;
        // this.prepareTableData(this._StatusList, this._FilteredList);
      });
  }

  onDownload() {
    this.exportToExcel(this.formattedData, "File Inventory Report");
  }

  GetHeaderNames() {
    this._HeaderList = "";
    for (let j = 0; j < this._ColNameList.length; j++) {
      this._HeaderList +=
        this._ColNameList[j] + (j <= this._ColNameList.length - 2 ? "," : "");
    }
    this._HeaderList += "\n";
    this._StatusList.forEach((stat) => {
      for (let j = 0; j < this._ColNameList.length; j++) {
        this._HeaderList +=
          stat[this._ColNameList[j]] +
          (j <= this._ColNameList.length - 2 ? "," : "");
      }
      this._HeaderList += "\n";
    });
  }

  OnReset() {
    this.Reset = true;
    this.RefillingReportForm.reset();
  }
  isValid() {
    return this.RefillingReportForm.valid;
  }

   getDisplayNames(csvRecordsArr: any) {
 
    //  console.log("csvRecordsArr",csvRecordsArr);
 
    let headers = (<string>csvRecordsArr[0]).split(',');
    let headerArray = [];
    if (headers.length != 8) {
      var msg = 'Invalid No. of Column Expected :- ' + 8;
      this.ShowErrormessage(msg);
 
      return false;
    }
    //this._ColNameList[0] = "id";
    this._ColNameList[1] = "batch_id";
    this._ColNameList[2] = "carton_no";
    this._ColNameList[3] = "department_name";
    this._ColNameList[4] = "batch_created_by";
    this._ColNameList[5] = "approved_by";
    this._ColNameList[6] = "warehouse_entry_by";
    this._ColNameList[7] = "warehouse_approved_by";
    this._ColNameList[8] = "batch_created_date";
    this._ColNameList[9] = "apporved_date";
    this._ColNameList[10] = "rejected_date";
    this._ColNameList[11] = "warehouse_entry_date";
    this._ColNameList[12] = "warehouse_approved_date";
    this._ColNameList[13] = "pickup_date";
    this._ColNameList[14] = "warehouse_location_updated_date";
    this._ColNameList[15] = "inventory_date";
    //this._ColNameList[16] = "status";
    this._ColNameList[16] = "inventory_by";
    this._ColNameList[17] = "ItemLcoation";
    this._ColNameList[18] = "warehouseName";
    this._ColNameList[19] = "ReteionPeriod";
    this._ColNameList[20] = "Status";
    this._ColNameList[21] = "documents";
    
    // this._ColNameList[2] = "carton_no";
    // this._ColNameList[3] = "department";
    // this._ColNameList[4] = "document_type";
    // this._ColNameList[5] = "detail_document_type";
    // this._ColNameList[6] = "status";
    // this._ColNameList[7] = "created_by";
    // this._ColNameList[8] = "created_date";
    // this._ColNameList[5] = "de";
    // this._ColNameList[6] = "file_status";
    // this._ColNameList[7] = "batch_status";
    // this._ColNameList[8] = "inventory_date";
    // this._ColNameList[9] = "inventory_by";
    // this._ColNameList[10] = "inventory_type_entry";
    // this._ColNameList[11] = "service_type";
    // this._ColNameList[12] = "approved_date";
    // this._ColNameList[13] = "approved_by";
    // this._ColNameList[14] = "expected_pickup_date";
    // this._ColNameList[15] = "pickup_date";
    // this._ColNameList[16] = "pick_by";
    // this._ColNameList[17] = "remarks";
    // this._ColNameList[18] = "warehouse_ack_by";
    // this._ColNameList[19] = "warehouse_ack_date";
    // this._ColNameList[20] = "warehouse_reject_by";
    // this._ColNameList[21] = "warehouse_reject_date";
    // this._ColNameList[22] = "warehouse_reject_reason";
    // this._ColNameList[23] = "date_of_destruction";
    // this._ColNameList[24] = "destruction_by";
    // this._ColNameList[25] = "destruction_date";
    // this._ColNameList[26] = "destruction_remarks";
    //  this._ColNameList[7] ="smemel_product";
    //  this._ColNameList[9] ="disb_number";
    //  this._ColNameList[10] ="total_disb_amt";
    //  this._ColNameList[11] ="pos";  
    //  this._ColNameList[12] ="bal_disb_amt";  
    return true;
  }
   ShowErrormessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Validation ! </span> <span data-notify="message"> ' + data + ' </span></div>',
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass:
          "ngx-toastr alert alert-dismissible alert-danger alert-notify"
      }
    );
 
  }
  //  downloadFile() {
  //   const filename = 'DumpUpload_Format_CSV';
  //   let csvData = "Batch_ID,Carton_No,Department_Name,Batch_Created_By,Approved_By,warehouse_Entry_By,warehouse_Approved_By,Batch_Created_Date,Apporved_Date,Rejected_Date,warehouse_Entry_Date,warehouse_Approved_Date,Pickup_Date,warehouse_location_updated_Date,Inventory_Date,status,Inventory_By\n";
 
  //   // let csvData = "AccountNo,AppNo,CRN,URN,DBDate,DBMonth,DBYear,ProductCode,ProductType,ProductName,COD_OFFICR_ID,CustomerName,BranchCode,BranchName,Zone,ClosedDate";    
  //   //console.log(csvData)
  //   let blob = new Blob(['\ufeff' + csvData], {
  //     type: 'text/csv;charset=utf-8;'
  //   });
  //   let dwldLink = document.createElement("a");
  //   let url = URL.createObjectURL(blob);
  //   let isSafariBrowser = -1;
  //   // let isSafariBrowser = navigator.userAgent.indexOf( 'Safari') != -1 & amp; & amp;
  //   // navigator.userAgent.indexOf('Chrome') == -1;
 
  //   //if Safari open in new window to save file with random filename.
  //   if (isSafariBrowser) {
  //     dwldLink.setAttribute("target", "_blank");
  //   }
  //   dwldLink.setAttribute("href", url);
  //   dwldLink.setAttribute("download", filename + ".csv");
  //   dwldLink.style.visibility = "hidden";
  //   document.body.appendChild(dwldLink);
  //   dwldLink.click();
  //   document.body.removeChild(dwldLink);
 
  // }


//   GetInventoryList() {
//     const asch = this.RefillingReportForm.value;
//     console.log("hoihoih",asch);
//   const apiUrl =
//     this._global.baseAPIUrl +
//     "InventoryDone/GetList?user_Token=" +
//     localStorage.getItem("User_Token");

//   this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
//     if (data && data.length > 0) {
//      this._StatusList = data;
//         this._FilteredList = data;
//         this.prepareTableData(this._StatusList, this._FilteredList);
//     } else {
//       console.warn("No inventory data found.");
//     }
//   }, error => {
//     console.error("API error:", error);
//   });
// }
GetInventoryList() {
  const fromDateStr = this.RefillingReportForm.get('FromDate')?.value;
  const toDateStr = this.RefillingReportForm.get('ToDate')?.value;
  const token = localStorage.getItem("User_Token");

  const apiUrl = this._global.baseAPIUrl + "InventoryDone/GetList?user_Token=" + token;

  this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
    if (data && data.length > 0) {
      this._StatusList = data;

      if (fromDateStr && toDateStr) {
        const from = new Date(fromDateStr);
        const to = new Date(toDateStr);

        this._FilteredList = this._StatusList.filter((item: any) => {
          if (!item.InventoryDate) return false;

          // 👇 This part parses dd-MM-yyyy or dd/MM/yyyy safely
          const parts = item.InventoryDate.includes('-')
            ? item.InventoryDate.split('-')
            : item.InventoryDate.split('/');

          const day = +parts[0];
          const month = +parts[1] - 1;
          const year = +parts[2];
          const invDate = new Date(year, month, day);

          return invDate >= from && invDate <= to;
        });
      } else {
        this._FilteredList = this._StatusList;
      }

      this.prepareTableData(this._FilteredList, this._FilteredList);
    } else {
      this._FilteredList = [];
      this.formattedData = [];
    }
  });
}

GetSearchedData() {
  const fromDateStr = this.RefillingReportForm.get('FromDate')?.value;
  const toDateStr = this.RefillingReportForm.get('ToDate')?.value;
  const token = localStorage.getItem("User_Token");

  const apiUrl = this._global.baseAPIUrl + "InventoryDone/GetList?user_Token=" + token;

  this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
    if (data && data.length > 0) {
      this._StatusList = data;

      if (fromDateStr && toDateStr) {
        const from = new Date(fromDateStr);
        const to = new Date(toDateStr);

        this._FilteredList = this._StatusList.filter((item: any) => {
          if (!item.InventoryDate) return false;

          // 👇 This part parses dd-MM-yyyy or dd/MM/yyyy safely
          const parts = item.InventoryDate.includes('-')
            ? item.InventoryDate.split('-')
            : item.InventoryDate.split('/');

          const day = +parts[0];
          const month = +parts[1] - 1;
          const year = +parts[2];
          const invDate = new Date(year, month, day);

          return invDate >= from && invDate <= to;
        });
      } else {
        this._FilteredList = this._StatusList;
      }

      this.prepareTableData(this._FilteredList, this._FilteredList);
    } else {
      this._FilteredList = [];
      this.formattedData = [];
    }
  });
}


onSearchByDate() {
  this.GetInventoryList();
}
downloadFile() {
  const filename = 'DumpUpload_Format_CSV';

  // CSV Header
  let csvData = "Batch_ID,Carton_No,Department_Name,Batch_Created_By,Approved_By,warehouse_Entry_By,warehouse_Approved_By,Batch_Created_Date,Apporved_Date,Rejected_Date,warehouse_Entry_Date,warehouse_Approved_Date,Pickup_Date,warehouse_location_updated_Date,Inventory_Date,status,Inventory_By\n";

  // Ensure formattedData is defined
  if (!this.formattedData || this.formattedData.length === 0) {
    console.warn("No data to download.");
    return;
  }

  // Add data rows
  this.formattedData.forEach((row: any) => {
    csvData +=
      `${row.BatchId ?? ''},${row.CartonNo ?? ''},${row.DepartmentName ?? ''},` +
      `${row.BatchCreatedBy ?? ''},${row.ApprovedBy ?? ''},${row.WarehouseEntryBy ?? ''},${row.WarehouseApprovedBy ?? ''},` +
      `${row.BatchCreatedDate ?? ''},${row.ApprovedDate ?? ''},${row.RejectedDate ?? ''},` +
      `${row.WarehouseEntryDate ?? ''},${row.WarehouseApprovedDate ?? ''},${row.PickupDate ?? ''},${row.WarehouseLocationUpdatedDate ?? ''},` +
      `${row.InventoryDate ?? ''},${row.Status ?? ''},${row.InventoryBy ?? ''}\n`;
  });

  // Create and download CSV
  const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
  const dwldLink = document.createElement("a");
  const url = URL.createObjectURL(blob);

  dwldLink.setAttribute("href", url);
  dwldLink.setAttribute("download", filename + ".csv");
  dwldLink.style.visibility = "hidden";
  document.body.appendChild(dwldLink);
  dwldLink.click();
  document.body.removeChild(dwldLink);
}
}
