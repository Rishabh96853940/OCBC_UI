import { Globalconstants } from "./../../../Helper/globalconstants";
import { OnlineExamServiceService } from "./../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup,FormControl, FormBuilder, Validators } from "@angular/forms";
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
  selector: "app-users",
  templateUrl: "users.component.html",
  styleUrls: ["users.component.scss"]
})
export class UsersComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;

  UserList: any;
  _FilteredList: any;
  _RoleList: any;
  AddUserForm: FormGroup;
  submitted = false;
  Reset = false;
  //_UserList: any;
  sMsg: string = "";
  //RoleList: any;
  _SingleUser: any = [];
  _UserID: any;
  User:any;
  first = 0;
  rows = 10;

  constructor(
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    public toastr: ToastrService,
  ) {}
  ngOnInit() {
    this.AddUserForm = this.formBuilder.group({
      id: [""],
      name: new FormControl('', [Validators.required]),
      userid: ["", [Validators.required, Validators.maxLength(20), Validators.minLength(5)]],
      pwd: ["", [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/)]],
      confirmPass: ["", Validators.required],
      //Cpwd: ['', Validators.required],
      email: ["", [Validators.required, Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    ]],
      mobile: ["", [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      sysRoleID: ["", Validators.required],
      Remarks: [""],
      UserType: [0,Validators.required],
      // AccountType: [0,Validators.required],
      User_Token: localStorage.getItem('User_Token'),
    },{ 
      validator: this.ConfirmedValidator('pwd', 'confirmPass')
    });
      
    this.geRoleList();
    this.geUserList();
this.User ="Create User";

  }

  //Newly added code 
    ConfirmedValidator(controlName: string, matchingControlName: string){
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];
        if (matchingControl.errors && !matchingControl.errors.confirmedValidator) {
            return;
        }
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ confirmedValidator: true });
        } else {
            matchingControl.setErrors(null);
        }
    }
}
  get f(){
    return this.AddUserForm.controls;
  }



  entriesChange($event) {
    this.entries = $event.target.value;
  }
  filterTable($event) {
  //  console.log($event.target.value);

    let val = $event.target.value;
    this._FilteredList = this.UserList.filter(function (d) {
    //  console.log(d);
      for (var key in d) {
        if (key == "name" || key == "email" || key == "userid" || key == "mobile" || key == "roleName") {
          if (d[key].toLowerCase().indexOf(val.toLowerCase()) !== -1) {
            return true;
          }
        }
      }
      return false;
    });
  }
  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  onActivate(event) {
    this.activeRow = event.row;
  }

  geRoleList() {
    const userToken = this.AddUserForm.get('User_Token').value || localStorage.getItem('User_Token');
    const apiUrl = this._global.baseAPIUrl + "Role/GetList?user_Token="+userToken;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._RoleList = data;
      //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())ser
    });
  }
  geUserList() {
    const userToken = this.AddUserForm.get('User_Token').value || localStorage.getItem('User_Token');
    const apiUrl = this._global.baseAPIUrl + "Admin/GetList?user_Token="+userToken;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this.UserList = data;
      this._FilteredList = data;
      this.prepareTableData( this.UserList,  this._FilteredList);
      //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    });
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
    { field: 'name', header: 'NAME', index: 3 },
    { field: 'userid', header: 'USER ID', index: 2 },
    { field: 'email', header: 'EMAIL', index: 3 },
    { field: 'mobile', header: 'MOBILE', index: 3 },
    { field: 'roleName', header: 'ROLE', index: 3 },
    // { field: 'AccountType', header: 'ACCOUNT TYPE', index: 3 },
    
    // { field: 'Ref6', header: 'Ref6', index: 3 },
//    { field: 'SubfolderName', header: 'SUB FOLDER', index: 3 }
    //,{ field: 'DownloadDate', header: 'DownloadDate', index: 3 },
   // { field: 'SendDate', header: 'SendDate', index: 7 }, { field: 'IsSend', header: 'IsSend', index: 8 },

  ];
 
  tableData.forEach((el, index) => {
    formattedData.push({
      'srNo': parseInt(index + 1),
      'name': el.name,
      'id': el.id,
      'userid': el.userid,
      'email': el.email,
      'mobile': el.mobile,
      'roleName': el.roleName,
      // 'AccountType': el.AccountType,
      'AccountTypeID': el.AccountTypeID   
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
    this.Reset = true;
    this.AddUserForm.reset();
    this.User ="Create User";
  }

  OnClose()
  {
    this.modalService.hide(1);
  }

  onSubmit() {
    this.submitted = true; 

    if(this.AddUserForm.value.sysRoleID <=0) {
     this.ShowErrormessage("Select Role Name");
     return;
    }
    
    if(this.AddUserForm.value.userid.trim() =="") {
      this.ShowErrormessage("Please enter user ID");
      return;
     }
     if(this.AddUserForm.value.name.trim() =="") {
      this.ShowErrormessage("Please enter user");
      return;
     }

     

    if(this.AddUserForm.value.User_Token == null) {
      this.AddUserForm.value.User_Token = localStorage.getItem('User_Token');
    }
    if (this.AddUserForm.get('id').value) {
      const apiUrl = this._global.baseAPIUrl + "Admin/Update";
      console.log("addd")
      this._onlineExamService
        .postData(this.AddUserForm.value, apiUrl)
        // .pipe(first())
        .subscribe((data) => {
          if (data != null) {
           
            this.ShowMessage("Record Updated Successfully.."); 
            // alert("Record Updated Succesfully..");
            this.modalService.hide(1);
            this.OnReset();
            //this.router.navigate(['/student']);
            this.geUserList();
          } else {
            // Open Modal like you have opned in other pages
            //alert("User already exists.");
          }
        });
    } else {
     // console.log('Form',this.AddUserForm.value);
     // console.log('Inside Create');
      const apiUrl = this._global.baseAPIUrl + "Admin/Create";
      this._onlineExamService
        .postData(this.AddUserForm.value, apiUrl)
        // .pipe(first())
        .subscribe((data) => {
          if (data == 1) {
           // alert("Record Saved Successfully..");
           this.ShowMessage("Record Saved Successfully.."); 
           
           this.OnReset();
            //this.router.navigate(['/student']);
            this.geUserList();
            this.modalService.hide(1);
          } else {
            this.ShowErrormessage("User already exists.");
           // alert("User already exists.");
          }
        });
    }

    //this.studentForm.patchValue({File: formData});
  }

  editEmployee(template: TemplateRef<any>, value: any) {

    this.User ="Edit user details";

    console.log("value",value);
    const apiUrl =
      this._global.baseAPIUrl +
      "Admin/GetDetails?ID=" +
      value.id +"&user_Token=" + localStorage.getItem('User_Token');
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      var that = this;
      that._SingleUser = data;
    console.log('data', data);
      this.AddUserForm.patchValue({
        id: that._SingleUser.id,
        name: that._SingleUser.name,
        userid: that._SingleUser.userid,
        pwd: that._SingleUser.pwd,
        confirmPass: that._SingleUser.pwd,
        email: that._SingleUser.email,
        mobile: that._SingleUser.mobile,
        sysRoleID: that._SingleUser.sysRoleID,
        Remarks: that._SingleUser.remarks,
        UserType: that._SingleUser.UserType,
        // AccountType:that._SingleUser.AccountTypeID,
      })
    //  console.log('form', this.AddUserForm);
      //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    });
    
    this.modalRef = this.modalService.show(template);
  }

  deleteEmployee(id: any) {

    if (id != localStorage.getItem('UserID'))
{
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
          this.AddUserForm.patchValue({
            id: id.id,
            User_Token: localStorage.getItem('User_Token'),
          });

          const apiUrl = this._global.baseAPIUrl + "Admin/Delete";
          this._onlineExamService
            .postData(this.AddUserForm.value, apiUrl)
            .subscribe((data) => {
              swal.fire({
                title: "Deleted!",
                text: "User has been deleted.",
                type: "success",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-primary",
              });
              this.geUserList();
            });
        }
      });
    }
    else
    {

      this.ShowErrormessage("Your already log in so you can not delete!");
    }
    }
//---
  addUser(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
    this.AddUserForm.patchValue({
      name: '',
      userid: '',
      pwd: '',
      confirmPass: '',
      email: '',
      mobile: '',
      sysRoleID: 0,
      Remarks:'',
      id:''
     
    })
    this.User ="Create user";
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

  ShowMessage(data:any)
  {
    this.toastr.show(
      '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success ! </span> <span data-notify="message"> '+ data +' </span></div>',
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

