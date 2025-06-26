import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, AbstractControl, ValidationErrors } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';

import { ToastrService } from "ngx-toastr";
import swal from "sweetalert2";
import { Location } from "@angular/common";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

@Component({
  selector: 'app-retrieval-request-form',
  templateUrl: './retrieval-request-form.component.html',
  styleUrls: ['./retrieval-request-form.component.scss']
})
export class RetrievalRequestFormComponent implements OnInit {

  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  _FilteredList: any;
  AddFileInwardForm: FormGroup;
  submitted = false;
  submitteds = false;
  Reset = false;
  Isreadonly = false;
  //_UserList: any;
  sMsg: string = "";
  _message = "";
  _UserID: any;
  document_typeList: any;
  User: any;
  first = 0;
  rows = 10;
  class: any;
  myFiles: string[] = [];
  _FileDetails: string[][] = [];
  FileUPloadForm: any;
  httpService: any;
  IsreadonlyFileno = false;

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    public toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { }
  dispatchForm: FormGroup
  ngOnInit() {
    this.AddFileInwardForm = this.formBuilder.group({
      request_number: ['', Validators.required],
      item_code: ["", Validators.required],
      retrival_type: ["", Validators.required],
      item_number: ["", [Validators.required, this.noSpaceValidator]],
      remark: [""],
      page_count: [{ value: '', disabled: true }, Validators.required], // Initially disabled

      CSVData: [],
      delivery_type: ["", Validators.required],
      retrieval_reason: ["", Validators.required],
      User_Token: localStorage.getItem('User_Token'),
      CreatedBy: localStorage.getItem('UserID'),
    });
    this.dispatchForm = this.formBuilder.group({
      dispatch_address: ['', [Validators.required, this.noWhitespaceValidator]]
    });


    this.GetRequestNo();
    this.BindHeader(this._FilteredList);
    //  this.AddFileInwardForm.get('retrival_type')?.valueChanges.subscribe(value => {
    // //  this.onRetrivalTypeChange(value);
    // }); 

  }

  onRetrivalTypeChange(value: string): void {
    const pageCountControl = this.AddFileInwardForm.get('page_count');

    // if (value === 'Access') {
    //   pageCountControl?.enable();  // Enable if Access or Delivery is selected
    // } else {
    //   pageCountControl?.disable();  // Disable otherwise
    // }
  }

  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'noWhitespace': true };
  }

  GetDeliveryType() {
    const mainFileCountControl = this.AddFileInwardForm.get('delivery_type');
    if (this.AddFileInwardForm.get('retrival_type').value == 'Access' || this.AddFileInwardForm.get('retrival_type').value == 'Destruction') {
      mainFileCountControl.clearValidators();
    }
    else {
      mainFileCountControl.setValidators([Validators.required]);
    }

    //  if(this.AddFileInwardForm.get('retrival_type').value=='Access')
    //  {
    //     const pageCountControl = this.AddFileInwardForm.get('page_count');

    //     if (this.AddFileInwardForm.get('retrival_type').value === 'Access') {
    //       pageCountControl?.enable();  // Enable if Access or Delivery is selected
    //     } else {
    //       pageCountControl?.disable();  // Disable otherwise
    //     }
    //   } 
    mainFileCountControl.updateValueAndValidity();
  }
  GetValidItemNo(event: any) {
    //  console.log(event.target.value)
    this.AddFileInwardForm.controls['item_number'].setValue(event.target.value)
    //console.log(this.AddFileInwardForm.value)
  }

  noSpaceValidator(control: AbstractControl): ValidationErrors | null {
    const hasSpace = (control.value || '').includes(' ');
    return hasSpace ? { 'hasSpace': true } : null;
  }

  get FormControls() { return this.AddFileInwardForm.controls }
  get FormControlss() { return this.dispatchForm.controls }

  SaveData() {
    this.submitted = true;

    if (this.AddFileInwardForm.valid) {
      const apiUrl = this._global.baseAPIUrl + 'Retrival/AddRetrivalRequestDetails';
      this._onlineExamService.postData(this.AddFileInwardForm.value, apiUrl).subscribe((data: any) => {
        if (data == 'Container :- Not Exits') {
          this.ShowErrormessage('Container :- Not Exits')
        }
        else if (data === 'Record Updated Successfully') {
          this.ShowMessage("Record Updated Successfully")
        }
        else if (data === 'Please enter correct file no') {
          this.ShowErrormessage('Please enter correct file no')
        }
        else if (data === 'File Already OUT') {
          this.ShowErrormessage('File Already OUT')
        }

        else if (data === 'Already Requested By Someone') {
          this.ShowErrormessage('Already Requested By Someone')
        }
        else if (data === 'Record Saved Successfully') {
          this.ShowMessage('Record Saved Successfully')
        }
        else if (data === 'Item Already OUT') {
          this.ShowErrormessage('Item Already OUT')
        }
        else if (data === 'Enter Correct Item Number') {
          this.ShowErrormessage('Enter Correct Item Number')
        }
        else if (data === 'You can add only one branch file in one Request') {
          this.ShowErrormessage('You can add only one branch file in one Request')
        }
        else if (data === 'Please enter correct file number') {
          this.ShowErrormessage('Please enter correct File Number and Item Code')
        }



        this.submitted = false
        this.AddFileInwardForm.controls['item_number'].setValue('');
        this.AddFileInwardForm.controls['item_code'].clearValidators();
        this.AddFileInwardForm.controls['retrival_type'].clearValidators();
        this.AddFileInwardForm.controls['item_code'].setValidators([Validators.required]);
        this.AddFileInwardForm.controls['retrival_type'].setValidators([Validators.required]);
        this.AddFileInwardForm.controls['item_number'].setValidators([Validators.required, this.noSpaceValidator]);
        this.GetTableData();
      });

    }
    else {
      // alert("invalid")
    }

    this.OnReset();
  }

  GetTableData() {
    const apiUrl = this._global.baseAPIUrl + 'Retrival/GetDataByRequestNumber?&USERId=' + localStorage.getItem('UserID') + '&request_number=' + this.AddFileInwardForm.value.request_number + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      // console.log(data);
      //this._FilteredList = data;

      this._FilteredList = data;
      if (this._FilteredList.length != 0) {
        this.AddFileInwardForm.controls['retrival_type'].setValue(data[0].retrival_type)
        this.AddFileInwardForm.controls['item_code'].setValue(data[0].item_code)
        this.AddFileInwardForm.controls['delivery_type'].setValue(data[0].delivery_type)
        this.AddFileInwardForm.controls['retrieval_reason'].setValue(data[0].retrieval_reason)

      }
      this.prepareTableData(this._FilteredList, this._FilteredList)

    });
  }
  GetRequestNo() {

    const apiUrl = this._global.baseAPIUrl + 'Retrival/GetRequestNumber?&USERId=' + localStorage.getItem('UserID') + '&request_number=' + this.AddFileInwardForm.value.request_number + '&user_Token=' + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      // console.log(data)
      this.AddFileInwardForm.controls['request_number'].setValue(data[0].request_number)
      this.GetTableData();

    });
  }
  AllData: any

  AllLanData: any

  onBack() {
    this.router.navigateByUrl('/retrival/retrival-request');
  }
  openPopup(BranchFormPopup: any) {
    if (this.AddFileInwardForm.controls['item_code'].value && this.AddFileInwardForm.controls['retrival_type'].value) {
      this.modalRef = this.modalService.show(BranchFormPopup)
    }
    else {
      this.ShowErrormessage("Please Item Code and Retrival Code")
    }
  }
  downloadFile() {
    const filename = 'Retrieval_Request_BulkUpload';
    let csvData = "item_number";
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
  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }
  _CSVData: any
  _IndexList: any
  getHeaderArray(csvRecordsArr: any) {
    var headers;
    headers = ['item_number'];
    // console.log("headers_1",headers);
    //  // let headerArray = [];
    // for (let j = 0; j < headers.length; j++) {
    //   headerArray.push(headers[j]);
    // }

    return headers;


  }
  _ColNameList = [];
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
    console.log(this._CSVData)
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
    this._FilteredList = this.records
  }
  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
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
  getDocumentdetails() {
    const apiUrl = this._global.baseAPIUrl + 'BranchInward/getDocumentdetails?user_Token=' + localStorage.getItem('User_Token') + "&appl=" + this.AddFileInwardForm.get("appl").value + "&apac=" + this.AddFileInwardForm.get("apac").value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      //     console.log("Doc Type" , data);
      this.document_typeList = data;
    });

  }

  // getDocumentdetails() {  


  //   const apiUrl = this._global.baseAPIUrl + 'BranchInward/getDocumentdetails';          
  //   this._onlineExamService.postData(this.AddBranchInwardForm.value,apiUrl)

  //   .subscribe((data: {}) => {       

  //     console.log("Doc Type" , data);
  //     this.document_typeList =data;  
  //   });  
  //   } 
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
    // alert(this.type);

    // if (this.type=="Checker" )
    //{
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'request_number', header: 'REQUEST NO', index: 2 },
      { field: 'item_code', header: 'ITEM CODE', index: 2 },
      { field: 'lan_no', header: 'LAN NO', index: 2 },
      { field: 'retrival_type', header: 'RETRIVAL TYPE', index: 3 },
      { field: 'delivery_type', header: 'DELIVERY TYPE', index: 3 },
      { field: 'retrieval_reason', header: 'RETRIEVAL REASON', index: 3 },
      { field: 'item_number', header: 'ITEM NUMBER', index: 4 },
      // { field: 'page_count', header: 'PAGE COUNT', index: 5 }, 
      { field: 'created_by', header: 'REQUESTED BY', index: 3 },
      { field: 'created_date', header: 'REQUEST DATE', index: 4 },


    ];
    //  console.log("tableData",tableData);
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
        'lan_no': el.lan_no,
        //   'page_count': el.page_count, 

      });

    })
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }

  // PackCarton(){
  //   this.AddFileInwardForm.reset()
  //   this.AddFileInwardForm = this.formBuilder.group({
  //     request_id:[this.route.snapshot.params['REQ']] ,
  //     lan_no:['',Validators.required],
  //     carton_no:['',Validators.required],
  //     file_no:['',Validators.required],
  //     User_Token: localStorage.getItem('User_Token'),
  //     userid: localStorage.getItem('UserID') 
  //   });
  //   // const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/UpdatePackCarton';          
  //   // this._onlineExamService.postData(this.AddFileInwardForm.value,apiUrl)

  //   // .subscribe((data: {}) => {       
  //   //   console.log(data)
  //   //   this.toastr.show(
  //   //     '<div class="alert-text"</div> <span class="alert-title success" data-notify="title">Success ! </span> <span data-notify="message"> '+ data +' </span></div>',
  //   //     "",
  //   //     {
  //   //       timeOut: 3000,
  //   //       closeButton: true,
  //   //       enableHtml: true,
  //   //       tapToDismiss: false,
  //   //       titleClass: "alert-title success", // Apply the success class here
  //   //       positionClass: "toast-top-center",
  //   //       toastClass: "ngx-toastr alert alert-dismissible alert-success alert-notify" // Apply success-specific class
  //   //     }
  //   //   );

  //   // }); 
  // }
  CloseRequest(AddressFormPopup: any) {

    if (this.AddFileInwardForm.get('retrival_type')?.value !== 'Access') {
      this.modalRef = this.modalService.show(AddressFormPopup);
    }
    else {
      this.uploads();
    }

  }
  uploads() {
    this.submitteds = true
    const apiUrl = this._global.baseAPIUrl + 'Retrival/ClosedRetrivalRequest?USERId=' + localStorage.getItem('UserID') + '&request_number=' + this.AddFileInwardForm.value.request_number + '&user_Token=' + localStorage.getItem('User_Token') + "&dispatch_address=" + this.dispatchForm.controls['dispatch_address'].value;
    this._onlineExamService.getAllData(apiUrl)
      .subscribe((data: {}) => {
        this.toastr.show(
          '<div class="alert-text"</div> <span class="alert-title success" data-notify="title">Success ! </span> <span data-notify="message"> ' + data + ' </span></div>',
          "",
          {
            timeOut: 3000,
            closeButton: true,
            enableHtml: true,
            tapToDismiss: false,
            titleClass: "alert-title success",
            positionClass: "toast-top-center",
            toastClass: "ngx-toastr alert alert-dismissible alert-success alert-notify"
          }
        );
        this.router.navigate(['/retrival/retrival-request'])
      });
    this.GetRequestNo()
    this.GetTableData();
    this.modalRef.hide();
    this.router.navigate(['/retrival/retrival-request'])
  }
  BindHeader(tableData) {

    let formattedData = [];
    let tableHeader: any = [
      { field: 'srNo', header: "SR NO", index: 1 },
      { field: 'request_number', header: 'REQUEST NO', index: 2 },
      { field: 'item_code', header: 'ITEM CODE', index: 2 },
      { field: 'retrival_type', header: 'RETRIEVAL TYPE', index: 3 },
      { field: 'delivery_type', header: 'DELIVERY TYPE', index: 3 },
      { field: 'retrieval_reason', header: 'RETRIEVAL REASON', index: 3 },
      { field: 'item_number', header: 'ITEM NUMBER', index: 4 },
      { field: 'created_by', header: 'REQUESTED BY', index: 3 },
      { field: 'created_date', header: 'REQUEST DATE', index: 4 },
    ];
    this.headerList = tableHeader;
    //}

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

    this.modalRef.hide();
    this.AddFileInwardForm.controls['item_number'].setValue('');
    this.AddFileInwardForm.controls['remark'].setValue('');
  }

  OnClose() {
    this.modalService.hide(1);
  }

  OnreadonlyAppc() {
    if (this.AddFileInwardForm.value.appl <= 0) {
      // this.ShowErrormessage("Select appl value");
      // return false;    
      this.Isreadonly = false;
    }
    else {
      this.Isreadonly = true;
    }

  }
  onSubmit() {

    this.submitted = true;

    if (this._CSVData != null && this._CSVData != undefined) {

      // this.DataUploadForm.patchValue({
      // id: localStorage.getItem('UserID'),
      // CSVData: this._CSVData,     
      // User_Token: localStorage.getItem('User_Token')   

      // });    

      const apiUrl = this._global.baseAPIUrl + 'DataUpload/AvanseUploaDumpData';
      // this._onlineExamService.postData(this.DataUploadForm.value, apiUrl)
      // // .pipe(first())
      // .subscribe(data => {

      // // alert(data);
      // console.log(data)
      //   this.showSuccessmessage(data); 
      //   this.BindHeader(this._FilteredList,this._FilteredList);

      // });

      //  }     
    }
    else {
      this.showmessage("please select file");

    }
  }
  upload() {
    this.AddFileInwardForm.patchValue({
      CSVData: this._CSVData
    })
    console.log(this.AddFileInwardForm.value)
    const apiUrl = this._global.baseAPIUrl + "DataUpload/CreateBulkRequest";
    this._onlineExamService
      .postData(this.AddFileInwardForm.value, apiUrl)
      .subscribe((data) => {
        this.downloadFilestatus(data);
        this.GetRequestNo();
      });
    this.modalRef.hide();
  }
  downloadFilestatus(strmsg: any) {
    const filename = 'Record Retrieval upload status';
    let blob = new Blob(['\ufeff' + strmsg], {
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

  ShowErrormessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error ! </span> <span data-notify="message"> ' + data + ' </span></div>',
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

  ShowMessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title success" data-notify="title">Success ! </span> <span data-notify="message"> ' + data + ' </span></div>',
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title success", // Apply the success class here
        positionClass: "toast-top-center",
        toastClass: "ngx-toastr alert alert-dismissible alert-success alert-notify" // Apply success-specific class
      }
    );


  }

  validation() {



    if (this.AddFileInwardForm.value.appl <= 0) {
      this.ShowErrormessage("Select appl value");
      return false;
    }

    if (this.AddFileInwardForm.value.BatchNo == "" || this.AddFileInwardForm.value.BatchNo == null) {
      //alert(this.AddBranchInwardForm.value.apac);

      this.ShowErrormessage("Enter Batch No value");
      return false;
    }

    if (this.AddFileInwardForm.value.apac == "" || this.AddFileInwardForm.value.apac == null) {
      //alert(this.AddBranchInwardForm.value.apac);

      this.ShowErrormessage("Enter Apac value");
      return false;
    }
    if (this.AddFileInwardForm.value.File_No == "" || this.AddFileInwardForm.value.File_No == null) {
      //alert(this.AddBranchInwardForm.value.apac);

      this.ShowErrormessage("Enter File No");
      return false;
    }

    return true;
  }

  showmessage(data: any) {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title success" data-notify="title">Success ! </span> <span data-notify="message"> ' + data + ' </span></div>',
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title success", // Apply the success class here
        positionClass: "toast-top-center",
        toastClass: "ngx-toastr alert alert-dismissible alert-success alert-notify" // Apply success-specific class
      }
    );


  }

  DeleteFile(Row: any) {
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
          this.AddFileInwardForm.patchValue({
            apac: Row.apac,
            appl: Row.appl,
            BatchNo: Row.BatchNo,
            User_Token: localStorage.getItem('User_Token'),
          });

          const that = this;
          const apiUrl = this._global.baseAPIUrl + 'BranchInward/Delete';
          this._onlineExamService.postData(this.AddFileInwardForm.value, apiUrl)
            .subscribe(data => {
              swal.fire({
                title: "Deleted!",
                text: "Record has been deleted.",
                type: "success",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-primary",
              });
              // this.GetBatchDetails();
              //  that.getSearchResult(that.AddBranchInwardForm.get('TemplateID').value);
            });

        }
      });

  }

  NotReceived() {
    this.AddFileInwardForm.patchValue({
      file_status: "File Not Received",
    })
    const apiUrl = this._global.baseAPIUrl + "BranchInward/AddEditAppacdetailsAck";
    this._onlineExamService
      .postData(this.AddFileInwardForm.value, apiUrl)
      // .pipe(first())
      .subscribe((data) => {

        if (data == 'Record save succesfully') {
          this.ShowMessage(data);
        }
        else {
          this.ShowErrormessage(data);
        }
        this.OnReset();
        // this.GetBatchDetails();

      });

  }
}