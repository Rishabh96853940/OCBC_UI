import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from '../../../Services/online-exam-service.service';
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators, AbstractControl } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import swal from "sweetalert2";
import { ThirdPartyDraggable } from "@fullcalendar/interaction";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}

function multipleEmails(control: AbstractControl): { [key: string]: any } | null {
  const emails = control.value.split(',').map(email => email.trim());
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  for (const email of emails) {
    if (!emailPattern.test(email)) {
      return { invalidEmail: true };
    }
  }

  return null;
}

@Component({
  selector: 'app-email-notification',
  templateUrl: './email-notification.component.html'
})
export class EmailNotificationComponent implements OnInit {

  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  AddBranchForm: FormGroup;
  submitted = false;
  Reset = false;     
  sMsg: string = '';    
 _BranchList :any;
  BranchForm: FormGroup;
  _FilteredList :any; 
 _BranchID: any =0;
// _FilteredList:any;
 //_IndexPendingList:any;
 first = 0;
rows = 10;

  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants
  ) {}
  ngOnInit() {
    this.AddBranchForm = this.formBuilder.group({
      service_type: ['', Validators.required],
      branch_id: ['', Validators.required],
      cc_email_id: ['', Validators.required,multipleEmails],
      subject: ['', Validators.required],
      body: [''],
      User_Token: localStorage.getItem('User_Token') ,
      userid: localStorage.getItem('UserID') ,
      id:[]
    });
    this.getEmailList();
    this.getAllBranchList();

  }
  
  get FormControls(){ return this.AddBranchForm.controls}

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
  AllBranch:any
  getAllBranchList(){
    const apiUrl=this._global.baseAPIUrl+'BranchMaster/GetbranchDeatilsByUserId?USER_ID='+localStorage.getItem('UserID')+'&user_Token='+ localStorage.getItem('User_Token') 
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {  
      console.log(data) 
      this.AllBranch=data 
    })
  }
  getEmailList() {
    
    const apiUrl=this._global.baseAPIUrl+'EmailNotification/GetEmailNotificationAll?user_Token='+ localStorage.getItem('User_Token') 
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {   
      console.log(data)  
      this._BranchList = data;
      this._FilteredList = data
this.prepareTableData( this._BranchList,  this._FilteredList); 

    });
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
    { field: 'branch_code', header: 'BRANCH CODE', index: 2 },
    { field: 'service_type', header: 'SERVICE TYPE', index: 2 },
    { field: 'cc_email_id', header: 'CC', index: 2 },
    { field: 'subject', header: 'SUBJECT', index: 2 },

 
  ];
 
  tableData.forEach((el, index) => {
    formattedData.push({
      'srNo': parseInt(index + 1),
       'cc_email_id': el.cc_email_id,
       'service_type': el.service_type,
       'subject': el.subject,
       'branch_code':el.branch_code,
       'body':el.body,
       'branch_id':el.branch_id,
        'id': el.id,
    
    });
 
  });
  this.headerList = tableHeader;
//}

  this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
  this.formattedData = formattedData;
  this.loading = false;

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


  OnReset() {
  
    this.modalRef.hide();  

  }

  currentAddress:string
  ShowAddress(id:any){
    // console.log(id)
    for(let i=0;i<this.AllBranch.length;i++){
      if(id==this.AllBranch[i].id){
        this.currentAddress=this.AllBranch[i].address
        // console.log(this.AllBranch[i])
        break;
      }
    }
    // console.log(this.AllBranch[id].address)
    // this.currentAddress=this.AllBranch[id].address
    //array me se filter karna hoga eddress ko
  }


  ShowErrormessage(data:any)
  {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Error ! </span> <span data-notify="message"> '+ data +' </span></div>',
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





  onSubmit() {
    this.submitted = true;
    console.log(this.AddBranchForm.value)
    if (this.AddBranchForm.invalid) {
      
      return;
    }
    var apiUrl=this._global.baseAPIUrl+'EmailNotification/InsertEmailNotification';
    
    console.log(this.AddBranchForm.value)
    this._onlineExamService.postData(this.AddBranchForm.value,apiUrl).subscribe((data: {}) => {     
    // console.log(data);
    if(data==='Record Already Exists')
    {

      this.ShowErrormessage("Record Already Exists")
    }
else

     this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success!</span> <span data-notify="message">New Email notification addedd successfully!</span></div>',
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
     this.getEmailList();
     this.OnReset()
      //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    });

    //this.studentForm.patchValue({File: formData});
  }

  
  deleteBrnach(id: any) {
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
          
          const apiUrl = this._global.baseAPIUrl + 'EmailNotification/DeleteEmailNotification?id='+id+'&User_Token='+ localStorage.getItem('User_Token')+'&userid='+localStorage.getItem('UserID');
          this._onlineExamService.DELETEData(apiUrl)     
          .subscribe( data => {
              swal.fire({
                title: "Deleted!",
                text: "Folder has been deleted.",
                type: "success",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-primary",
              });
              this.getEmailList();
            });
        }
      });
  }
  _SingleDepartment:any
  editBranch(template: TemplateRef<any>, row: any) {
    this.FormText='Update Email Notification'
      var that = this;
      that._SingleDepartment = row;
      this.AddBranchForm = this.formBuilder.group({
        service_type: ['', Validators.required],
        branch_id: ['', Validators.required],
        cc_email_id: ['', Validators.required],
        subject: ['', Validators.required],
        body: ['', Validators.required],
        User_Token: localStorage.getItem('User_Token') ,
        userid: localStorage.getItem('UserID') ,
        id:[]
      });
      console.log(row)
      this.AddBranchForm.patchValue({
        id: that._SingleDepartment.id,
        service_type: that._SingleDepartment.service_type,
        branch_id:that._SingleDepartment.branch_id,
      cc_email_id: that._SingleDepartment.cc_email_id,
      subject: that._SingleDepartment.subject,
      body: that._SingleDepartment.body,
        User_Token: localStorage.getItem('User_Token') ,
        userid: localStorage.getItem('UserID') ,
         
      })
      this.ShowAddress(that._SingleDepartment.branch_id)
    this.modalRef = this.modalService.show(template);
  }
  FormText='Add Email Notification'
  addBranch(template: TemplateRef<any>) {
    this.FormText='Add Email Notification'
    this.AddBranchForm.reset()
    this.submitted=false
    this.AddBranchForm = this.formBuilder.group({
      service_type: ['', Validators.required],
      branch_id: ['', Validators.required],
      cc_email_id: ['', Validators.required],
      subject: ['', Validators.required],
      body: ['', Validators.required],
      User_Token: localStorage.getItem('User_Token') ,
      userid: localStorage.getItem('UserID') ,
      id:[]
    });
    this.modalRef = this.modalService.show(template);
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

}
