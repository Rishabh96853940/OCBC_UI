import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import noUiSlider from "nouislider";
import Dropzone from "dropzone";
Dropzone.autoDiscover = false;
import { formatDate } from '@angular/common';
import Selectr from "mobius1-selectr";
import swal from "sweetalert2";
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-item-status-report",
  templateUrl: "item-status-report.component.html",
})
export class ItemstatusreportComponent implements OnInit {
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
      bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  minToDate: Date | undefined;
  maxFromDate: Date | undefined;
    _ColNameList = [
      
     // "Batch_ID",
      "Carton_No",
      "Warehouse_Name",
      "Item_Location",
      "Created_By",
      "Created_Date",
      "Item_status",
      
  
    ];
  
  
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
     DATEFROM:[],  
      DATETO:[],
        status: [0],
        User_Token: localStorage.getItem("User_Token"),
        CreatedBy: localStorage.getItem("UserID"),
      });
  
      this.RefillingReportForm.controls['status'].setValue(0);
      this.getreffilingreport();
     this.GetItemstatusreportList();
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
        { field: "CartonNo", header: "CARTON NO", index: 2 },
         { field: "WarehouseName", header: "WAREHOUSE NAME", index: 2 },
         { field: "ItemLcoation", header: "ITEM LOCATION", index: 2 },
          { field: "CreatedBy", header: "CREATED BY", index: 2 },
         { field: "CreatedDateFormatted", header: "CREATED DATE", index: 2 },      
         { field: "ItemStatus", header: "ITEM STATUS", index: 2 },
      ];
  
      tableData.forEach((el, index) => {
        formattedData.push({
          CartonNo: el.CartonNo,
          WarehouseName: el.WarehouseName,
          ItemLcoation: el.ItemLcoation,
          CreatedBy: el.CreatedBy,
          CreatedDateFormatted: el.CreatedDateFormatted,
          ItemStatus: el.ItemStatus,
        });
      });
      this.headerList = tableHeader;
      this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
      this.formattedData = formattedData;
      this.loading = false;
  
      // console.log(this.formattedData);
    }
  
    // searchTable($event) {
  
    //   if (!this.RefillingReportForm.controls["FromDate"].value || !this.RefillingReportForm.controls["ToDate"].value) {
  
    //     this.toastr.show(
    //       '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">There should be some data before you download!</span></div>',
    //       "",
    //       {
    //         timeOut: 3000,
    //         closeButton: true,
    //         enableHtml: true,
    //         tapToDismiss: false,
    //         titleClass: "alert-title",
    //         positionClass: "toast-top-center",
    //         toastClass:
    //           "ngx-toastr alert alert-dismissible alert-danger alert-notify"
    //       }
    //     );
    //     return;
    //   }
  
  searchTable($event) {
    let val = $event.target.value;
    if (val == '') {
      this.formattedData = this.immutableFormattedData;
    } else {
      let filteredArr = [];
      const strArr = val.split(',');
      this.formattedData = this.immutableFormattedData.filter(function (d) {
        for (var key in d) {
          strArr.forEach(el => {
            if (d[key] && el !== '' && (d[key] + '').toLowerCase().indexOf(el.toLowerCase()) !== -1) {
              if (filteredArr.filter(el => el.srNo === d.srNo).length === 0) {
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
      const apiUrl = this._global.baseAPIUrl + "Status/GetItemstatusreportList"; 
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
      //this._ColNameList[1] = "batch_id";
      this._ColNameList[0] = "carton_no";
      this._ColNameList[1] = "warehouse_name";
      //this._ColNameList[2] = "warehouse_location";
      this._ColNameList[2] = "item_location";
      this._ColNameList[3] = "created_by";
      this._ColNameList[4] = "created_date";
      this._ColNameList[5] = "item_status";
      // this._ColNameList[3] = "department_name";
      // this._ColNameList[4] = "batch_created_by";
  
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

  onFromDateChange(date: Date) {
  this.minToDate = date;
 
  const toDate = this.RefillingReportForm.get('DATETO')?.value;
  if (toDate && new Date(toDate) < new Date(date)) {
    this.RefillingReportForm.get('DATETO')?.setValue(null); 
  }
}

onToDateChange(date: Date) {
  this.maxFromDate = date;
 
  const fromDate = this.RefillingReportForm.get('DATEFROM')?.value;
  if (fromDate && new Date(fromDate) > new Date(date)) {
    this.RefillingReportForm.get('DATEFROM')?.setValue(null); 
  }
}
 
GetItemstatusreportList() {
  const fromDate = this.RefillingReportForm.get('DATEFROM')?.value;
  const toDate = this.RefillingReportForm.get('DATETO')?.value;
  const token = localStorage.getItem("User_Token");

  const payload = {
    DATEFROM: fromDate ? new Date(fromDate).toISOString() : null,
    DATETO: toDate ? new Date(toDate).toISOString() : null,
    User_Token: token
  };

  const apiUrl = this._global.baseAPIUrl + "Status/GetItemstatusreportList";

  this._onlineExamService.postData(payload, apiUrl).subscribe(
    (data) => {
      let filtered = data.map((item: any) => {
        return {
          ...item,
          CreatedDateFormatted: formatDate(item.CreatedDate, 'dd-MM-yyyy', 'en-IN')
        };
      });

      if (fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        filtered = filtered.filter((item: any) => {
          if (!item.CreatedDate) return false;
          const itemDate = new Date(item.CreatedDate);
          itemDate.setHours(0, 0, 0, 0);
          from.setHours(0, 0, 0, 0);
          to.setHours(0, 0, 0, 0);
          return itemDate >= from && itemDate <= to;
        });
      }

      this._StatusList = filtered;
      this._FilteredList = filtered;
      this.prepareTableData(this._StatusList, this._FilteredList);
    },
    (error) => {
      console.error("API error:", error);
    }
  );
}

  
  GetSearchedData() {
    const fromDateStr = this.RefillingReportForm.get('FromDate')?.value;
    const toDateStr = this.RefillingReportForm.get('ToDate')?.value;
    const token = localStorage.getItem("User_Token");
  
    const apiUrl = this._global.baseAPIUrl + "Status/GetItemstatusreportList?user_Token=" + token;
  
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      if (data && data.length > 0) {
        this._StatusList = data;
  
        if (fromDateStr && toDateStr) {
          const from = new Date(fromDateStr);
          const to = new Date(toDateStr);
  
          this._FilteredList = this._StatusList.filter((item: any) => {
            if (!item.CreatedDate) return false;
  
            // 👇 This part parses dd-MM-yyyy or dd/MM/yyyy safely
            const parts = item.created_date.includes('-')
              ? item.created_date.split('-')
              : item.created_date.split('/');
  
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
    this.GetItemstatusreportList();
  }
  // ...existing code...
  downloadFile() {
    const filename = 'Item_Status_Report_CSV';

    // CSV Header
    let csvData = "Carton_No,Warehouse_Name,Item_Location,Created_by,Created_date,Item_status\n";

    // Ensure formattedData is defined
    if (!this.formattedData || this.formattedData.length === 0) {
      console.warn("No data to download.");
      return;
    }

    // Add data rows
    this.formattedData.forEach((row: any) => {
      csvData +=
        `${row.CartonNo ?? ''},${row.WarehouseName ?? ''},${row.ItemLcoation ?? ''},${row.CreatedBy ?? ''},${row.CreatedDate ?? ''},${row.ItemStatus ?? ''},\n`;
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
  