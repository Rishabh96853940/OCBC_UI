import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from '@angular/router';
import { saveAs } from 'file-saver';
import { MultiSelectModule } from 'primeng/multiselect';

import swal from "sweetalert2";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-basic-search",
  templateUrl: "basic-search.component.html",
  styleUrls: ["basic-search.component.css"]
})
export class BasicsearchComponent implements OnInit {
    entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  isReadonly = true;
  DispatchList: any;
  _FilteredList: any;
  _HeaderList: any;
  first: any = 0;
  rows: any = 0
  _IndexList: any;
  PODForm: FormGroup;
  ContentSearchForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = '';
  _IndexPendingList: any;
  bsValue = new Date();
  _ColNameList = ["CartonNo", "pod_number", "request_no", "request_type", "request_reason", "product_type", "courier_name", "request_date", "file_status", "status", "file_barcode_status", "branch_name"];

  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private route: ActivatedRoute,
    private router: Router,
  ) { }
  ngOnInit() {
    
    document.body.classList.add('data-entry');
    this.ContentSearchForm = this.formBuilder.group({
      SearchBy: ["0", Validators.required],
      FileNo: ['', Validators.required],
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID'),

    });
    this.PODForm = this.formBuilder.group({
      pod_number: ['', Validators.required],
      Courier_id: ['', Validators.required],
      request_no: ['', Validators.required],
      CartonNo: ['', Validators.required],
      CourierName: ['', Validators.required],
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID'),
    });
    const historyType = this.route.snapshot.params['historytype'];
    if(historyType == 'RetrievalHistory'){
      this.RetrievalHistory();
    }
    else if(historyType == 'PickupHistory'){
      this.PickupHistory();
    }
    this.ContentSearchForm.controls['SearchBy'].setValue("0");
  }

  
  

 RetrievalHistory() {
  const apiUrl = this._global.baseAPIUrl + 'Search/Getbasicsearch?USERId=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token') + '&CartonNo=' + this.route.snapshot.params['CartonNo'];

  this._onlineExamService.getAllData(apiUrl).subscribe((data: any[]) => {
    if (!data || data.length === 0) {
      this.toastr.warning('Carton number does not exist', 'Warning', {
        timeOut: 3000,
        closeButton: true,
        positionClass: 'toast-top-center'
      });
      this._IndexPendingList = [];
      this._FilteredList = [];
      this.formattedData = [];
      this.loading = false;
    } else {
      this._IndexPendingList = data;
      this._FilteredList = data;
      this.prepareTableData(this._FilteredList, this._IndexPendingList);
    }
  }, (error) => {
    this.toastr.error('Failed to fetch data', 'Error', {
      timeOut: 3000,
      closeButton: true,
      positionClass: 'toast-top-center'
    });
  });
}

  
  PickupHistory() {
    const apiUrl = this._global.baseAPIUrl + 'Retrival/PickupHistory?USERId=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token') + '&File_No=' + this.route.snapshot.params['CartonNo'];
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._IndexPendingList = data;
      this._FilteredList = data;
      this.prepareTableDataForPickupHistory(this._FilteredList, this._IndexPendingList);
    });
  }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: 'RequestID', header: 'REQUEST NUMBER', index: 5 },
      { field: 'CartonNo', header: 'CARTON NO', index: 4 },
      // { field: 'item_number', header: 'ITEM NUMBER', index: 6 },
    //  { field: 'branch_name', header: 'BRANCH NAME', index: 1 },
   //   { field: 'item_code', header: 'ITEM CODE', index: 11 },
      { field: 'ServiceType', header: 'SERVICE TYPE', index: 14 },
            { field: 'RetrievalAckDate', header: 'RETRIVAL ACK DATE', index: 3 },
      { field: 'RetrievalAckBy', header: 'RETRIVAL ACK BY', index: 16 },
      { field: 'Remark', header: 'RETRIEVAL REMARK', index: 9 },
      { field: 'FileStatus', header: 'FILE STATUS', index: 10 },
      { field: 'RetrievalDispatchBy', header: 'RETRIVAL DISPATCH BY', index: 3 },
      { field: 'RetrievalDispatchDate', header: 'RETRIVAL DISPATCH DATE', index: 3 },
            { field: 'RetrievalBy', header: 'RETRIEVAL REQUEST BY', index: 17 },
      { field: 'RetrievalDate', header: 'RETRIEVAL REQUEST DATE', index: 19 },
    { field: 'ApprovalBy', header: 'APPROVED/REJECTED BY', index: 3 },
      { field: 'ApprovalDate', header: 'APPROVED/REJECTED DATE', index: 3 },
      { field: 'RequestStatus', header: 'REQUEST STATUS', index: 8 },
      // { field: 'RetrievalAckRejectBy', header: 'RETRIVAL REJECT BY', index: 12 },
      // { field: 'RetrievalAckRejectDate', header: 'RETRIVAL REJECT DATE', index: 13 },
  
      // { field: 'status', header: 'STATUS', index: 15 },
    ];
    
    tableData.forEach((el, index) => {
      formattedData.push({
        // 'branch_name': el.branch_name,
        // 'page_count': el.page_count,
        'RetrievalAckDate': el.RetrievalAckDate,
        'CartonNo': el.CartonNo,
        'RequestID': el.RequestID,
    'RetrievalAckBy':el.RetrievalAckBy,
        'RequestStatus': el.RequestStatus,
        'Remark': el.Remark,
        'FileStatus': el.FileStatus,
        'RetrievalAckRejectBy': el.RetrievalAckRejectBy,
        'RetrievalAckRejectDate': el.RetrievalAckRejectDate,
        'ServiceType': el.ServiceType,
        'status': el.status,
        'dispatch_address': el.dispatch_address,
        'RetrievalBy': el.RetrievalBy,
        'RetrievalDate': el.RetrievalDate,
   
        'ApprovalBy': el.ApprovalBy,
        'ApprovalDate': el.ApprovalDate,
        'RetrievalDispatchBy': el.RetrievalDispatchBy,
        'RetrievalDispatchDate': el.RetrievalDispatchDate,
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

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

    selectedColumns:any
    modelChange(e: any) {
      console.log(e);
      this.selectedColumns = e;
      this.selectedColumns = this.selectedColumns.sort((el1, el2) => el1.pos < el2.pos ? -1 : 1);
    }

  prepareTableDataForPickupHistory(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      // { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'request_id', header: 'REQUEST NO', index: 2 },
      { field: 'service_type', header: 'SERVICE TYPE', index: 2 },
      { field: 'document_type', header: 'DOCUMENT TYPE', index: 3 },
      { field: "main_file_count", header: "REQ MAIN FILE COUNT", index: 4 },
      { field: "collateral_file_count", header: "REQ COLLETRAL FILE COUNT", index: 4, },
      { field: "inward_main_file_count", header: "INWARD MAIN FILE COUNT", index: 4, },
      { field: "inward_collateral_file_count", header: "INWARD COLLETRAL FILE COUNT", index: 4, },
      { field: 'branch_code', header: 'BRANCH CODE', index: 7 },
      { field: 'branch_name', header: 'BRANCH NAME', index: 7 },
      { field: 'request_by', header: 'REQUESTED BY', index: 2 },
      { field: 'request_date', header: 'REQUEST DATE', index: 7 },
      { field: 'remark', header: 'REQUESTOR REMARK', index: 7 },
      { field: 'ack_by', header: 'ACKNOWLEDGE BY', index: 2 },
      { field: 'ack_date', header: 'ACKNOWLEDGE DATE', index: 2 },
      { field: 'pra_remark', header: 'ACK REMARK', index: 7 },
      { field: 'entry_by', header: 'SCHEDULED BY', index: 2 },
      { field: 'schedule_date', header: 'SCHEDULED DATE', index: 2 },
      { field: 'pickedup_by', header: 'PICKED UP BY', index: 2 },
      { field: 'pickedup_date', header: 'PICKED UP DATE', index: 2 },
      { field: 'pickedup_remark', header: 'PICKED UP REMARK', index: 2 },
      { field: 'InwardBy', header: 'INWARD BY', index: 2 },
      { field: "RequestStatus", header: "REQUEST STATUS", index: 4 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'request_id': el.request_id,
        'service_type': el.service_type,
        'document_type': el.document_type,
        'main_file_count': el.main_file_count,
        'collateral_file_count': el.collateral_file_count,
        'inward_main_file_count': el.inward_main_file_count,
        'inward_collateral_file_count': el.inward_collateral_file_count,
        'branch_id': el.branch_id,
        'branch_code': el.branch_code,
        'branch_name': el.branch_name,
        'request_by': el.request_by,
        'request_date': el.request_date,
        'remark': el.remark,
        'ack_by': el.ack_by,
        'ack_date': el.ack_date,
        'schedule_date': el.schedule_date ? this.formatDate(el.schedule_date) : "",
        'entry_by': el.entry_by,
        'pra_remark': el.pra_remark,
        'Request_Status': el.Request_Status,
        'RetrievalBy': el.RetrievalBy,
        'created_date': el.created_date,
        'vehicle_number': el.vehicle_number,
        'reschedule_reason': el.reschedule_reason,
        'reschedule_date': el.reschedule_date ? this.formatDate(el.reschedule_date) : "",
        'escort_name': el.escort_name,
        'escort_number': el.escort_number,
        'pickedup_by': el.pickedup_by,
        'pickedup_date': el.pickedup_date,
        'pickedup_remark': el.pickedup_remark,
        'InwardBy': el.InwardBy,
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


  OnReset() {
    this.Reset = true;
    this.PODForm.reset();
    this.isReadonly = false;
  }

  hidepopup() {
    this.modalRef.hide();
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

  selectedEntries = [];
  allSelected = false;
  selectRow(e, fileNo) {
    if (e.target.checked) {
      this.selectedEntries.push(fileNo);
    } else {
      this.selectedEntries.splice(this.selectedEntries.indexOf(fileNo), 1);
    }
    if (this._FilteredList.length === this.selectedEntries.length) {
      setTimeout(() => {
        this.allSelected = true;
      }, 100);
    } else {
      setTimeout(() => {
        this.allSelected = false;
      }, 100);
    }
    console.log(this.selectedEntries);
  }

  selectAll(e) {
    console.log('All files selected');
    if (e.target.checked) {
      this._FilteredList.forEach(element => {
        this.selectedEntries.push(element.FileNo);
      });
    } else {
      this.selectedEntries = [];
    }
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

    GetHeaderNames() {
    this._HeaderList = "";
    for (let j = 0; j < this._ColNameList.length; j++) {
      this._HeaderList += this._ColNameList[j] + ((j <= this._ColNameList.length - 2) ? ',' : '');
    }
    this._HeaderList += '\n'
    this._FilteredList.forEach(stat => {
      for (let j = 0; j < this._ColNameList.length; j++) {
        this._HeaderList += (stat[this._ColNameList[j]]) + ((j <= this._ColNameList.length - 2) ? ',' : '');
      }
      this._HeaderList += '\n'
    });
  }

  downloadFile() {
    this.GetHeaderNames()
    let csvData = this._HeaderList;
    var csvDatas = csvData.replace("null", "");
    if (this._FilteredList.length > 0) {
      let blob = new Blob(['\ufeff' + csvDatas], {
        type: 'text/csv;charset=utf-8;'
      });
      let dwldLink = document.createElement("a");
      let url = URL.createObjectURL(blob);
      let isSafariBrowser = -1;
      if (isSafariBrowser) {
        dwldLink.setAttribute("target", "_blank");
      }
      dwldLink.setAttribute("href", url);
      dwldLink.setAttribute("download", "Searchrecords" + ".csv");
      dwldLink.style.visibility = "hidden";
      document.body.appendChild(dwldLink);
      dwldLink.click();
      document.body.removeChild(dwldLink);
    } else {
      this.toastr.show(
        '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">There should be some data before you download!</span></div>',
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

  ViewPODDetails(template: TemplateRef<any>, Row: any) {

    this.PODForm.patchValue({
      Courier_id: Row.Courier_id,
      pod_number: Row.pod_number,
      request_no: Row.request_no,
      CartonNo: Row.CartonNo,
    })
    this.modalRef = this.modalService.show(template);
  }

  onUpdate() {
    this.submitted = true;

    if (!this.validation()) {
      return;
    }

    const that = this;
    const apiUrl = this._global.baseAPIUrl + 'Retrival/UpdatePOD';
    this._onlineExamService.postData(this.PODForm.value, apiUrl)
      .subscribe(data => {
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
        this.modalRef.hide();
        that.RetrievalHistory();
      });
  }

  validation() {
    if (this.PODForm.get('pod_number').value == "") {
      this.showmessage("Please Enter POD No");
      return false;
    }
    if (this.PODForm.get('Courier_id').value <= 0) {
      this.showmessage("Please select Courier Name");
      return false;
    }
    return true;
  }

  closmodel() {
    this.modalRef.hide();
  }

  downloadLC(_File: any) {
    if (_File.request_reason != "Loan Closure") {
      return;
    }
    if (_File.file_path == null || _File.lc_filepath == "" || _File.lc_filepath.length == 0) {
      this.showmessage("LC Attachment not available");
      return;
    }
    const fileExt = _File.lc_filepath.substring(_File.lc_filepath.lastIndexOf('.'), _File.lc_filepath.length);
    const apiUrl = this._global.baseAPIUrl + 'Retrival/DownlaodAttachment?ID=' + localStorage.getItem('UserID') + '&file_path=' + _File.lc_filepath + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.downloadDoc(apiUrl).subscribe(res => {
      if (res) {
        saveAs(res, _File.request_no + fileExt);
      }
    });
  }

  downloadAttachment(_File: any) {
    if (_File.file_path == null || _File.Attachment == "" || _File.Attachment.length == 0) {
      this.showmessage("Mail attachment not available");
      return;
    }
    const fileExt = _File.Attachment.substring(_File.Attachment.lastIndexOf('.'), _File.Attachment.length);
    const apiUrl = this._global.baseAPIUrl + 'Retrival/DownlaodAttachment?ID=' + localStorage.getItem('UserID') + '&file_path=' + _File.Attachment + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.downloadDoc(apiUrl).subscribe(res => {
      if (res) {
        saveAs(res, _File.request_no + '_' + _File.CartonNo + fileExt);
      }
    });
  }

  downloadSoftCopy(_File: any) {
    if (_File.request_type != "Scan Copy") {
      return;
    }
    if (_File.file_path == null || _File.file_path == "" || _File.file_path.length == 0) {
      this.showmessage("Soft copy attachment not available");
      return;
    }
    const fileExt = _File.file_path.substring(_File.file_path.lastIndexOf('.'), _File.file_path.length);
    const apiUrl = this._global.baseAPIUrl + 'Retrival/DownlaodAttachment?ID=' + localStorage.getItem('UserID') + '&file_path=' + _File.file_path + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.downloadDoc(apiUrl).subscribe(res => {
      if (res) {
        saveAs(res, _File.request_no + '_' + _File.CartonNo + fileExt);
      }
    });
  }
}