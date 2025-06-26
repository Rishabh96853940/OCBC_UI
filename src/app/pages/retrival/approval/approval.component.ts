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
import { CsvUploadComponent } from "../csv-upload/csv-upload.component";
import { MatDialog } from "@angular/material/dialog";



@Component({
  selector: 'app-approval',
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss']
})
export class ApprovalComponent implements OnInit {

  
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  // SelectionType = SelectionType;
  modalRef: BsModalRef;
  isReadonly = true; 
  _IndexList:any; 
 UserID:any;
 PODEntryForm: FormGroup;   
 pickupForm: FormGroup;  
  submitted = false; 
  Reset = false;
  sMsg: string = '';  
  _FileNo:any="";
  first:any=0;
  rows:any=0;
  first1:any=0;
  rows1:any=0;
  first2:any=0;
  rows2:any=0;
  _IndexPendingListFile:any;
  _FilteredListFile:any;

  _TotalPages:any=0;
  _FileList:any;
  _FilteredList :any; 
  _IndexPendingList:any;
  bsValue = new Date();
  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private dialog:MatDialog
    
  ){}
  ngOnInit(){
    document.body.classList.add('data-entry');
    this.pickupForm = this.formBuilder.group({
      branch_id: ['', Validators.required],
      request_id:[''],
      dispatch_address:[''],
      service_type: ['', Validators.required],
      document_type: ['', Validators.required],
      main_file_count: [null], // No validators, will be validated conditionally
      collateral_file_count: [null],  
     remark: [''],  
      User_Token: localStorage.getItem('User_Token') ,
      userid: localStorage.getItem('UserID') , 
      
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
  AllBranch:any
  getAllBranchList(){
    const apiUrl=this._global.baseAPIUrl+'BranchMaster/GetbranchDeatilsByUserId?USER_ID='+localStorage.getItem('UserID')+'&user_Token='+ localStorage.getItem('User_Token') 
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {  
      console.log("barnch",data) 
      this.AllBranch=data 
    })
    console.log(this.AllBranch)
  }
   //karta hoon integrate work ho raha abb
  getPickRequest() {  

const apiUrl = this._global.baseAPIUrl + 'Retrival/ApprovalRequestPending?USERId='+localStorage.getItem('UserID')+'&user_Token='+ localStorage.getItem('User_Token');
this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: {}) => {    
   
this._IndexPendingList = data;
this._FilteredList = data;
console.log("IndexListPending",data);
 this.prepareTableData(this._FilteredList, this._IndexPendingList);
//this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
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
  } else if(this.pickupForm.get('document_type').value === 'Both (Main and Collateral)'){
    collateralFileCountControl.setValidators([Validators.required]);
    mainFileCountControl.setValidators([Validators.required]);
  }
  else{
    mainFileCountControl.clearValidators();
    collateralFileCountControl.clearValidators();
  }

  mainFileCountControl.updateValueAndValidity();
  collateralFileCountControl.updateValueAndValidity();
}
get PickupControls(){return this.pickupForm.controls}
onSubmit() {
this.submitted = true;
console.log(this.pickupForm.value)
if(!this.pickupForm.valid) {
  return;
}
const that = this;
// var apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/InsertUpdatePickupRequest';

// this._onlineExamService.postPickupRequest(this.pickupForm.value,apiUrl)
// .subscribe( data => {
    
// this.toastr.show(
//   '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success!</span> <span data-notify="message"> '+ data +' </span></div>',
//   "",
//   {
//     timeOut: 3000,
//     closeButton: true,
//     enableHtml: true,
//     tapToDismiss: false,
//     titleClass: "alert-title",
//     positionClass: "toast-top-center",
//     toastClass:
//       "ngx-toastr alert alert-dismissible alert-success alert-notify"
//   }
// );



// // this.modalRef
// this.modalRef.hide();
// that.getPickRequest();
// //this.OnReset();      
// });
// }

}
closeModel(){
  this.modalRef.hide()
}


formattedData: any = [];
headerList: any;
immutableFormattedData: any;
immutableFormattedData1: any;
loading: boolean = true;
loading1: boolean = true;
prepareTableData(tableData, headerList) {
  let formattedData = [];
  let tableHeader: any = [
  { field: 'srNo', header: "SR NO", index: 1 },
  { field: 'request_number', header: 'REQUEST NUMBER', index: 2 },
   { field: 'item_code', header: 'ITEM CODE', index: 2 },
   { field: 'retrival_type', header: 'RETRIEVALTYPE', index: 2 },
   { field: 'delivery_type', header: 'DELIVERY TYPE', index: 2 },
   { field: 'FileCount', header: 'FILE COUNT', index: 2 },
   { field: 'status', header: 'STATUS', index: 2 },
   { field: 'dispatch_address', header: 'Dispatch Address', index: 2 },
   { field: 'request_by', header: 'REQUEST BY', index: 2 },
   { field: 'request_date', header: 'REQUEST DATE', index: 2 },
  ];
  
  tableData.forEach((el, index) => {
    formattedData.push({
      'srNo': parseInt(index + 1),
      'request_number': el.request_number,    
      'item_code': el.item_code,    
      'retrival_type': el.retrival_type,    
      'status': el.status,       
       'request_date':el.request_date,
       'request_by':el.request_by,
       'dispatch_address':el.dispatch_address,
       'delivery_type':el.delivery_type,
       'FileCount':el.FileCount

    });
  
  });
  this.headerList = tableHeader;
  this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
  this.formattedData = formattedData;
  this.loading = false;
   
 // console.log(this.formattedData);

}
headerList1: any;
prepareTableData1(tableData, headerList) {
  let formattedData = [];
  let tableHeader: any = [
  { field: 'srNo', header: "SR NO", index: 1 },
  { field: 'request_number', header: 'REQUEST NUMBER', index: 2 },
  
   { field: 'item_code', header: 'ITEM CODE', index: 2 },

   { field: 'retrival_type', header: 'RETRIEVALTYPE', index: 2 },
   { field: 'delivery_type', header: 'DELIVERY TYPE', index: 2 },
   { field: 'item_number', header: 'ITEM NUMBER', index: 2 },
   { field: 'file_status', header: 'STATUS', index: 2 },
   { field: 'request_by', header: 'REQUEST BY', index: 2 },
   { field: 'request_date', header: 'REQUEST DATE', index: 2 },
   { field: 'remark', header: 'REMARK', index: 2 },
  ];
  
  tableData.forEach((el, index) => {
    formattedData.push({
      'srNo': parseInt(index + 1),
      'request_number': el.request_number,    
      'item_code': el.item_code,    
      'retrival_type': el.retrival_type,    
      'file_status': el.file_status,       
       'request_date':el.request_date,
       'remark':el.remark,
       'request_by':el.request_by,
       'item_number':el.item_number,
       'delivery_type':el.delivery_type

    });
  
  });
  this.headerList1 = tableHeader;
  this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
  this.formattedData1 = formattedData;
  this.loading1 = false;
   
 // console.log(this.formattedData);

}
AddApprovalForm:FormGroup
onUpdatestatus(status:any, row:any) {
  this.AddApprovalForm=this.formBuilder.group({
    status:[status],
    request_number:[this.pickupForm.controls['request_id'].value],
    User_Token: localStorage.getItem('User_Token') ,
    CreatedBy: localStorage.getItem('UserID') , 
  })  
const that = this;
const apiUrl = this._global.baseAPIUrl + 'Retrival/UpdateStatus';
this._onlineExamService.postData(this.AddApprovalForm.value,apiUrl)
// .pipe(first())
.subscribe( data => {
console.log('MY Data',data)
this.toastr.show(
'<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success!</span> <span data-notify="message"> '+ data +' </span></div>',
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
this.getPickRequest()
this.modalRef.hide();
// that.getRetrievalDispatchList();

});
 
}
Editinward2(car:any){
  const apiUrl=this._global.baseAPIUrl+'AvansePickupRequest/GetFileInventoryByRequestNo?request_id='+car.request_id+'&user_Token='+localStorage.getItem('User_Token'); 
  this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {    
    this.exportToExcel(data,'Download') 
  
    
  });
}
searchTable($event) {
  // console.log($event.target.value);

  let val = $event.target.value;
  if(val == '') {
    this.formattedData = this.immutableFormattedData;
  } else {
    let filteredArr = [];
    const strArr = val.split(',');
    this.formattedData = this.immutableFormattedData.filter(function (d) {
      for (var key in d) {
        strArr.forEach(el => {
          if (d[key] && el!== '' && (d[key]+ '').toLowerCase().indexOf(el.toLowerCase()) !== -1) {
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
  if(val == '') {
    this.formattedData1 = this.immutableFormattedData1;
  } else {
    let filteredArr = [];
    const strArr = val.split(',');
    this.formattedData1 = this.immutableFormattedData1.filter(function (d) {
      for (var key in d) {
        strArr.forEach(el => {
          if (d[key] && el!== '' && (d[key]+ '').toLowerCase().indexOf(el.toLowerCase()) !== -1) {
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
    
OnReset()
{
this.Reset = true; 
this.isReadonly = false;
 
} 
 AllDataShowRowWise:any
Editinward1(template: TemplateRef<any>, row: any){
   
  const apiUrl = this._global.baseAPIUrl + 'Retrival/GetApprovalByRequestNo?USERId='+localStorage.getItem('UserID')+'&user_Token='+ localStorage.getItem('User_Token')+'&request_number='+row.request_number;
  this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: {}) => {    
     
  this._IndexPendingList = data;
  this._FilteredList = data;
  console.log("IndexListPending",data);
   this.prepareTableData1(this._FilteredList, this._IndexPendingList);
   this.modalRef = this.modalService.show(template); 
  });
  this.AllDataShowRowWise=row
  
}



paginate(e) {
  this.first = e.first;
  this.rows = e.rows;
}
paginate1(e) {
  this.first1 = e.first;
  this.rows1 = e.rows;
}

hidepopup()
{
this.modalRef.hide();
}

get FormControls(){ return this.pickupForm.controls}
Add(template: TemplateRef<any>){
  const apiUrl = this._global.baseAPIUrl + 'AvansePickupRequest/GetAvancePickUpRequestNo?userId='+localStorage.getItem('UserID')+'&user_Token='+ localStorage.getItem('User_Token')+'&request_no=';
  this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: any) => {    
    this.pickupForm.reset()
  this.pickupForm = this.formBuilder.group({
    branch_id: ['', Validators.required],
    request_id:[data],
    service_type: ['', Validators.required],
    document_type: ['', Validators.required],
    remark:[''],
    main_file_count: [null],
    collateral_file_count: [null],  
    User_Token: localStorage.getItem('User_Token') ,
    userid: localStorage.getItem('UserID') , 
    
  });
  this.modalRef = this.modalService.show(template); 
    
  });
  var that = this;
  
}
formattedData1: any = [];
Editinward(template: TemplateRef<any>, row: any) {
  this.pickupForm.controls['request_id'].setValue(row.request_number)
  this.pickupForm.controls['dispatch_address'].setValue(row.dispatch_address)
  const apiUrl = this._global.baseAPIUrl + 'Retrival/GetApprovalByRequestNo?USERId='+localStorage.getItem('UserID')+'&user_Token='+ localStorage.getItem('User_Token')+'&request_number='+row.request_number;
  this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: {}) => {    
     
  this._IndexPendingList = data;
  this._FilteredList = data;
  console.log("IndexListPending",data);
   this.prepareTableData1(this._FilteredList, this._IndexPendingList);
  //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
  });

  
this.modalRef = this.modalService.show(template); 

}



Edit(data:any){
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
        
        const apiUrl = this._global.baseAPIUrl + '/AvansePickupRequest/DeletePickupRequest?request_id='+id+'&User_Token='+ localStorage.getItem('User_Token')+'&userid='+localStorage.getItem('UserID');
        this._onlineExamService.DELETEData(apiUrl)     
        .subscribe( data => {
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

  showmessage(data:any)
  {
  this.toastr.show(
  '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Validation ! </span> <span data-notify="message"> '+ data +' </span></div>',
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
