import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import noUiSlider from "nouislider";
import Dropzone from "dropzone";
Dropzone.autoDiscover = false;
import Selectr from "mobius1-selectr";
import swal from "sweetalert2";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-retrieval-report",
  templateUrl: "retrieval-report.component.html",
})
export class RetrievalreportComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  RefillingReportForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = '';
  _FilteredList: any;
  _StatusList: any;
  _HeaderList: any;
  _IndexPendingList: any;
  _ColNameList = ["request_number", "retrival_type", "item_code", "item_number", "branch_name", "lan_no", "disb_date", "created_by", "retrival_request_date", "request_close_date", "pod_entry_by", "pod_entry_date", "item_status", "retrival_remark", "page_count"];
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
    private _global: Globalconstants,

  ) { }
  ngOnInit() {
    this.currentDate = new Date();
    this.RefillingReportForm = this.formBuilder.group({
      ToDate: [],
      FromDate: [],
      status: [0],
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID'),
    });

    this.getretrievalreport();
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  getretrievalreport1() {
    if (this.RefillingReportForm.value.ToDate && this.RefillingReportForm.value.FromDate) {
      if(this.RefillingReportForm.controls['status'].value == "1"){
        this.RefillingReportForm.controls['status'].setValue("1");
      }
      else if(this.RefillingReportForm.controls['status'].value == "2"){
        this.RefillingReportForm.controls['status'].setValue("2");
      }
      else if(this.RefillingReportForm.controls['status'].value == "3"){
        this.RefillingReportForm.controls['status'].setValue("3");
      }
      else if(this.RefillingReportForm.controls['status'].value == "4"){
        this.RefillingReportForm.controls['status'].setValue("4");
      }
      else if(this.RefillingReportForm.controls['status'].value == "5"){
        this.RefillingReportForm.controls['status'].setValue("5");
      }
      this.getretrievalreport();
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

  getretrievalreport() {
    const apiUrl = this._global.baseAPIUrl + 'Report/GetRetrievalReport';
    this._onlineExamService.postData(this.RefillingReportForm.value, apiUrl)
      .subscribe(data => {
        this._StatusList = data;
        this._FilteredList = data;
        this.prepareTableData(data, data);
      });
  }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: 'request_number', header: 'REQUEST NUMBER', index: 5 },
      { field: 'lan_no', header: 'LAN NO', index: 4 },
      { field: 'item_number', header: 'ITEM NUMBER', index: 6 },
      { field: 'branch_name', header: 'BRANCH NAME', index: 1 },
      { field: 'item_code', header: 'ITEM CODE', index: 11 },
      { field: 'item_status', header: 'ITEM STATUS', index: 11 },
      { field: 'retrival_type', header: 'RETRIEVAL TYPE', index: 14 },
      { field: 'delivery_type', header: 'DELIVERY TYPE', index: 20 },
      { field: 'pod_number', header: 'POD NUMBER', index: 18 },
      { field: 'workorder_number', header: 'WORKORDER NUMBER', index: 23 },
      { field: 'courier_name', header: 'COURIER NAME', index: 21 },
      { field: 'page_count', header: 'PAGE COUNT', index: 2 },
      { field: 'EmailID', header: 'EMAIL ID', index: 28 },
      { field: 'request_status', header: 'REQUEST STATUS', index: 8 },
      { field: 'disb_date', header: 'DISB DATE', index: 3 },
      { field: 'dispatch_address', header: 'DISPATCH ADDRESS', index: 16 },
      { field: 'retrival_remark', header: 'RETRIEVAL REMARK', index: 9 },
      { field: 'created_by', header: 'RETRIEVAL REQUEST BY', index: 17 },
      { field: 'retrival_request_date', header: 'RETRIEVAL REQUEST DATE', index: 19 },
      { field: 'request_close_by', header: 'REQUEST CLOSE BY', index: 12 },
      { field: 'request_close_date', header: 'REQUEST CLOSE DATE', index: 13 },
      { field: 'approval_by', header: 'APPROVED/REJECTED BY', index: 3 },
      { field: 'approval_date', header: 'APPROVED/REJECTED DATE', index: 3 },
      { field: 'pod_entry_by', header: 'DISPATCH BY', index: 3 },
      { field: 'pod_entry_date', header: 'DISPATCH DATE', index: 3 },
      { field: 'status', header: 'STATUS', index: 15 },
      { field: 'file_status', header: 'FILE STATUS', index: 10 },
    ];
    
    tableData.forEach((el, index) => {
      formattedData.push({
        'branch_name': el.branch_name,
        'page_count': el.page_count,
        'disb_date': el.disb_date,
        'lan_no': el.lan_no,
        'request_number': el.request_number,
        'item_number': el.item_number,
        'item_status': el.item_status,
        'request_status': el.request_status,
        'retrival_remark': el.retrival_remark,
        'file_status': el.file_status,
        'item_code': el.item_code,
        'request_close_by': el.request_close_by,
        'request_close_date': el.request_close_date,
        'retrival_type': el.retrival_type,
        'status': el.status,
        'dispatch_address': el.dispatch_address,
        'created_by': el.created_by,
        'pod_number': el.pod_number,
        'retrival_request_date': el.retrival_request_date,
        'delivery_type': el.delivery_type,
        'courier_name': el.courier_name,
        'workorder_number': el.workorder_number,
        'approval_by': el.approval_by,
        'approval_date': el.approval_date,
        'pod_entry_by': el.pod_entry_by,
        'pod_entry_date': el.pod_entry_date,
        'EmailID': el.EmailID,
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

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

  onDownload() {
    this.exportToExcel(this.formattedData, "Retrieval Report");
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

      this._HeaderList += this._ColNameList[j] + ((j <= this._ColNameList.length - 2) ? ',' : '');
    }
    this._HeaderList += '\n'
    this._StatusList.forEach(stat => {
      for (let j = 0; j < this._ColNameList.length; j++) {
        this._HeaderList += (stat[this._ColNameList[j]]) + ((j <= this._ColNameList.length - 2) ? ',' : '');
      }
      this._HeaderList += '\n'
    });
  }

  OnReset() {
    this.Reset = true;
    this.RefillingReportForm.reset();
  }
  isValid() {
    return this.RefillingReportForm.valid
  }
}

