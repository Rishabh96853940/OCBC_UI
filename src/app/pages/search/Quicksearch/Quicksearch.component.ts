import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from '@angular/router';
import { saveAs } from 'file-saver';
import swal from "sweetalert2";
// import { Listboxclass } from '../../../Helper/Listboxclass';
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-Quicksearch",
  templateUrl: "Quicksearch.component.html",
  styleUrls: ["Quicksearch.component.css"]
})
export class QuicksearchComponent implements OnInit {

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

  //_ColNameList:any;
  _IndexList: any;
  currentPage: number = 0;
  PODForm: FormGroup;
  ContentSearchForm: FormGroup;
  submitted = false;

  Reset = false;
  sMsg: string = '';

  _IndexPendingList: any;
  bsValue = new Date();

  _ColNameList = ["BatchID", "documents", "CartonNo", "DepartmentName", "DocumentDetails",  "status","ItemStatus","ItemLcoation","warehouseName","ReteionPeriod","ExpireDate"];

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
DeptID : localStorage.getItem('DeptID'),

    });
    
    this.PODForm = this.formBuilder.group({
      pod_number: ['', Validators.required],
      Courier_id: ['', Validators.required],
      request_no: ['', Validators.required],
      lanno: ['', Validators.required],
      CourierName: ['', Validators.required],
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID'),

    });

    this.GetDumpdata();
    this.ContentSearchForm.controls['SearchBy'].setValue("0");
  }

  returnToListView() {
    this.first = this.currentPage * this.rows;
  }

  openLanDetailsQuickSearch(template: TemplateRef<any>, LanNo: string) {
    debugger
    if (!LanNo) {
      console.error("LAN number is missing or undefined!");
      return;
    }
  
    const user_Token = localStorage.getItem('User_Token');
    const USERId = localStorage.getItem('UserID');

    if (!user_Token || !USERId) {
      console.error("User Token or User ID is missing!");
      return;
    }
  
    const apiUrl = `${this._global.baseAPIUrl}Retrival/GetLanDetailsQuickSearch?USERId=${USERId}&LanNo=${LanNo}&user_Token=${user_Token}`;
   this._onlineExamService.getAllData(apiUrl).subscribe({
      next: (data) => {
        this.prepareTableDataForLanDetails(data);
        this.modalRef = this.modalService.show(template, {
          backdrop: 'static',
          keyboard: false
        });
      },
      error: (error) => {
        console.error("Error fetching LAN details:", error);
      }
    });
}
isDataAvailable: boolean = true; // Default value

checkFileInsertionData(lanNo: string) {
  if (!lanNo) {
    console.error("LAN number is missing or undefined!");
    return;
  }

  const user_Token = localStorage.getItem('User_Token');
  if (!user_Token) {
    console.error("User Token is missing!");
    return;
  }

  const apiUrl = `${this._global.baseAPIUrl}Retrival/checkFileInsertionData?lanNO=${lanNo}&user_Token=${user_Token}`;
  
  this._onlineExamService.getAllData(apiUrl).subscribe({
    next: (data) => {
      if (data) {
        this.isDataAvailable = false; 
      } else {
        this.isDataAvailable = true; 
      }
    },
    error: (error) => {
      console.error("Error fetching file insertion data:", error);
      this.isDataAvailable = true; 
    }
  });
}

  

  formattedDataLanDetails: any = [];
  headerListLan: any;
  immutableFormattedDataLan: any;
  loadingLan: boolean = true;
  prepareTableDataForLanDetails(tableData: any) {
    // Ensure tableData is an array
    if (!Array.isArray(tableData)) {
      console.error("Expected an array but received:", tableData);
      tableData = []; // Set default empty array to prevent errors
    }
 
    let formattedDataLanDetails = [];
 
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'pickup_request_no', header: 'PICKUP REQUEST NO', index: 2 },
      { field: 'lan_no', header: 'LAN NO', index: 3 },
      { field: 'documents', header: 'DOCUMENT TYPE', index: 4 },
      { field: 'service_type', header: 'SERVICE TYPE', index: 5 },
      { field: 'inventory_insertion_date', header: 'INVENTORY INSERTION DATE', index: 6 },
      { field: 'inventory_insertion_by', header: 'INVENTORY INSERTION BY', index: 7 },
      { field: 'customer_name', header: 'Customer Name', index: 8 },
      { field: 'branch_name', header: 'BRANCH NAME', index: 9 },
    ];
 
    tableData.forEach((el, index) => {
      formattedDataLanDetails.push({
        'srNo': index + 1,
        'pickup_request_no': el.pickup_request_no,
        'lan_no': el.lan_no,
        'documents': el.documents,
        'service_type': el.service_type,
        'inventory_insertion_date': el.inventory_insertion_date,
        'inventory_insertion_by': el.name,
        'customer_name': el.customer_name,
        'branch_name': el.branch_name
      });
    });
 
    this.headerListLan = tableHeader;
    this.immutableFormattedDataLan = JSON.parse(JSON.stringify(formattedDataLanDetails));
    this.formattedDataLanDetails = formattedDataLanDetails;
    this.loadingLan = false;
  }


  closeModal() {
    // Logic to close the modal
    this.modalRef.hide();
    this.returnToListView();
  }

  GetDumpdata() {

    const apiUrl = this._global.baseAPIUrl + 'Search/GetDumpdataSearch?USERId=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token');
    debugger
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      console.log(data);
      this._IndexPendingList = data;
      this._FilteredList = data;
      // this._ColNameList = data;
      debugger
      this.prepareTableData(this._FilteredList, this._IndexPendingList);

    });
  }





  GetFilterSearch() {

     debugger
    const apiUrl = this._global.baseAPIUrl + 'Search/SearchRecordsByFilter?USERId=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token') + '&FileNo=' + this.ContentSearchForm.get('FileNo').value + '&SearchBy=' + this.ContentSearchForm.get('SearchBy').value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._IndexPendingList = data;
      this._FilteredList = data

      this.prepareTableData(this._FilteredList, this._IndexPendingList);

    });
  }


  OnReset() {
    this.Reset = true;
    this.ContentSearchForm = this.formBuilder.group({
      SearchBy: ["0", Validators.required],
      FileNo: ['', Validators.required],
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID'),

    });
    this.GetDumpdata()

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

    // check if all rows are individually selected
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

  downloadTableData() {
    const csvData = this.convertToCSV(this.formattedDataLanDetails);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = 'LanDetails.csv';
    a.click();
  }

  convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
 
    const headers = Object.keys(data[0]).join(',') + '\n';
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
 
    return headers + rows;
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
    debugger
    let formattedData = [];
debugger
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'BatchID', header: 'BATCH ID', index: 2 },
      { field: 'CartonNo', header: 'CARTON NUMBER', index: 3 },
      { field: 'DepartmentName', header: 'DEPARTMENT', index: 3 },
      { field: 'documents', header: 'DOCUMENT TYPE', index: 2 },
      { field: 'DocumentDetails', header: 'DETAIL DOCUMENT TYPE', index: 2 },
      { field: 'status', header: 'FILE STATUS', index: 2 },
      // { field: 'disb_date', header: 'DISB DATE', index: 2 },
      // { field: 'created_by', header: 'INWARD BY', index: 4 },
      // { field: 'created_date', header: 'INWARD DATE', index: 3 },
       { field: 'ItemStatus', header: 'ITEM STATUS', index: 2 },
       { field: 'warehouseName', header: 'WAREHOUSE NAME', index: 2 },
                     { field: 'ItemLcoation', header: 'ITEM LOCATION', index: 2 },

       { field: 'ReteionPeriod', header: 'RETENTION PERIOD', index: 2 },
              { field: 'ExpireDate', header: 'EXPIRY DATE', index: 2 },



    ];
    // console.log("this.formattedData", tableData);
    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'BatchID': el.BatchID,
        'documents': el.documents,
        'retrival_type': el.retrival_type,
        'CartonNo': el.CartonNo,
        'DepartmentName': el.DepartmentName,
        'created_by': el.created_by,
        "created_date": el.created_date,
        'customer_name': el.customer_name,
        'status': el.status,
        'DocumentDetails': el.DocumentDetails,
        'disb_date': el.disb_date,
        // 'Status': el.Status,
        'ItemStatus': el.ItemStatus,
                'warehouseName': el.warehouseName,

        'ItemLcoation': el.ItemLcoation,
        'ReteionPeriod':el.ReteionPeriod,
        'ExpireDate':el.ExpireDate

      });

    });
    debugger
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;


    //    console.log(this.formattedData);

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



  GetHeaderNames() {
    this._HeaderList = "";
    for (let j = 0; j < this._ColNameList.length; j++) {

      this._HeaderList += this._ColNameList[j] + ((j <= this._ColNameList.length - 2) ? ',' : '');
      // headerArray.push(headers[j]);  
    }
    this._HeaderList += '\n'
    this._FilteredList.forEach(stat => {
      for (let j = 0; j < this._ColNameList.length; j++) {
        this._HeaderList += (stat[this._ColNameList[j]]) + ((j <= this._ColNameList.length - 2) ? ',' : '');
        // headerArray.push(headers[j]);  
      }
      this._HeaderList += '\n'
    });


  }

  downloadFile() {
    this.GetHeaderNames()
    let csvData = this._HeaderList;
    var csvDatas = csvData.replace("null", "");

    // console.log(csvData) 
    if (this._FilteredList.length > 0) {
      let blob = new Blob(['\ufeff' + csvDatas], {
        type: 'text/csv;charset=utf-8;'
      });
      let dwldLink = document.createElement("a");
      let url = URL.createObjectURL(blob);
      let isSafariBrowser = -1;
      // let isSafariBrowser = navigator.userAgent.indexOf( 'Safari') != -1 & amp; & amp; 
      // navigator.userAgent.indexOf('Chrome') == -1; 

      //if Safari open in new window to save file with random filename. 
      if (isSafariBrowser) {
        dwldLink.setAttribute("target", "_blank");
      }
      dwldLink.setAttribute("href", url);
      dwldLink.setAttribute("download", "QuickSearch_Data" + ".csv");
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
      lanno: Row.lanno,
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
      // .pipe(first())
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



        // this.modalRef
        this.modalRef.hide();
        that.GetDumpdata();
        //this.OnReset();      
      });
    // }

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

    if (_File.lc_filepath == null || _File.lc_filepath == "" || _File.lc_filepath.length == 0) {
      this.showmessage("LC Attachment not available");
      return;
    }
    const fileExt = _File.lc_filepath.substring(_File.lc_filepath.lastIndexOf('.'), _File.lc_filepath.length);
    const apiUrl = this._global.baseAPIUrl + 'Retrival/DownlaodAttachment?ID=' + localStorage.getItem('UserID') + '&file_path=' + _File.lc_filepath + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.downloadDoc(apiUrl).subscribe(res => {
      if (res) {

        //   console.log("res",res);
        saveAs(res, _File.lanno + fileExt);
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

        //   console.log("res",res);
        saveAs(res, _File.request_no + '_' + _File.lanno + fileExt);
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

        //   console.log("res",res);
        saveAs(res, _File.request_no + '_' + _File.lanno + fileExt);
      }
    });

  }
}