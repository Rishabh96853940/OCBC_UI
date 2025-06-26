import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from "@angular/forms";
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

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
  selector: 'app-retrival-request',
  templateUrl: './retrival-request.component.html',
  styleUrls: ['./retrival-request.component.scss']
})
export class RetrivalRequestComponent implements OnInit {

  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  isReadonly = true;
  _IndexList: any;
  UserID: any;
  PODEntryForm: FormGroup;
  pickupForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = '';
  _FileNo: any = "";
  first: any = 0;
  firstView: any = 0;
  rows: any = 0;
  first1: any = 0;
  rows1: any = 0;
  _IndexPendingListFile: any;
  _FilteredListFile: any;

  _TotalPages: any = 0;
  _FileList: any;
  _FilteredList: any;
  _IndexPendingList: any;
  bsValue = new Date();
  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,

  ) { }
  ngOnInit() {
    document.body.classList.add('data-entry');
    this.pickupForm = this.formBuilder.group({
      request_number: ['', Validators.required],
      item_code: [''],
      item_number: ['', Validators.required],

      User_Token: localStorage.getItem('User_Token'),
      userid: localStorage.getItem('UserID'),

    });

    this.getPickRequest();
    this.getAllBranchList();
  }
  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, fileName + '.xlsx');
  }
  AllBranch: any
  getAllBranchList() {
    const apiUrl = this._global.baseAPIUrl + 'BranchMaster/GetbranchDeatilsByUserId?USER_ID=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token')
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      console.log("barnch", data)
      this.AllBranch = data
    })
    console.log(this.AllBranch)
  }
  //karta hoon integrate work ho raha abb
  getPickRequest() {

    const apiUrl = this._global.baseAPIUrl + 'Retrival/GetRetrivalRequest?USERId=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: {}) => {

      this._IndexPendingList = data;
      this._FilteredList = data;
      console.log("IndexListPending", data);
      this.prepareTableData(this._FilteredList, this._IndexPendingList);
    });
  }
  getRequestNo() {


  }
  toggleValidators() {
    const mainFileCountControl = this.pickupForm.get('main_file_count');
    const collateralFileCountControl = this.pickupForm.get('collateral_file_count');

    if (this.pickupForm.get('document_type').value === 'Main File') {
      mainFileCountControl.setValidators([Validators.required]);
      collateralFileCountControl.clearValidators();
    } else if (this.pickupForm.get('document_type').value === 'Collateral File') {
      collateralFileCountControl.setValidators([Validators.required]);
      mainFileCountControl.clearValidators();
    } else if (this.pickupForm.get('document_type').value === 'Both (Main and Collateral)') {
      collateralFileCountControl.setValidators([Validators.required]);
      mainFileCountControl.setValidators([Validators.required]);
    }
    else {
      mainFileCountControl.clearValidators();
      collateralFileCountControl.clearValidators();
    }

    mainFileCountControl.updateValueAndValidity();
    collateralFileCountControl.updateValueAndValidity();
  }
  get PickupControls() { return this.pickupForm.controls }
  onSubmit() {
    this.submitted = true;
    console.log(this.pickupForm.value)
    if (!this.pickupForm.valid) {
      return;
    }
    console.log(this.pickupForm.value)
    const that = this;
    var apiUrl = this._global.baseAPIUrl + 'Retrival/AddRefilingRequest';

    this._onlineExamService.postPickupRequest(this.pickupForm.value, apiUrl)
      .subscribe(data => {

        this.showmessage(data)
        apiUrl = this._global.baseAPIUrl + 'Refilling/GetAvanceRefillingRequestNumber?userId=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token') + '&request_no=';
        this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: any) => {
          this.pickupForm.reset()
          this.pickupForm = this.formBuilder.group({
            request_number: [data, Validators.required],
            item_code: [''],
            item_number: ['', Validators.required],
            User_Token: localStorage.getItem('User_Token'),
            userid: localStorage.getItem('UserID'),

          });
          const apiUrl1 = this._global.baseAPIUrl + 'Retrival/GetRefilingRequestDataByRequestNo?userId=' + localStorage.getItem('UserID') + '&request_no=' + data + '&user_Token=' + localStorage.getItem('User_Token');
          this._onlineExamService.getAllPickupData(apiUrl1).subscribe((data1: any) => {
            console.log(data1)
            this.prepareTableData1(data1, data1)

          })

        });
      });
    // }

  }
  closeModel() {
    this.modalRef.hide()
  }
  closeRequest() {
    const apiUrl1 = this._global.baseAPIUrl + 'Retrival/CloseRefilingRequest?USERId=' + localStorage.getItem('UserID') + '&request_number=' + this.pickupForm.get('request_number').value + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllPickupData(apiUrl1).subscribe((data1: any) => {
      console.log(data1)
      this.showmessage(data1)
      this.pickupForm = this.formBuilder.group({
        request_number: ["", Validators.required],
        item_code: [''],
        item_number: ['', Validators.required],
        User_Token: localStorage.getItem('User_Token'),
        userid: localStorage.getItem('UserID'),

      });
      this.closeModel()
    })
  }


  formattedData: any = [];
  formattedData1: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;



  headerList1: any
  immutableFormattedData1: any
  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'request_number', header: 'REQUEST NO', index: 2 },
      { field: 'retrival_type', header: 'RETRIEVALTYPE', index: 3 },
      { field: 'delivery_type', header: 'DELIVERY TYPE', index: 3 },
      { field: 'FileCount', header: 'FILE COUNT', index: 3 },
      // { field: 'page_count', header: 'PAGE COUNT', index: 3 },
      { field: 'retrieval_reason', header: 'RETRIEVAL REASON', index: 3 },
      { field: 'created_by', header: 'REQUESTED BY', index: 3 },
      { field: 'created_date', header: 'REQUEST DATE', index: 4 },
      // { field: 'remark', header: 'REQUESTER REMARK', index: 4 },
      { field: 'item_status', header: 'REQUEST STATUS', index: 2 },
    ];
    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'request_number': el.request_number,
        'item_code': el.item_code,
        'retrival_type': el.retrival_type,
        'delivery_type': el.delivery_type,
        'retrieval_reason': el.retrieval_reason,
        'item_number': el.item_number,
        'created_by': el.created_by,
        'created_date': el.created_date,
        // 'remark': el.remark,
        'item_status': el.item_status,
        'FileCount': el.FileCount,
        // 'page_count': el.page_count
      });
    })
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  Editinward2(car: any) {
    const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/GetFileInventoryByRequestNo?request_id=' + car.request_id + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      this.exportToExcel(data, 'Download')


    });
  }
  searchTable($event) {
    // console.log($event.target.value);

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
  searchTable1($event) {
    // console.log($event.target.value);

    let val = $event.target.value;
    if (val == '') {
      this.formattedData1 = this.immutableFormattedData1;
    } else {
      let filteredArr = [];
      const strArr = val.split(',');
      this.formattedData = this.immutableFormattedData1.filter(function (d) {
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
      this.formattedData1 = filteredArr;
    }
  }

  OnReset() {
    this.Reset = true;
    this.isReadonly = false;

  }
  AllDataShowRowWise: any
  Editinward1(template: TemplateRef<any>, row: any) {
    console.log(row)
    this.pickupForm.get('request_number').setValue(row.request_number)
    const apiUrl1 = this._global.baseAPIUrl + 'Retrival/getRetrivalDispatchByRequestno?USERId=' + localStorage.getItem('UserID') + '&request_no=' + row.request_number + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllPickupData(apiUrl1).subscribe((data1: any) => {
      console.log("my", data1)
      this.prepareTableData1(data1, data1)

    })
    this.modalRef = this.modalService.show(template);

  }
  OnClose() {
    this.modalRef.hide()
  }

  prepareTableData1(tableData, headerList) {
    console.log(tableData)
    let formattedData = [];
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'pod_number', header: 'POD NO', index: 3 },
      { field: 'request_number', header: 'REQ NO', index: 3 },
      { field: 'item_code', header: 'ITEM CODE', index: 2 },
      { field: 'item_number', header: 'ITEM NUMBER', index: 2 },
      { field: 'courier_name', header: 'COURIER NAME', index: 2 },
      { field: 'workorder_number', header: 'WORKORDER NUMBER', index: 3 },
      { field: 'approval_by', header: 'APPROVED/REJECTED BY', index: 3 },
      { field: 'approval_date', header: 'APPROVED/REJECTED DATE', index: 3 },
      { field: 'pod_entry_by', header: 'DISPATCH BY', index: 3 },
      { field: 'pod_entry_date', header: 'DISPATCH DATE', index: 3 },
      { field: 'EmailID', header: 'EMAIL ID', index: 3 },
      { field: 'file_status', header: 'FILE STATUS', index: 3 },
      { field: 'retrival_remark', header: 'RETRIEVAL REMARK', index: 3 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'pod_number': el?.pod_number,
        'request_number': el?.request_number,
        'courier_name': el?.courier_name,
        'item_number': el?.item_number,
        'item_code': el?.item_code,
        'file_status': el?.file_status,
        'request_by': el?.request_by,
        'request_date': el?.request_date,
        'status': el?.status,
        'retrival_remark': el?.retrival_remark,
        'workorder_number': el.workorder_number,
        'page_count': el.page_count,
        'approval_by': el.approval_by,
        'approval_date': el.approval_date,
        'pod_entry_by': el.pod_entry_by,
        'pod_entry_date': el.pod_entry_date,
        'EmailID': el.EmailID,
      });

    });
    this.headerList1 = tableHeader;
    this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
    this.formattedData1 = formattedData;
    this.loading = false;
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  paginateView(e) {
    this.firstView = e.firstView;
    this.rows = e.rows;
  }

  paginate1(e) {
    this.first1 = e.first;
    this.rows1 = e.rows;
  }

  hidepopup() {
    // this.modalService.hide;
    this.modalRef.hide();
    //this.modalRef.hide
  }
  get FormControls() { return this.pickupForm.controls }
  Add(template: TemplateRef<any>) {
    const apiUrl = this._global.baseAPIUrl + 'Refilling/GetAvanceRefillingRequestNumber?userId=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token') + '&request_no=';
    this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: any) => {
      this.pickupForm.reset()
      this.pickupForm = this.formBuilder.group({
        request_number: [data, Validators.required],
        item_code: [''],
        item_number: ['', Validators.required],
        User_Token: localStorage.getItem('User_Token'),
        userid: localStorage.getItem('UserID'),

      });
      const apiUrl1 = this._global.baseAPIUrl + 'Retrival/GetRefilingRequestDataByRequestNo?userId=' + localStorage.getItem('UserID') + '&request_no=' + data + '&user_Token=' + localStorage.getItem('User_Token');
      this._onlineExamService.getAllPickupData(apiUrl1).subscribe((data1: any) => {
        console.log(data1)
        this.prepareTableData1(data1, data1)

      })
      this.modalRef = this.modalService.show(template);

    });
    var that = this;

  }

  Editinward(template: TemplateRef<any>, row: any) {

    var that = this;
    this.pickupForm = this.formBuilder.group({
      branch_id: [row.branch_id],
      request_id: [row.request_id],
      service_type: [row.service_type, Validators.required],
      document_type: [row.document_type, Validators.required],
      remark: [row.remark],
      main_file_count: [row.main_file_count],
      collateral_file_count: [row.collateral_file_count],
      User_Token: localStorage.getItem('User_Token'),
      userid: localStorage.getItem('UserID'),

    });


    this.modalRef = this.modalService.show(template);

  }



  Edit(data: any) {
    console.log(data.request_id)
    // this.dialog.open(NewPickupRequestComponent,{
    //   width:"500px",
    //   data:data.request_id
    // })

  }
  deletedata(id: any) {
    console.log(id)
    swal
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        buttonsStyling: false,
        confirmButtonClass: "btn btn-danger",
        confirmButtonText: "Yes, delete it!",
        cancelButtonClass: "btn btn-secondary",
      })
      .then((result) => {
        if (result.value) {

          const apiUrl = this._global.baseAPIUrl + '/AvansePickupRequest/DeletePickupRequest?request_id=' + id + '&User_Token=' + localStorage.getItem('User_Token') + '&userid=' + localStorage.getItem('UserID');
          this._onlineExamService.DELETEData(apiUrl)
            .subscribe(data => {
              swal.fire({
                title: "Deleted!",
                text: "Folder has been deleted.",
                type: "success",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-primary",
              });

            });
        }
      });
    this.getPickRequest();
  }

  entriesChange($event) {
    this.entries = $event.target.value;
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(selected);
  }
  onActivate(event) {
    this.activeRow = event.row;
  }

  ngOnDestroy() {
    document.body.classList.remove('data-entry')
  }

  showmessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success!</span> <span data-notify="message"> ' + data + ' </span></div>',
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass:
          "ngx-toastr alert alert-dismissible alert-success alert-notify"
      }
    );

  }






}
