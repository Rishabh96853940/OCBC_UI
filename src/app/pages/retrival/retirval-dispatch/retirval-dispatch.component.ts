import { Globalconstants } from "./../../../Helper/globalconstants";
import { OnlineExamServiceService } from "./../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormControl, FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { HttpEventType, HttpClient } from '@angular/common/http';
import swal from "sweetalert2";
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Router } from "@angular/router";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: 'app-retirval-dispatch',
  templateUrl: './retirval-dispatch.component.html',
  styleUrls: ['./retirval-dispatch.component.scss']
})
export class RetirvalDispatchComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  deliverytypeforaccess: any;
  DispatchList: any;
  _FilteredList: any;
  _HeaderList: any;
  AddPODEntryForm: FormGroup;
  AddSoftCopyForm: FormGroup;
  submitted = false;
  Reset = false;
  //_UserList: any;
  sMsg: string = "";
  //RoleList: any;
  _IndexPendingListFile: any;
  _FilteredListFile: any;
  _FileNoList: any;
  PODEntry: any;
  first = 0;
  firstAccess = 0;
  firstDispatch = 0;
  rows = 10;
  myFiles: string[] = [];
  showBulkRequest: boolean = false;
  // _ColNameList = ["lanno","pod_number", "request_no","request_type","request_reason","courier_name","request_date","file_status","status","file_barcode_status","property_barcode_status"];

  _ColNameList = ["lanno", "request_no", "request_type", "request_reason", "file_barcode"];

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    public toastr: ToastrService,
    public router: Router,
    private httpService: HttpClient,
  ) { }

  ngOnInit() {
    this.AddPODEntryForm = this.formBuilder.group({
      request_no: new FormControl('', [Validators.required]),
      lanno: new FormControl('', [Validators.required]),
      pod_number: new FormControl(''),
      courier_name: new FormControl(''),
      dispatch_address: new FormControl(''),
      workorder_number: new FormControl('', [Validators.required]),
      request_number: ['', Validators.required],
      CreatedBy: localStorage.getItem('UserID'),
      User_Token: localStorage.getItem('User_Token'),
      item_number: ['', Validators.required],
      upload_data: [],
      page_count: [],
    });

    this.AddSoftCopyForm = this.formBuilder.group({
      request_no: new FormControl('', [Validators.required]),
      CreatedBy: localStorage.getItem('UserID'),
      User_Token: localStorage.getItem('User_Token'),
    });

    this.getRetrievalDispatchList();
    this.PODEntry = "Create POD Entry";
  }

 

  get f() {
    return this.AddPODEntryForm.controls;
  }
  entriesChange($event) {
    this.entries = $event.target.value;
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  onActivate(event) {
    this.activeRow = event.row;
  }

  getRetrievalDispatchList() {

    const apiUrl = this._global.baseAPIUrl + 'Retrival/getRetrivalDispatch?USERId=' + localStorage.getItem('UserID') + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this.DispatchList = data;
      this._FilteredList = data;
      this.prepareTableData(this.DispatchList, this._FilteredList);
    });
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  paginateAccess(e) {
    this.firstAccess = e.firstAccess;
    this.rows = e.rows;
  }

  paginateDispatch(e) {
    this.firstDispatch = e.firstDispatch;
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
      { field: 'request_number', header: 'REQUEST NUMBER', index: 3 },
      { field: 'retrival_type', header: 'REQUEST TYPE', index: 3 },
      { field: 'delivery_type', header: 'DELIVERY TYPE', index: 3 },
      { field: 'FileCount', header: 'FILE COUNT', index: 3 },
      { field: 'partically_dispatch_count', header: 'Partically Dispatch Count', index: 3 },
      { field: 'item_code', header: 'ITEM CODE', index: 3 },
      { field: 'dispatch_address', header: 'DISPATCH ADDRESS', index: 2 },
      { field: 'request_by', header: 'REQUEST BY', index: 3 },
      { field: 'request_date', header: 'REQUEST DATE', index: 3 },
      { field: 'approval_by', header: 'APPROVED BY', index: 3 },
      { field: 'approval_date', header: 'APPROVED DATE', index: 3 },
      { field: 'status', header: 'STATUS', index: 3 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        'srNo': parseInt(index + 1),
        'status': el.status,
        'request_by': el.request_by,
        'request_date': el.request_date,
        'item_code': el.item_code,
        'request_number': el.request_number,
        'dispatch_address': el.dispatch_address,
        'retrival_type': el.retrival_type,
        'delivery_type': el.delivery_type,
        'FileCount': el.FileCount,
        'approval_by': el.approval_by,
        'approval_date': el.approval_date,
        'partically_dispatch_count': el.partically_dispatch_count
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
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


  OnReset() {
    this.Reset = true;
    this.PODEntry = "Create POD Entry";
    this.AddPODEntryForm.patchValue({
      pod_number: '',
      courier_name: '',
      workorder_number: '',
      item_number: '',
      page_count: '',
      upload_data: ''
    })
  }

 triggerFileInput() {
  document.getElementById('csvReader')?.click();
}

toggleBulkRequest() {
  this.showBulkRequest = !this.showBulkRequest;  
}

uploadListenerDispatch(event: Event): void {
  const fileInput = event.target as HTMLInputElement;
  const file = fileInput?.files?.[0]; 
  
  if (file) {
    document.querySelector('.selected-file-name')!.textContent =  `Selected file: ${file.name}`;
    
    if (this.isValidCSVFile(file)) {
      const reader = new FileReader();
      
      reader.readAsText(file);
      
      reader.onload = () => {
        const csvData = reader.result as string;
        const csvRecordsArray = csvData.split(/\r\n|\n/);

        const headersRow = this.getHeaderArray(csvRecordsArray);

        this._CSVData = csvRecordsArray;
        this._IndexList = csvRecordsArray;
        
        console.log(this._CSVData);
        
        const validFile = this.getDisplayNames(csvRecordsArray);
        
        if (!validFile) {
          console.log('Invalid CSV file format');
          this.fileReset(); 
        } else {
          this.records = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
          
          console.log(this.records); 
          
          (<HTMLInputElement>document.getElementById('csvReader')).value = '';
        }
      };
      
      reader.onerror = () => {
        console.error('Error occurred while reading the file');
      };
    } else {
      console.error('Please select a valid CSV file.');
      this.fileReset(); 
    }
  }

  this._FilteredList = this.records;
}



  OnClose() {
    this.modalService.hide(1);
  }
  onSubmit1() {
    this.exportToExcel(this.formattedFileData, "Dispatch_Report")
  }
  onSubmit(validate: string) {
    this.submitted = true;
    if (!this.validation(validate)) {
      return;
    }

    let _Filelist = "";
    for (let j = 0; j < this.selectedRows.length; j++) {
      if (j == 0) {
        _Filelist = this.selectedRows[j]
      }
      else {
        _Filelist = _Filelist + ',' + this.selectedRows[j]
      }

    }
    this.AddPODEntryForm.get('item_number').setValue(_Filelist);
    const apiUrl = this._global.baseAPIUrl + "Retrival/podentry";
    this._onlineExamService.postData(this.AddPODEntryForm.value, apiUrl)
      .subscribe((data) => {
        if (data !== null) {
          this.ShowMessage("Record save Successfully..");
          this.modalService.hide(1);
          this.OnReset();
          this.getRetrievalDispatchList();
          // this.getRetrievalDispatch(this.AddPODEntryForm.get('request_number').value);
        } else {
          //alert("User already exists.");
        }
      });
  }
  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }
  _CSVData: any
  _IndexList: any
  getHeaderArray(csvRecordsArr: any) {
    var headers;
    // headers ="NewCBSAccountNo,ApplicationNo,CBSCUSTIC,Team,HandliedBy,ProductCode,Product,ProductDescription,JCCode,JCName,Zone,CustomerName,DBDate,FinalRemarks,DisbursedMonth";
    headers = ['item_number'];
    // console.log("headers_1",headers);
    //  // let headerArray = [];
    // for (let j = 0; j < headers.length; j++) {
    //   headerArray.push(headers[j]);
    // }

    return headers;


  }
  getDisplayNames(csvRecordsArr: any) {
    //  console.log("csvRecordsArr",csvRecordsArr);

    let headers = (<string>csvRecordsArr[0]).split(',');
    let headerArray = [];
    if (headers.length != 1) {
      var msg = 'Invalid No. of Column Expected :- ' + 1;
      this.ShowErrormessage(msg);

      return false;
    }
    console.log(this._CSVData)
    this._ColNameList[0] = "item_number";
    this.dump_upload_data = this._CSVData
    //   console.log("daadadadad",this._CSVData)
    return true;
  }

  records: any
  fileReset() {
    //this.csvReader.nativeElement.value = "";  
    this.records = [];
  }





  uploadListener($event: any): void {

    let text = [];
    let files = $event.srcElement.files;

    if (this.isValidCSVFile(files[0])) {

      let input = $event.target;
      let reader = new FileReader();
      // console.log(input.files[0]);
      reader.readAsText(input.files[0]);
      $(".selected-file-name").html(input.files[0].name);
      reader.onload = () => {
        let csvData = reader.result;
        let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);

        let headersRow = this.getHeaderArray(csvRecordsArray);

        this._CSVData = csvRecordsArray;
        this._IndexList = csvRecordsArray;
        console.log(this._CSVData)
        // alert(headersRow);
        // alert(this._ColNameList);
        //let ColName = 
        let validFile = this.getDisplayNames(csvRecordsArray);
        if (validFile == false) {
          //  console.log('Not Valid File', csvRecordsArray);
          this.fileReset();
        } else {

          this.records = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);

          // console.log("datasadad", this.records);

          //  console.log(this.records);
          //console.log("_FilteredList",this._FilteredList);

          // this.prepareTableDataForCSV(this._FilteredList);         

          (<HTMLInputElement>document.getElementById('csvReader')).value = '';
          //  console.log('Records', this._FilteredList);
        }


      };

      reader.onerror = function () {
        // console.log('error is occurred while reading file!');
      };

    } else {
      // this.toastr.show(
      //   '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error!</span> <span data-notify="message">Please Select A Valid CSV File And Template</span></div>',
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
      this.fileReset();
    }
    this.isDumpUploaded = true
    //this.dump_upload_data = this.records
  }
  dump_upload_data: any;
  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    //console.log("dad",csvRecordsArray,headerLength)
    let csvArr = [];

    for (let i = 1; i < csvRecordsArray.length; i++) {
      let curruntRecord = (<string>csvRecordsArray[i]).split(',');
      if (curruntRecord.length == headerLength) {
        const single = []
        for (let i = 0; i < this._ColNameList.length; i++) {
          single.push(curruntRecord[i].toString().trim())
        }
        csvArr.push(single)
      }
    }
    return csvArr;
  }
  DUMPFORMAT() {

    const filename = 'Upload_Format_CSV';
    let csvData = "item_number";

    // let csvData = "AccountNo,AppNo,CRN,URN,DBDate,DBMonth,DBYear,ProductCode,ProductType,ProductName,COD_OFFICR_ID,CustomerName,BranchCode,BranchName,Zone,ClosedDate";    
    //console.log(csvData)
    let blob = new Blob(['\ufeff' + csvData], {
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
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);


  }
  UPLOADDUMP() {
    this.submitted = true;
    if (!this.validationfordump()) {
      return;
    }
    this.AddPODEntryForm.controls['upload_data'].setValue(this.dump_upload_data)
    console.log(this.AddPODEntryForm.value)
    const apiUrl = this._global.baseAPIUrl + "Retrival/podentrydump";
    this._onlineExamService
      .postData(this.AddPODEntryForm.value, apiUrl)
      .subscribe((data) => {
        if (data != null) {
          this.downloadFilestatus(data);
          this.ShowMessage("Record save Successfully..");
          this.modalService.hide(1);
          this.OnReset();
          this.getRetrievalDispatchList();
          this.showBulkRequest = false;

        } else {
       
        }
      });


  }


  openPopup(BranchFormPopup:any){
    // if(this.AddPODEntryForm.controls['item_code'].value){
      this.modalRef =this.modalService.show(BranchFormPopup)
  //   }
  //   else{
  // this.ShowErrormessage("Please Item Code ")
  //   }
  }
  downloadFilestatus(strmsg: any) {
    const filename = 'Record Dipatch Upload Status';

    // let csvData = "FileNo,";    
    //console.log(csvData)
    let blob = new Blob(['\ufeff' + strmsg], {
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
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
    //}
  }
  //---
  addPODEntry(template: TemplateRef<any>, objlist: any) {
    this.modalRef = this.modalService.show(template);
    this.AddPODEntryForm.patchValue({
      request_no: objlist.request_no,
      pod_number: objlist.pod_number,
      lanno: objlist.lanno,
      courier_name: objlist.Courier_id,
    })
    this.PODEntry = "Create POD Entry";
  }

  viewDispatchFile(template: TemplateRef<any>, objlist: any) {
    this.modalRef = this.modalService.show(template);
  }

  ShowErrormessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error ! </span> <span data-notify="message"> ' + data + ' </span></div>', "", {
      timeOut: 3000,
      closeButton: true,
      enableHtml: true,
      tapToDismiss: false,
      titleClass: "alert-title",
      positionClass: "toast-top-center",
      toastClass:
        "ngx-toastr alert alert-dismissible alert-danger alert-notify"
    });
  }

  ShowMessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success ! </span> <span data-notify="message"> ' + data + ' </span></div>',
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
      });
  }

  sendDispatch(template: TemplateRef<any>, row: any) {
    this.modalRef = this.modalService.show(template);
    this.AddPODEntryForm.patchValue({
      request_number: row.request_number,
      dispatch_address: row.dispatch_address
    })
    this.deliverytypeforaccess = row.delivery_type;
    this.getRetrievalDispatch(row.request_number);
    this.OnReset();
    this.showBulkRequest = false;
  }

  getRetrievalDispatch(request_no: string) {
    const apiUrl = this._global.baseAPIUrl + 'Retrival/getRetrivalDispatchByRequestno?USERId=' + localStorage.getItem('UserID') + '&request_no=' + request_no + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._IndexPendingListFile = data;
      this._FilteredListFile = data;
      this.BindFileDetails(this._IndexPendingListFile, this._FilteredListFile);

    });
  }


  downloadFileDispatchBulk() {
    const filename = 'Bulk_Dipatch_UploadFormat';
    let csvData ="item_number";
     
   // let csvData = "AccountNo,AppNo,CRN,URN,DBDate,DBMonth,DBYear,ProductCode,ProductType,ProductName,COD_OFFICR_ID,CustomerName,BranchCode,BranchName,Zone,ClosedDate";    
    //console.log(csvData)
    let blob = new Blob(['\ufeff' + csvData], {
      type: 'text/csv;charset=utf-8;'
    });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = -1;
  
    if (isSafariBrowser) {
      dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  
  }  

  downloadlanfile(row: any) {

    const apiUrl = this._global.baseAPIUrl + 'Retrival/getRetrivalDispatchByRequestno?USERId=' + localStorage.getItem('UserID') + '&request_no=' + row.request_no + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._FilteredListFile = data;
      this.downloadFile(row.request_no);
    });
  }

  formattedFileData: any = [];
  headerListFile: any;
  immutableFormattedDataFile: any;
  BindFileDetails(tableData, headerList) {
    let formattedFileData = [];
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'pod_number', header: 'POD NO', index: 3 },
      { field: 'request_number', header: 'REQ NO', index: 3 },
      { field: 'retrival_type', header: 'RETRIEVALTYPE', index: 3 },
      { field: 'delivery_type', header: 'DELIVERY TYPE', index: 3 },
      { field: 'workorder_number', header: 'WORKORDER NUMBER', index: 3 },
      { field: 'item_code', header: 'ITEM CODE', index: 2 },
      { field: 'item_number', header: 'ITEM NUMBER', index: 2 },
      { field: 'courier_name', header: 'COURIER NAME', index: 2 },
      { field: 'file_status', header: 'FILE STATUS', index: 3 },
      { field: 'page_count', header: 'PAGE COUNT', index: 5 },
      { field: 'retrival_remark', header: 'RETRIEVAL REMARK', index: 3 },
    ];

    tableData.forEach((el, index) => {
      formattedFileData.push({
        'srNo': parseInt(index + 1),
        'pod_number': el?.pod_number,
        'request_number': el?.request_number,
        'delivery_type': el?.delivery_type,
        'retrival_type': el?.retrival_type,
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
      });

    });
    this.headerListFile = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedFileData));
    this.formattedFileData = formattedFileData;
    this.loading = false;
  }
  exportToExcel(data: any[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, fileName + '.xlsx');
  }


  searchTableDispatch($event) {
    console.log($event.target.value);

    let val = $event.target.value;
    if (val == '') {
      this.formattedFileData = this.immutableFormattedData;
    } else {
      let filteredArr = [];
      const strArr = val.split(',');
      this.formattedFileData = this.immutableFormattedData.filter(function (d) {
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
      this.formattedFileData = filteredArr;
    }
  }
  selectAllRows = false;
  selectAllRow(e) {
    this.selectedRows = [];
    this.selectedRowsForMetadata = [];
    if (e.checked) {
      this.selectAllRows = true;
      this.formattedFileData.forEach((el, index) => {
        if (index >= this.firstAccess && index < this.firstAccess + this.rows) {
          this.selectedRows.push(el.item_number);
          this.selectedRowsForMetadata.push(el.item_number);
          el.selected = true;
        }
      })
    } else {
      this.selectAllRows = false;
      this.selectedRows = [];
      this.formattedFileData.filter(el => el.selected).forEach(element => {
        element.selected = false;
      });
    }
    console.log("ES-", this.selectedRows);
    let item_number = ''
    for (let k = 0; k < this.formattedFileData.length; k++) {
      if (this.formattedFileData[k].selected) {
        if (item_number.length != 0) {
          item_number = item_number + "," + this.formattedFileData[k].item_number
        }
        else {
          item_number = this.formattedFileData[k].item_number;
        }
      }
    }

    this.AddPODEntryForm.controls['item_number'].setValue(item_number)
  }
  selectAllRowDispatch(e) {
    this.selectedRows = [];
    this.selectedRowsForMetadata = [];
    if (e.checked) {
      this.selectAllRows = true;
      this.formattedFileData.forEach((el, index) => {
        if (index >= this.firstDispatch && index < this.firstDispatch + this.rows) {
          this.selectedRows.push(el.item_number);
          this.selectedRowsForMetadata.push(el.item_number);
          el.selected = true;
        }
      })
    } else {
      this.selectAllRows = false;
      this.selectedRows = [];
      this.formattedFileData.filter(el => el.selected).forEach(element => {
        element.selected = false;
      });
    }
    let item_number = ''
    for (let k = 0; k < this.formattedFileData.length; k++) {
      if (this.formattedFileData[k].selected) {
        if (item_number.length != 0) {
          item_number = item_number + "," + this.formattedFileData[k].item_number
        }
        else {
          item_number = this.formattedFileData[k].item_number;
        }
      }
    }

    this.AddPODEntryForm.controls['item_number'].setValue(item_number)
  }

  selectedRows = [];
  selectedRowsForMetadata = [];
  selectRow(e, row) {
    if (row.file_status != "File dispatch") {
      this.selectAllRows = false;
      e.originalEvent.stopPropagation();
      if (e.checked) {
        this.selectedRows.push(row.item_number);
      } else {
        this.selectAllRows = false;
        var index = this.selectedRows.indexOf(row.item_number);
        this.selectedRows.splice(index, 1);
      }
    }
    else {
      this.ShowErrormessage("File already dispatched.");

    }

  }
  isDumpUploaded = false;
  validation(MSG: string) {
    if ((this.selectedRows == null || this.selectedRows.length <= 0) && !this.isDumpUploaded) {
      this.ShowErrormessage("please select at least one file to dispatch");
      return false;
    }
    if (this.AddPODEntryForm.get('pod_number').value == "" && MSG == 'Normal') {
      this.ShowErrormessage("Please Enter POD Number");
      return false;
    }
    if (this.AddPODEntryForm.get('pod_number').value == "" && MSG == 'Access') {
      this.ShowErrormessage("Please Enter EmailID");
      return false;
    }
    // if (this.AddPODEntryForm.get('courier_name').value =="" )
    // {
    //         this.ShowErrormessage("Please select  courier_name");
    //           return false;
    // }
    return true;
  }
  validationfordump() {
    if (this._CSVData == null || this._CSVData == '') {
      this.ShowErrormessage("Please Select CSV File");
      return false;
    }
    if (this.AddPODEntryForm.get('pod_number').value == "") {
      this.ShowErrormessage("Please Enter pod_number");
      return false;
    }
    // if (this.AddPODEntryForm.get('courier_name').value =="" )
    // {
    //         this.ShowErrormessage("Please select  courier_name");
    //           return false;
    // }
    return true;
  }



  uploadDispatch(){
    this.AddPODEntryForm.patchValue({
      CSVData: this._CSVData
    })
    console.log(this.AddPODEntryForm.value)
    const apiUrl = this._global.baseAPIUrl + "Retrival/CreateBulkUploadForDispatch";
    this._onlineExamService
      .postData(this.AddPODEntryForm.value, apiUrl)
      // .pipe(first())
      .subscribe((data) => {
  console.log(data)
  this.downloadFilestatus(data);
  //this.GetRequestNo()
  // this.GetTableData();
  
      });
      this.modalRef.hide();
  }



  downloadFileDispatch() {
    const filename = 'Upload_Format_CSV';
    let csvData ="item_number";
     
   // let csvData = "AccountNo,AppNo,CRN,URN,DBDate,DBMonth,DBYear,ProductCode,ProductType,ProductName,COD_OFFICR_ID,CustomerName,BranchCode,BranchName,Zone,ClosedDate";    
    //console.log(csvData)
    let blob = new Blob(['\ufeff' + csvData], {
      type: 'text/csv;charset=utf-8;'
    });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = -1;
  
    if (isSafariBrowser) {
      dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  
  }  





  downloadFile(request_no: any) {
    this.GetHeaderNames()
    let csvData = this._HeaderList;
    var csvDatas = csvData.replace("null", "");

    // console.log(csvData) 
    if (this._FilteredListFile.length > 0) {
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
      dwldLink.setAttribute("download", "RR-" + request_no + ".csv");
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

  GetHeaderNames() {
    this._HeaderList = "";
    for (let j = 0; j < this._ColNameList.length; j++) {

      this._HeaderList += this._ColNameList[j] + ((j <= this._ColNameList.length - 2) ? ',' : '');
      // headerArray.push(headers[j]);  
    }
    this._HeaderList += '\n'
    this._FilteredListFile.forEach(stat => {
      for (let j = 0; j < this._ColNameList.length; j++) {
        this._HeaderList += (stat[this._ColNameList[j]]) + ((j <= this._ColNameList.length - 2) ? ',' : '');
        // headerArray.push(headers[j]);  
      }
      this._HeaderList += '\n'
    });


  }

  UplaodSoftcopyPopup(template: TemplateRef<any>, row: any) {

    if (row.request_type == "Scan Copy") {
      this.modalRef = this.modalService.show(template);
      this.AddSoftCopyForm.patchValue({
        request_no: row.request_no,
      })
      this.getRetrievalDispatchSoftCopy(row.request_no);
    }
    else {
      this.ShowErrormessage("Request type should be scan copy");
    }


  }

  getFileDetails(e) {
    this.myFiles = [];
    for (var i = 0; i < e.target.files.length; i++) {
      this.myFiles.push(e.target.files[i]);
    }
    let selectedFileNames = '';
    this.myFiles.forEach(el => {
      selectedFileNames += el['name'] + '<br />';
    })
    $(".selected-file-name").html(selectedFileNames);
  }

  onUpdateRequestNo() {
    this.submitted = true;
    const frmData = new FormData();
    const that = this;
    for (var i = 0; i < this.myFiles.length; i++) {
      frmData.append("fileUpload", this.myFiles[i]);
    }
    frmData.append('request_no', this.AddSoftCopyForm.get('request_no').value);
    frmData.append('UserID', localStorage.getItem('UserID'));

    const apiUrl = this._global.baseAPIUrl + 'Retrival/scanCopyUpload';
    this.httpService.post(apiUrl, frmData).subscribe(data => {

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
      this.getRetrievalDispatchList();

    });
  }

  formattedSoftcopyFileData: any = [];
  headerListSoftcopyFile: any;
  immutableFormattedDataSoftCopyFile: any;
  BindSoftCopyFileDetails(tableData, headerList) {
    let formattedSoftcopyFileData = [];
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'lanno', header: 'LAN NO', index: 3 },
      { field: 'request_no', header: 'REQUEST NO', index: 3 },
      { field: 'request_type', header: 'REQUEST TYPE', index: 3 },
      { field: 'request_reason', header: 'REQUEST REASON', index: 3 },
      { field: 'file_barcode', header: 'FILE BARCODE', index: 3 },
      { field: 'file_status', header: 'FILE STATUS', index: 3 },
      { field: 'file_barcode_status', header: 'STATUS', index: 3 },
    ];



    tableData.forEach((el, index) => {
      formattedSoftcopyFileData.push({
        'srNo': parseInt(index + 1),
        'lanno': el.lanno,
        'request_no': el.request_no,
        'file_barcode_status': el.file_barcode_status,
        'property_barcode_status': el.property_barcode_status,
        'request_type': el.request_type,
        'request_reason': el.request_reason,
        'status': el.status,
        'file_status': el.file_status,
        'Courier_id': el.Courier_id,
        'property_barcode': el.property_barcode,
        'file_barcode': el.file_barcode,

      });

    });
    this.headerListSoftcopyFile = tableHeader;
    this.immutableFormattedDataSoftCopyFile = JSON.parse(JSON.stringify(formattedSoftcopyFileData));
    this.formattedSoftcopyFileData = formattedSoftcopyFileData;
    this.loading = false;
  }

  getRetrievalDispatchSoftCopy(request_no: string) {

    const apiUrl = this._global.baseAPIUrl + 'Retrival/getRetrivalDispatchByRequestno?USERId=' + localStorage.getItem('UserID') + '&request_no=' + request_no + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._IndexPendingListFile = data;
      this._FilteredListFile = data;
      this.BindSoftCopyFileDetails(this._IndexPendingListFile, this._FilteredListFile);

    });
  }

  downloadAttachment(_File: any) {
    //console.log("_File",_File);

    const fileExt = _File.Attachment.substring(_File.Attachment.lastIndexOf('.'), _File.Attachment.length);
    const apiUrl = this._global.baseAPIUrl + 'Retrival/DownlaodAttachment?ID=' + localStorage.getItem('UserID') + '&file_path=' + _File.Attachment + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.downloadDoc(apiUrl).subscribe(res => {
      if (res) {

        //   console.log("res",res);
        saveAs(res, _File.request_no + fileExt);
      }
    });

  }

}