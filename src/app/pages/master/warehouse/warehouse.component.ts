import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from "@angular/forms";
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
@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseComponent implements OnInit {
selectedDepartmentIds: number[] = [];
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  AddWarehouseForm: FormGroup;
  AddBranchMappingForm: FormGroup;
  BranchMappingForm: FormGroup;
  submitted = false;
  __checkedList: string = "";
  _UserL: any;
  Reset = false;
  sMsg: string = "";
  master_checked: boolean = false;
  master_indeterminate: boolean = false;
  _BranchList: any;
  BranchForm: FormGroup;
  _FilteredList: any;
  checkbox_list = [];
  isEditMode: boolean = false;
  _BranchID: any = 0;

  first = 0;
  first1 = 0;
  rows = 10;
  rows1 = 10;
  isAllSelected = false;
  departmentList: any[] = [];

  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants
  ) { }
  ngOnInit() {
    const userID = localStorage.getItem("UserID");
    this.AddWarehouseForm = this.formBuilder.group({
      Id: [0],
      WarehouseName: ["", Validators.required],
      WarehouseDescription: ["", Validators.required],
      IsActive: ["", Validators.required],
      User_Token: localStorage.getItem("user_Token"),
      userid: Number(localStorage.getItem("UserID"))
    });
    this.geBranchList();
    this.geCrownBranchList();
    
  }


 //------------------Delete Department----------------- 
 deleteDepartment(value: any) {
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
          debugger;
        const deletePayload = {
          id: value.id,
          User_Token: this.BranchMappingForm.get("User_Token")?.value,
        };

        console.log("Sending delete payload:", deletePayload);

        const apiUrl = this._global.baseAPIUrl + "DepartmentMaster/DeleteDepartment";

        this._onlineExamService.postData(deletePayload, apiUrl).subscribe(
          (data) => {
            swal.fire({
              title: "Deleted!",
              text: "Folder Mapping has been deleted.",
              type: "success",
              buttonsStyling: false,
              confirmButtonClass: "btn btn-primary",
            });

            // this.geBranchListMapping(
            //   this.BranchMappingForm.get("UserIDS")?.value
            // );
             this.geBranchList();
          },
          
          (error) => {
            swal.fire({
              title: "Error!",
              text: "Failed to delete record.",
              type: "error",
              confirmButtonClass: "btn btn-danger",
            });
          }
        );
      }
    });
   
}
// //----------------------------------
  

  get FormControls() {
    return this.AddWarehouseForm.controls;
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

  geBranchList() {
    const apiUrl =
      this._global.baseAPIUrl +
      "Warehouse/GetWarehouseLists?user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      console.log(data);

      this._BranchList = data;

      this._FilteredList = data;
      this.prepareTableData(this._BranchList, this._FilteredList);
    });
  }

  AllCrownBranch: any;
  geCrownBranchList() {
    const apiUrl =
      this._global.baseAPIUrl +
      "BranchMaster/GetCrownBranchList?user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      console.log(data);
      this.AllCrownBranch = data;
    });
  }

  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;
  prepareTableData(tableData, headerList) {
    let formattedData = [];
    let tableHeader: any = [
      { field: "srNo", header: "SR NO", index: 1 },
      { field: "WarehouseName", header: "Warehouse Name", index: 3 },
      { field: "WarehouseDescription", header: "Warehouse Description", index: 2 },
      { field: "IsActive", header: "Is Active", index: 4 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        WarehouseDescription: el.WarehouseDescription,
        WarehouseName: el.WarehouseName,
        id: el.Id,
        IsActive: el.IsActive === 'Y' ? 'YES' : 'NO',
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

  OnReset() {
    this.onClose();
     if (this.modalRef) {
    this.modalRef.hide(); // ✅ This closes the modal
  }
  }

  _DepartmentList: any;
  getDepartmentList() {
    const apiUrl =
      this._global.baseAPIUrl +
      "DepartmentMaster/GetDepartmentsLists?user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._DepartmentList = data;
    });
  }

  onSubmit(modal: any) {
    this.submitted = true;

    if (this.AddWarehouseForm.invalid) {
      return;
    }
    //debugger
 console.log("🚀 Submitting Form:", this.AddWarehouseForm.value); // ✅ Add here
    console.log("🧾 Add Form Value:", this.AddWarehouseForm.value);

    const userToken = localStorage.getItem("user_Token");

    const apiUrl = this._global.baseAPIUrl + "Warehouse/Add?user_Token=" + userToken;
    console.log("🌐 Add API URL:", apiUrl);

    this._onlineExamService.postData(this.AddWarehouseForm.value, apiUrl).subscribe((response: any) => {
      this.toastr.show(
        '<span class="alert-title">Success!</span> <span data-notify="message">Warehouse Saved</span>',
        "",
        {
          timeOut: 3000,
          closeButton: true,
          enableHtml: true,
          tapToDismiss: false,
          positionClass: "toast-top-center",
          toastClass: "ngx-toastr alert alert-success alert-notify"
        }
      );

      this.geBranchList();
      this.OnReset();
      //this.modalRef?.hide();
      console.log("Form Submitted:", this.AddWarehouseForm.value);

    });
  }

  onSubmitDepartment() {
    this.submitted = true;

    if (this.AddWarehouseForm.invalid) {
      return;
    }

    const formValue = this.AddWarehouseForm.value;
    console.log("🧾 Update Form Value:", formValue);

    const userToken = localStorage.getItem("user_Token");

    if (!formValue.Id || Number(formValue.Id) === 0) {
      this.toastr.error("Invalid department ID for update.");
      return;
    }

    const apiUrl = this._global.baseAPIUrl + "Warehouse/Update?user_Token=" + userToken;
    console.log("🌐 Update API URL:", apiUrl);

    this._onlineExamService.postData(formValue, apiUrl).subscribe((response: any) => {
      this.toastr.show(
        '<span class="alert-title">Success!</span> <span data-notify="message">Department Updated</span>',
        "",
        {
          timeOut: 3000,
          closeButton: true,
          enableHtml: true,
          tapToDismiss: false,
          positionClass: "toast-top-center",
          toastClass: "ngx-toastr alert alert-success alert-notify"
        }
      );

      this.geBranchList();
      this.OnReset();
      this.modalRef?.hide();
    });
  }



  deleteBranch(item: any) {
    console.log("item received in deleteBranch:", item);
    const id = item.id;
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
        const apiUrl =
          this._global.baseAPIUrl +
          "Warehouse/DeleteWarehouse?id=" +
          id +
          "&User_Token=" +
          localStorage.getItem("User_Token") +
          "&userid=" +
          localStorage.getItem("UserID");

        this._onlineExamService.getAllData(apiUrl).subscribe((data) => {
          swal.fire({
            title: "Deleted!",
            text: "Warehouse has been deleted.",
            type: "success",
            buttonsStyling: false,
            confirmButtonClass: "btn btn-primary",
          });
          this.geBranchList();
        });
      }
    });
  }
  _SingleDepartment: any;

  editBranch(template: TemplateRef<any>, row: any) {
    console.log("🔍 Editing department:", row);
    this.isEditMode = true; // Set edit mode to true  
    this.AddWarehouseForm.patchValue({
      Id: row.Id || row.id,  // ✅ Patch 'Id' with the value from row
      WarehouseDescription: row.WarehouseDescription,
      WarehouseName: row.WarehouseName,
      IsActive: row.IsActive === 'YES' ? 'Y' : 'N', 
      userid: localStorage.getItem("UserID"),
      User_Token: localStorage.getItem("user_Token")
    });

    this.modalRef = this.modalService.show(template);
  }


  addBranch(template: TemplateRef<any>) {
    this.isEditMode = false;
    this.submitted = false;
    this.AddWarehouseForm.reset();
    this.AddWarehouseForm = this.formBuilder.group({
      WarehouseName: ["", Validators.required],
      WarehouseDescription: ["", Validators.required],
      IsActive: ["", Validators.required],
      User_Token: localStorage.getItem("user_Token"),
      userid: localStorage.getItem("UserID"),
      Id: [0],
    });
    this.modalRef = this.modalService.show(template);
    
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }




 //--------------------------------------------------------------------


  geUserList() {
    const apiUrl =
      this._global.baseAPIUrl +
      "Admin/GetList?user_Token=" +
      this.BranchMappingForm.get("User_Token").value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._UserL = data;
      this.BranchMappingForm.controls["UserID"].setValue(0);
      this.BranchMappingForm.controls["UserIDS"].setValue(0);
    });
  }
  list_change() {
    let checked_count = 0;
    for (let value of Object.values(this.checkbox_list)) {
      if (value.ischecked) checked_count++;
    }

    if (checked_count > 0 && checked_count < this.checkbox_list.length) {
      this.master_indeterminate = true;
    } else if (checked_count == this.checkbox_list.length) {
      this.master_indeterminate = false;
      this.master_checked = true;
    } else {
      this.master_indeterminate = false;
      this.master_checked = false;
    }
  }



  addBranchMapping(template: TemplateRef<any>) {
    this.getDepartmentNamesList();
    this.modalRef = this.modalService.show(template);
    this.BranchMappingForm.controls["UserID"].setValue(0);
  }

  get departmentsArray(): FormArray {
    return this.AddBranchMappingForm.get("departmentsArray") as FormArray;
  }

  isChecked(id: number): boolean {
    return this.departmentsArray.value.includes(id);
  }

  onCheckboxChange(event: any) {
    const id = +event.target.value;
    if (event.target.checked) {
      if (!this.departmentsArray.value.includes(id)) {
        this.departmentsArray.push(new FormControl(id));
      }
    } else {
      const index = this.departmentsArray.controls.findIndex(
        (x) => x.value === id
      );
      if (index >= 0) this.departmentsArray.removeAt(index);
    }

    this.updateSelectAllState();
  }

  toggleSelectAll(event: any) {
    this.departmentsArray.clear();
    if (event.target.checked) {
      this.departmentList.forEach((dept) => {
        this.departmentsArray.push(new FormControl(dept.Id));
      });
      this.isAllSelected = true;
    } else {
      this.isAllSelected = false;
    }
  }

  updateSelectAllState() {
    this.isAllSelected =
      this.departmentsArray.value.length === this.departmentList.length;
  }

  getDepartmentNamesList() {
    const apiUrl =
      this._global.baseAPIUrl +
      "DepartmentMaster/GetDepartmentsLists?user_Token=" +
      localStorage.getItem("User_Token");

    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      if (Array.isArray(data)) {
        this.departmentList = data;
      } else {
        console.error("Unexpected response format:", data);
        this.departmentList = []; // fallback to empty list
      }
    });
  }

  onClose() {
    // Reset form fields
    this.AddWarehouseForm.reset();

    // Reset checkbox selections
    this.selectedDepartmentIds = []; // if you're tracking selected IDs
    this.isAllSelected = false;

    // Optionally mark all controls as untouched
    this.AddWarehouseForm.markAsPristine();
    this.AddWarehouseForm.markAsUntouched();
  }




  ErrorMessage(msg: any) {
    this.toastr.show(
      `<div class="alert-text">
       <span class="alert-title" data-notify="title"></span>
       <span data-notify="message"> ${msg} </span>
     </div>`,
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass: "ngx-toastr alert alert-dismissible alert-danger alert-notify"
      }
    );
  }

  showSuccessToast(msg: any) {
    this.toastr.show(
      '<div class="alert-text"></div> <span class="alert-title" data-notify="title"></span> <span data-notify="message"> ' + msg + ' </span></div>',
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass:
          "ngx-toastr alert alert-dismissible alert-success alert-notify" // Use alert-success for green
      }
    );
  }



  editBranchMapping(template: TemplateRef<any>, row: any) {
    console.log("row", row);

    this.addBranchMapping(template);
    this.AddBranchMappingForm.patchValue({ UserID: row.userid });
  }


}
