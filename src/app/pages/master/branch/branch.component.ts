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
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import swal from "sweetalert2";
import { ThirdPartyDraggable } from "@fullcalendar/interaction";
import { HttpClient } from "@angular/common/http";
export enum SelectionType {
  single = "single",
  multi = "multi",
  multiClick = "multiClick",
  cell = "cell",
  checkbox = "checkbox",
}
@Component({
  selector: "app-branch",
  templateUrl: "branch.component.html",
})
export class BranchComponent implements OnInit {
  selectedDepartmentIds: number[] = [];
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  AddBranchForm: FormGroup;
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
  isEditMapPopup:boolean=false;
  _BranchID: any = 0;

  first = 0;
  first1 = 0;
  rows = 10;
  rows1 = 10;
  isAllSelected = false;
  departmentList: any[] = [];
  selectedDepartments: number[] = [];
  originalMappedDepartments: number[] = [];

  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private http: HttpClient
  ) {}
  ngOnInit() {
    this.AddBranchForm = this.formBuilder.group({
      Id: [0],
      DepartmentName: [
        "",
        [
          Validators.required,
          this.noWhitespaceValidator,
          this.notOnlyNumberValidator,
        ],
      ],
      DepartmentCode: [
        "",
        [
          Validators.required,
          this.noWhitespaceValidator,
          this.notOnlyNumberValidator,
        ],
      ],
      User_Token: localStorage.getItem("User_Token"),
      userid: localStorage.getItem("UserID"),
    });
    this.geBranchList();
    this.geCrownBranchList();
    //---------------Department Mapping--------------------------
    this.BranchMappingForm = this.formBuilder.group({
      BranchName: ["", Validators.required],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
      id: [0],
      UserIDS: ["", Validators.required],
      UserID: [0, Validators.required],
    });
    //---------------Department Mapping----------------
    this.AddBranchMappingForm = this.formBuilder.group({
      BranchName: [""],
      User_Token: localStorage.getItem("User_Token"),
      CreatedBy: localStorage.getItem("UserID"),
      id: [0],
      UserID: ["", Validators.required],
      approval: ["", Validators.required],
      departments: this.formBuilder.array([]),
      departmentsArray: this.formBuilder.array([]),
    });
    this.geUserList();
    this.geBranchListMapping(0);

    this.getDepartmentNamesList();
    this.prepareTableData([], []);
    this.prepareTableData1([], []);
  }

  minSelectedCheckboxes(min = 1): ValidatorFn {
    return (formArray: AbstractControl) => {
      const totalSelected = (formArray as FormArray).controls
        .map((control) => control.value)
        .filter((value) => value).length;
      return totalSelected >= min ? null : { required: true };
    };
  }

  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || "").trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  notOnlyNumberValidator(control: FormControl) {
    const value = control.value?.trim();

    if (!value) return null;

    const onlyNumber = /^[0-9]+$/.test(value);
    return onlyNumber ? { onlyNumber: true } : null;
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
          const deletePayload = {
            id: value.id,
            User_Token: this.BranchMappingForm.get("User_Token")?.value,
          };

          console.log("Sending delete payload:", deletePayload);

          const apiUrl =
            this._global.baseAPIUrl + "DepartmentMaster/DeleteDepartment";

          this._onlineExamService.postData(deletePayload, apiUrl).subscribe(
            (data) => {
              swal.fire({
                title: "Deleted!",
                text: "Department has been deleted.",
                type: "success",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-primary",
              });

              this.geBranchListMapping(
                this.BranchMappingForm.get("UserIDS")?.value
              );
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
  //------------------Delete Department Mapping-----------------
  deleteDepartmentMapping(value: any) {
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
          const deletePayload = {
            id: value.id,
            User_Token: this.BranchMappingForm.get("User_Token")?.value,
          };

          console.log("Sending delete payload:", deletePayload);

          const apiUrl = this._global.baseAPIUrl + "DepartmentMaster/Delete";

          this._onlineExamService.postData(deletePayload, apiUrl).subscribe(
            (data) => {
              swal.fire({
                title: "Deleted!",
                text: "Department Mapping has been deleted.",
                type: "success",
                buttonsStyling: false,
                confirmButtonClass: "btn btn-primary",
              });

              this.geBranchListMapping(
                this.BranchMappingForm.get("UserIDS")?.value
              );
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

  get FormControls() {
    return this.AddBranchForm.controls;
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
      "DepartmentMaster/GetDepartmentsLists?user_Token=" +
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
      { field: "DepartmentName", header: "DEPARTMENT", index: 3 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 2 },
      { field: "CreatedDate", header: "CREATED DATE", index: 2 },
      { field: "CreatedBy", header: "CREATED BY", index: 2 },
    ];

    tableData.forEach((el, index) => {
      formattedData.push({
        srNo: parseInt(index + 1),
        DepartmentCode: el.DepartmentCode,
        DepartmentName: el.DepartmentName,
        id: el.Id,
        CreatedDate: el.CreatedDate?this.formatDateToDDMMYYYY(el.CreatedDate) : '',
        CreatedBy: el.CreatedBy,
      });
    });
    this.headerList = tableHeader;
    this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
    this.formattedData = formattedData;
    this.loading = false;
  }


  formatDateToDDMMYYYY(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  return `${day}/${month}/${year}`;
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
    this.modalRef.hide();
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

  onSubmit() {
    debugger;
    this.submitted = true;
    if (this.AddBranchForm.invalid) {
      return;
    }

    const formValue = this.AddBranchForm.value;
    console.log("🧾 Add Form Value:", formValue);

    const userToken = localStorage.getItem("user_Token");

    const apiUrl =
      this._global.baseAPIUrl + "DepartmentMaster/Add?user_Token=" + userToken;
    console.log("🌐 Add API URL:", apiUrl);

    this._onlineExamService
      .postData(formValue, apiUrl)
      .subscribe((response: any) => {
        this.toastr.show(
          '<span class="alert-title">Success!</span> <span data-notify="message">Department Saved</span>',
          "",
          {
            timeOut: 3000,
            closeButton: true,
            enableHtml: true,
            tapToDismiss: false,
            positionClass: "toast-top-center",
            toastClass: "ngx-toastr alert alert-success alert-notify",
          }
        );

        this.geBranchList();
        this.OnReset();
        this.modalRef?.hide();
      });
  }

  onSubmitDepartment() {
    this.submitted = true;

    if (this.AddBranchForm.invalid) {
      return;
    }

    const formValue = this.AddBranchForm.value;
    console.log("🧾 Update Form Value:", formValue);

    const userToken = localStorage.getItem("user_Token");

    if (!formValue.Id || Number(formValue.Id) === 0) {
      this.toastr.error("Invalid department ID for update.");
      return;
    }

    const apiUrl =
      this._global.baseAPIUrl +
      "DepartmentMaster/Update?user_Token=" +
      userToken;

    this._onlineExamService
      .postData(formValue, apiUrl)
      .subscribe((response: any) => {
        this.toastr.show(
          '<span class="alert-title">Success!</span> <span data-notify="message">Department Updated</span>',
          "",
          {
            timeOut: 3000,
            closeButton: true,
            enableHtml: true,
            tapToDismiss: false,
            positionClass: "toast-top-center",
            toastClass: "ngx-toastr alert alert-success alert-notify",
          }
        );

        this.geBranchList();
        this.OnReset();
        this.modalRef?.hide();
      });
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
          const apiUrl =
            this._global.baseAPIUrl +
            "BranchMaster/DeleteBranchDeatils?id=" +
            id +
            "&User_Token=" +
            localStorage.getItem("User_Token") +
            "&userid=" +
            localStorage.getItem("UserID");
          this._onlineExamService.DELETEData(apiUrl).subscribe((data) => {
            swal.fire({
              title: "Deleted!",
              text: "Folder has been deleted.",
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
    console.log("Editing department:", row);
    this.isEditMode = true;
    this.AddBranchForm.patchValue({
      Id: row.Id || row.id,
      DepartmentCode: row.DepartmentCode,
      DepartmentName: row.DepartmentName,
      userid: localStorage.getItem("UserID"),
      User_Token: localStorage.getItem("user_Token"),
    });

    this.modalRef = this.modalService.show(template);
  }

  // addBranch(template: TemplateRef<any>) {
  //   this.isEditMode = false;
  //   this.submitted = false;
  //   this.AddBranchForm.reset();
  //   this.AddBranchForm = this.formBuilder.group({
  //     DepartmentName: ["", Validators.required],
  //     DepartmentCode: ["", Validators.required],
  //     User_Token: localStorage.getItem("user_Token"),
  //     userid: localStorage.getItem("UserID"),
  //     Id: [0],
  //   });
  //   this.modalRef = this.modalService.show(template);
  // }

  addBranch(template: TemplateRef<any>) {
    this.isEditMode = false;
    this.submitted = false;

    this.AddBranchForm.reset({
      Id: 0,
      DepartmentName: "",
      DepartmentCode: "",
      User_Token: localStorage.getItem("User_Token"),
      userid: localStorage.getItem("UserID"),
    });

    this.modalRef = this.modalService.show(template);
  }

  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }

  OnReset1() {
    this.Reset = true;
    this.BranchMappingForm.reset({
      User_Token: localStorage.getItem("User_Token"),
      UserID: 0,
      UserIDS: 0,
    });

    this.modalRef.hide();
  }

  geBranchListMapping(userid: any) {
    const apiUrl =
      this._global.baseAPIUrl +
      "DepartmentMaster/GetDepartmentUserMappings?ID=" +
      userid +
      "&user_Token=" +
      this.BranchMappingForm.get("User_Token").value;
    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      console.log(data);

      this._BranchList = data;
      this._FilteredList = data;
      this.prepareTableData1(this._BranchList, this._FilteredList);
    });
  }
  //--------------------Mapping Table-----------------

  formattedData1: any = [];
  headerList1: any;
  immutableFormattedData1: any;
  loading1: boolean = true;
  prepareTableData1(tableData, headerList) {
    let formattedData1 = [];

    let tableHeader: any = [
      { field: "srNo", header: "SR NO", index: 1 },
      { field: "UserName", header: "USER NAME", index: 3 },
      { field: "DepartmentName", header: "DEPARTMENT", index: 2 },
      { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 2 },
      { field: "approval", header: "APPROVAL", index: 2 },
    ];

    tableData.forEach((el, index) => {
      formattedData1.push({
        srNo: parseInt(index + 1),
        UserName: el.UserName,
        DepartmentCode: el.DepartmentCode,
        id: el.Id,
        ddmID: el.userid,
        DepartmentName: el.DepartmentName,
        approval: el.isApproved === 1 ? "YES" : "NO",
      });
    });
    this.headerList1 = tableHeader;

    this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData1));
    this.formattedData1 = formattedData1;
    this.loading = false;
  }

  searchTable1($event) {
    let val = $event.target.value;
    if (val == "") {
      this.formattedData1 = this.immutableFormattedData1;
    } else {
      let filteredArr = [];
      const strArr = val.split(",");
      this.formattedData1 = this.immutableFormattedData1.filter(function (d) {
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
      this.formattedData1 = filteredArr;
    }
  }

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

  geBranchListByUserID(userid: number) {
    this.geBranchListMapping(userid);
  }

  // addBranchMapping(template: TemplateRef<any>) {
  //   this.isEditMapPopup=false;
  //   this.getDepartmentNamesList();
  //   this.modalRef = this.modalService.show(template);
  //   this.BranchMappingForm.controls["UserID"].setValue("");
  // }

  addBranchMapping(template: TemplateRef<any>, isEdit: boolean = false) {
  this.isEditMapPopup = isEdit;  // Set based on passed value
    if (!isEdit) {
    this.AddBranchMappingForm.get("UserID")?.enable();
  }
  this.getDepartmentNamesList();
   this.modalRef = this.modalService.show(template, {
    backdrop: 'static',  
    ignoreBackdropClick: true  
  });
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
    this.AddBranchMappingForm.reset();

    // Reset checkbox selections
    this.selectedDepartmentIds = []; // if you're tracking selected IDs
    this.isAllSelected = false;

    // Optionally mark all controls as untouched
    this.AddBranchMappingForm.markAsPristine();
    this.AddBranchMappingForm.markAsUntouched();
  }

  // onSubmit1() {
  //   this.submitted = true;
  //   if (this.AddBranchMappingForm.invalid) {
  //     alert("Please fill all required fields.");
  //     return;
  //   }

  //   const formData = this.AddBranchMappingForm.value;
  //   const selectedDeptNames = this.departmentList
  //     .filter(dept => formData.departments.includes(dept.Id))
  //     .map(dept => dept.DepartmentName);

  //   console.log("User ID:", formData.UserID);
  //   console.log("Approval:", formData.approval);
  //   console.log("Selected Department IDs:", formData.departments);
  //   console.log("Selected Department Names:", selectedDeptNames);
  // }

  // onSubmit1() {
  //   if (this.AddBranchMappingForm.invalid) {
  //       this.AddBranchMappingForm.markAllAsTouched();
  //     this.ErrorMessage('Please fill all required fields.');
  //     return;
  //   }

  //   const selectedDeptIds = this.departmentsArray.value;
  //   const userId = +this.AddBranchMappingForm.get('UserID')?.value;
  //   const isApprovedRaw = this.AddBranchMappingForm.get('approval')?.value || '';
  //   const isApproved = isApprovedRaw.trim().toLowerCase() === 'yes' ? 1 : 0;

  //   const apiUrl = this._global.baseAPIUrl +
  //     "DepartmentMaster/Insert?user_Token=" +
  //     localStorage.getItem("User_Token");

  //   if (!localStorage.getItem("User_Token")) {
  //     this.ErrorMessage("User token missing. Please login again.");
  //     return;
  //   }

  //   let completedRequests = 0;

  //   selectedDeptIds.forEach((deptId: number) => {
  //     const payload = {
  //       departmentID: deptId,
  //       isApproved: isApproved,
  //       sysUserID: userId,
  //       userid: localStorage.getItem("UserID")
  //     };

  //     this._onlineExamService.postData(payload, apiUrl).subscribe({
  //       next: (response: any) => {
  //         const msg = typeof response === 'string' ? response : response?.Message || 'Success';

  //         if (msg.includes('already exists')) {
  //           this.ErrorMessage(msg);
  //         } else {
  //           this.showSuccessToast(msg);
  //         }

  //         // Count completion
  //         completedRequests++;
  //         if (completedRequests === selectedDeptIds.length) {
  //           this.handleAfterSubmit();
  //         }
  //       },
  //       error: (error) => {
  //         this.ErrorMessage("API call failed. See console for details.");
  //         console.error('❌ API Error:', error);
  //         completedRequests++;
  //         if (completedRequests === selectedDeptIds.length) {
  //           this.handleAfterSubmit();
  //         }
  //       }
  //     });
  //   });
  // }

  // onSubmit1() {
  //   if (this.AddBranchMappingForm.invalid) {
  //     this.AddBranchMappingForm.markAllAsTouched();
  //     this.ErrorMessage("Please fill all required fields.");
  //     return;
  //   }

  //   const selectedDeptIds = this.departmentsArray.value;
  //   const userId = +this.AddBranchMappingForm.get("UserID")?.value;
  //   const isApprovedRaw =
  //     this.AddBranchMappingForm.get("approval")?.value || "";
  //   const isApproved = isApprovedRaw.trim().toLowerCase() === "yes" ? 1 : 0;

  //   const apiUrl =
  //     this._global.baseAPIUrl +
  //     "DepartmentMaster/BulkInsert?user_Token=" +
  //     localStorage.getItem("User_Token");

  //   if (!localStorage.getItem("User_Token")) {
  //     this.ErrorMessage("User token missing. Please login again.");
  //     return;
  //   }

  //   const payload = {
  //     departmentIDs: selectedDeptIds, // <--- array
  //     isApproved: isApproved,
  //     sysUserID: userId,
  //     userid: localStorage.getItem("UserID"),
  //   };

  //   this._onlineExamService.postData(payload, apiUrl).subscribe({
  //     next: (response: any) => {
  //       const msg = response?.Message || "Bulk Insert Success";
  //       this.showSuccessToast(msg);
  //       this.handleAfterSubmit();
  //     },
  //     error: (error) => {
  //       this.ErrorMessage("API call failed. See console for details.");
  //       console.error("❌ Bulk API Error:", error);
  //       this.handleAfterSubmit();
  //     },
  //   });
  // }

  onSubmit1() {
  if (this.AddBranchMappingForm.invalid) {
    this.AddBranchMappingForm.markAllAsTouched();
    this.ErrorMessage("Please fill all required fields.");
    return;
  }

  const selectedDeptIds: number[] = this.departmentsArray.value;
  const userId = +this.AddBranchMappingForm.get("UserID")?.value;
  const isApprovedRaw = this.AddBranchMappingForm.get("approval")?.value || "";
  const isApproved = isApprovedRaw.trim().toLowerCase() === "yes" ? 1 : 0;

  const token = localStorage.getItem("User_Token");
  if (!token) {
    this.ErrorMessage("User token missing. Please login again.");
    return;
  }

  const apiUrl = this._global.baseAPIUrl + "DepartmentMaster/BulkInsert?user_Token=" + token;

  // ✅ Compare old vs new
  const departmentsToDelete = this.originalMappedDepartments.filter(id => !selectedDeptIds.includes(id));
  const departmentsToInsert = selectedDeptIds.filter(id => !this.originalMappedDepartments.includes(id));

  console.log("✅ Insert:", departmentsToInsert);
  console.log("❌ Delete:", departmentsToDelete);

  const payload = {
    departmentIDs: departmentsToInsert, // ✅ new checked departments
    deleteDepartmentIDs: departmentsToDelete, // ❌ unchecked departments
    isApproved: isApproved,
    sysUserID: userId,
    userid: localStorage.getItem("UserID"),
  };

  this._onlineExamService.postData(payload, apiUrl).subscribe({
    next: (response: any) => {
      const msg = response?.Message || "Bulk Insert Success";
      this.showSuccessToast(msg);
      this.handleAfterSubmit();
    },
    error: (error) => {
      this.ErrorMessage("API call failed. See console for details.");
      console.error("❌ Bulk API Error:", error);
      this.handleAfterSubmit();
    }
  });
}

  handleAfterSubmit() {
    this.OnReset1();
    this.OnReset();
    this.modalRef.hide();
    this.geBranchListMapping(0);
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
        toastClass:
          "ngx-toastr alert alert-dismissible alert-danger alert-notify",
      }
    );
  }

  showSuccessToast(msg: any) {
    this.toastr.show(
      '<div class="alert-text"></div> <span class="alert-title" data-notify="title"></span> <span data-notify="message"> ' +
        msg +
        " </span></div>",
      "",
      {
        timeOut: 3000,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: false,
        titleClass: "alert-title",
        positionClass: "toast-top-center",
        toastClass:
          "ngx-toastr alert alert-dismissible alert-success alert-notify", // Use alert-success for green
      }
    );
  }

editBranchMapping(template: TemplateRef<any>, row: any) {

  this.AddBranchMappingForm.reset();
  this.departmentsArray.clear();
  this.originalMappedDepartments = []; 
  this.isEditMapPopup = true;
  const userId = row.ddmID;
  const token = localStorage.getItem("User_Token");

  if (!token) {
    this.ErrorMessage("User token missing. Please login again.");
    return;
  }

  this.AddBranchMappingForm.patchValue({
    UserID: userId,
    approval: row.approval?.toLowerCase() === "yes" ? "yes" : "no",
  });
this.AddBranchMappingForm.get("UserID")?.disable();
  const apiUrl =
    this._global.baseAPIUrl +
    "DepartmentMaster/GetDepartmentMapDetailsByID?user_Token=" +
    token +
    "&userid=" +
    userId;

  this._onlineExamService.getAllData(apiUrl).subscribe({
    next: (mappedDepartments: any[]) => {
      this.originalMappedDepartments = []; 
      mappedDepartments.forEach((d: any) => {
        const deptId = Number(d.departmentID);
        if (deptId) {
          this.departmentsArray.push(new FormControl(deptId));
          this.originalMappedDepartments.push(deptId); 
        } else {
          console.warn("⚠️ Invalid departmentID:", d);
        }
      });

      this.updateSelectAllState();
     this.addBranchMapping(template, true); 
    },
    error: (err) => {
      console.error("Mapping load error", err);
      this.addBranchMapping(template);
    },
  });
}


  paginate1(e) {
    this.first1 = e.first1;
    this.rows1 = e.rows1;
  }
}
