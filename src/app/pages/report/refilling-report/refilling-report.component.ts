import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import noUiSlider from "nouislider";
import Dropzone from "dropzone";
Dropzone.autoDiscover = false;

import Selectr from "mobius1-selectr";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

import swal from "sweetalert2";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-refilling-report",
  templateUrl: "refilling-report.component.html",
})
export class RefillingreportComponent implements OnInit {
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

  _ColNameList = [
    "request_number",
    "item_number",
    "created_by",
    "created_date",
    "ack_by",
    "ack_date",
    "pickup_date",
    "request_status",
  ];

  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  first = 0;
  rows = 10;
  currentDate: Date;

  constructor(
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants
  ) { }
  ngOnInit() {
    this.currentDate = new Date();

    this.RefillingReportForm = this.formBuilder.group({
      ToDate: [],
      FromDate: [],
      status: [0],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
    });

    this.getreffilingreport();
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'request_number', header: 'REQUEST NUMBER', index: 2 },
      { field: 'item_number', header: 'ITEM NUMBER', index: 3 },
      { field: 'crown_branch_name', header: 'CROWN BRANCH NAME', index: 7 },
      { field: 'workorder_number', header: 'WORKORDER NUMBER', index: 7 },
      { field: 'pickup_date', header: 'PICKUP DATE', index: 2 },
      { field: 'created_by', header: 'REFILLING DONE BY', index: 7 },
      { field: 'refilling_date', header: 'REFILLING DATE', index: 2 },
      { field: 'request_close_by', header: 'REQUEST CLOSE BY', index: 7 },
      { field: 'request_close_date', header: 'REQUEST CLOSE DATE', index: 2 },
      { field: 'ack_by', header: 'REFILLING ACK BY', index: 3 },
      { field: 'ack_date', header: 'REFILLING ACK DATE', index: 7 },
      { field: 'request_status', header: 'REQUEST STATUS', index: 7 },
      { field: 'file_status', header: 'FILE STATUS', index: 2 },
    ];
    
    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'request_number': el.request_number,
        'item_number': el.item_number,
        'created_by': el.created_by,
        'refilling_date': el.refilling_date,
        'request_close_by': el.request_close_by,
        'request_close_date': el.request_close_date,
        'request_status': el.request_status,
        'file_status': el.file_status,
        'crown_branch_name': el.crown_branch_name,
        'ack_by': el.ack_by,
        'ack_date': el.ack_date,
        'pickup_date': el.pickup_date,
        'workorder_number': el.workorder_number,
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  searchTable($event) {
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
            "ngx-toastr alert alert-dismissible alert-danger alert-notify",
        }
      );
    }
  }

  getreffilingreport() {
    const apiUrl = this._global.baseAPIUrl + "Retrival/GetRefillingReport";
    this._onlineExamService
      .postData(this.RefillingReportForm.value, apiUrl)
      .subscribe((data) => {
        this._StatusList = data;
        this._FilteredList = data;
        this.prepareTableData(this._StatusList, this._FilteredList);
      });
  }


  onDownload() {
    this.exportToExcel(this.formattedData, "Refilling Report");
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
}
