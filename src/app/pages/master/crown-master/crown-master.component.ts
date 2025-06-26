import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators, ValidationErrors, AbstractControl, FormControl } from "@angular/forms";
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
  selector: "app-crown-master",
  templateUrl: "./crown-master.component.html",
  styleUrls: ["./crown-master.component.scss"],
})
export class CrownMasterComponent implements OnInit {
  entries: number = 10;
  selected: any[] = [];
  temp = [];
  activeRow: any;
  SelectionType = SelectionType;
  modalRef: BsModalRef;
  AddBranchForm: FormGroup;
  submitted = false;
  Reset = false;
  sMsg: string = "";
  _BranchList: any;
  BranchForm: FormGroup;
  _FilteredList: any;
  _BranchID: any = 0;
  // _FilteredList:any;
  //_IndexPendingList:any;
  first = 0;
  rows = 10;
  TempDDMId: any;
  isEditModeDoc: boolean = false;
  isEditModeDocDetails:boolean=false;
  editDocumentId: any;

  constructor(
    private modalService: BsModalService,
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants
  ) {}
  ngOnInit() {
    this.AddBranchForm = this.formBuilder.group({
      branch_name: ["", Validators.required],
      branch_code: ["", Validators.required],
      address: ["", Validators.required],
      retention_period: ["", Validators.required], //ruchi
      crown_branch_name: ["", Validators.required],
      detailDocType:["", Validators.required],
      DocType:["", Validators.required],
      User_Token: localStorage.getItem("User_Token"),
      userid: localStorage.getItem("UserID"),
      id: [],
    });
    this.geBranchList();
    this.geCrownBranchList();
    this.getDeptCodeList()
  }

noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const isWhitespace = (control.value || '').trim().length === 0;
  const isValid = !isWhitespace;
  return isValid ? null : { whitespace: true };
}


notOnlyNumberValidator(control: FormControl) {
  const value = control.value?.trim();

  if (!value) return null;

  const onlyNumber = /^[0-9]+$/.test(value);
  return onlyNumber ? { onlyNumber: true } : null;
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
    const userToken = localStorage.getItem("User_Token");
    const userId = localStorage.getItem("UserID");

    const apiUrl =
      this._global.baseAPIUrl +
      "DocumentController/GetList?user_Token=" +
      userToken +
      "&userid=" +
      userId;

    this._onlineExamService.getAllData(apiUrl).subscribe((data: any) => {
      console.log(data);
      this._BranchList = data;
      this._FilteredList = data;
      this.prepareTableData(this._BranchList, this._FilteredList);
    });
  }

  AllCrownBranch: any;
  AllDeptCode:any;

 geCrownBranchList() {
  const userToken = localStorage.getItem("User_Token");
  const userId = localStorage.getItem("UserID"); 

  const apiUrl =
    this._global.baseAPIUrl +
    "DocumentController/GetDocumentsNamesList?user_Token=" +
    userToken +
    "&userid=" +
    userId;

  this._onlineExamService.getAllData(apiUrl).subscribe(
    (data: any) => {
      console.log("AllCrownBranch",data);
      this.AllCrownBranch = data;
      
    },
    (error) => {
      console.error("API Error:", error);
    }
  );
}

 geCrownBranchListForEdit() {
  const userToken = localStorage.getItem("User_Token");
  const userId = localStorage.getItem("UserID"); 

  const apiUrl =
    this._global.baseAPIUrl +
    "DocumentController/GetDocumentsNamesListForEdit?user_Token=" +
    userToken +
    "&userid=" +
    userId;

  this._onlineExamService.getAllData(apiUrl).subscribe(
    (data: any) => {
      console.log("AllCrownBranch",data);
      this.AllCrownBranch = data;
      
    },
    (error) => {
      console.error("API Error:", error);
    }
  );
}


// geCrownBranchList(): Promise<any> {
//   return new Promise((resolve, reject) => {
//     const userToken = localStorage.getItem("User_Token");
//     const userId = localStorage.getItem("UserID");

//     const apiUrl =
//       this._global.baseAPIUrl +
//       "DocumentController/GetDocumentsNamesList?user_Token=" +
//       userToken +
//       "&userid=" +
//       userId;

//     this._onlineExamService.getAllData(apiUrl).subscribe(
//       (data: any) => {
//         this.AllCrownBranch = data;
//         resolve(data);
//       },
//       (error) => {
//         console.error("API Error:", error);
//         reject(error);
//       }
//     );
//   });
// }




 getDeptCodeList() {
  const userToken = localStorage.getItem("User_Token");
  const userId = localStorage.getItem("UserID"); 

  const apiUrl =
    this._global.baseAPIUrl +
    "DocumentController/GetDeptCodeList?user_Token=" +
    userToken +
    "&userid=" +
    userId;

  this._onlineExamService.getAllData(apiUrl).subscribe(
    (data: any) => {
      console.log("AllDeptCode",data);
      this.AllDeptCode = data;
    },
    (error) => {
      console.error("API Error:", error);
    }
  );
}

// getDeptCodeList(): Promise<any> {
//   return new Promise((resolve, reject) => {
//     const userToken = localStorage.getItem("User_Token");
//     const userId = localStorage.getItem("UserID");

//     const apiUrl =
//       this._global.baseAPIUrl +
//       "DocumentController/GetDeptCodeList?user_Token=" +
//       userToken +
//       "&userid=" +
//       userId;

//     this._onlineExamService.getAllData(apiUrl).subscribe(
//       (data: any) => {
//         this.AllDeptCode = data;
//         resolve(data);
//       },
//       (error) => {
//         console.error("API Error:", error);
//         reject(error);
//       }
//     );
//   });
// }



  formattedData: any = [];
  headerList: any;
  immutableFormattedData: any;
  loading: boolean = true;


prepareTableData(tableData, headerList) {
  let formattedData = [];
  let tableHeader: any = [
    { field: "srNo", header: "SR NO", index: 1 },
    { field: "DocumentType", header: "DOCUMENT TYPE", index: 3 },
    { field: "DetailDocumentType", header: "DETAIL DOCUMENT TYPE", index: 2 },
    { field: "RetentionPeriod", header: "RETENTION PERIOD", index: 2 },
    { field: "DepartmentCode", header: "DEPARTMENT CODE", index: 2 },
    { field: "CreatedDate", header: "CREATED DATE", index: 2 },
    { field: "CreatedBy", header: "CREATED BY", index: 2 },
  ];

  tableData.forEach((el, index) => {
    const retention = el.RetentionPeriod ? `${el.RetentionPeriod} Years` : '';

    formattedData.push({
      srNo: index + 1,
      DetailDocumentType: el.DetailDocumentType,
      DocumentType: el.DocumentType,
      RetentionPeriod: retention,
      id: el.Id,
      documentID:el.documentID,
      DepartmentCode: el.DepartmentCode,
      CreatedDate: el.CreatedDate?this.formatDateToDDMMYYYY(el.CreatedDate) : '',
      CreatedBy: el.CreatedBy
    });
  });

  this.headerList = tableHeader;
  this.immutableFormattedData = JSON.parse(JSON.stringify(formattedData));
  debugger;
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
    // console.log($event.target.value);

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
  this.AddBranchForm.reset();            
  this.submitted = false; 
  this.isEditModeDoc = false;
  this.editDocumentId = null;                  
  this.modalRef.hide();                   
}


  _DepartmentList: any;
  getDepartmentList() {
    const apiUrl =
      this._global.baseAPIUrl +
      "Department/GetList?user_Token=" +
      localStorage.getItem("User_Token");
    this._onlineExamService.getAllData(apiUrl).subscribe((data: {}) => {
      this._DepartmentList = data;
      //  this._FilteredList = data
      //this.itemRows = Array.from(Array(Math.ceil(this.adresseList.length/2)).keys())
    });
  }
  onSubmit() {
    this.submitted = true;
    console.log(this.AddBranchForm.value);

    // if (this.AddBranchForm.invalid) {
    //   return;
    // }

    const userToken = localStorage.getItem("User_Token");
    const apiUrl = `${this._global.baseAPIUrl}DocumentController/Insert?user_Token=${userToken}`;

   const body: any = {
  DocumentType: this.AddBranchForm.value.branch_name,
  userid: localStorage.getItem("UserID"),
};

if (this.isEditModeDoc && this.editDocumentId) {
  body.DocumentID = this.editDocumentId;
}

    this._onlineExamService.postData(body, apiUrl).subscribe(
      (data: any) => {
        this.toastr.show(
          '<div class="alert-text"</div> <span class="alert-title" data-notify="title">Success!</span> <span data-notify="message">Document Saved</span></div>',
          "",
          {
            timeOut: 3000,
            closeButton: true,
            enableHtml: true,
            tapToDismiss: false,
            titleClass: "alert-title",
            positionClass: "toast-top-center",
            toastClass:
              "ngx-toastr alert alert-dismissible alert-success alert-notify",
          }
        );

        this.geBranchList();
        this.OnReset();
      },
      (error) => {
        console.error("Error saving document:", error);
      }
    );
   
      this.geCrownBranchList();
        this.getDeptCodeList();
  }


onSubmitDetails() {
  this.submitted = true;

  // if (this.AddBranchForm.invalid) {
  //   this.toastr.error('Please fill all required fields correctly.', 'Validation Error');
  //   return;
  // }

  const formData: any = {
    documentId: 0, 
    userid: Number(localStorage.getItem("UserID")),
    departmentID: this.AddBranchForm.value.branch_code,
    DetailDocumentType: this.AddBranchForm.value.detailDocType,
    DocumentType: this.AddBranchForm.value.DocType,
    RetentionPeriod: this.AddBranchForm.value.retention_period
  };

  if (this.TempDDMId) {
    formData.Id = this.TempDDMId;
  }

  const userToken = localStorage.getItem("User_Token");
  const apiUrl = this._global.baseAPIUrl + "DocumentController/InsertDetails?user_Token=" + userToken;

  this._onlineExamService.postData(formData, apiUrl).subscribe({
    next: (res) => {
      this.toastr.success(res?.Message || 'Document Details submitted successfully', 'Success');
      this.AddBranchForm.reset();
      this.OnReset();
      this.geBranchList();
      this.submitted = false;
      this.TempDDMId = null; 
    },
    error: (err) => {
      this.toastr.error('Failed to submit Document Details', 'Error');
      console.error(err);
    }
  });
}


  // deleteBrnach(id: any) {
  //   swal
  //     .fire({
  //       title: "Are you sure?",
  //       text: "You won't be able to revert this!",
  //       type: "warning",
  //       showCancelButton: true,
  //       buttonsStyling: false,
  //       confirmButtonClass: "btn btn-danger",
  //       confirmButtonText: "Yes, delete it!",
  //       cancelButtonClass: "btn btn-secondary",
  //     })
  //     .then((result) => {
  //       if (result.value) {
  //         const apiUrl =
  //           this._global.baseAPIUrl +
  //           "BranchMaster/DeleteBranchDeatils?id=" +
  //           id +
  //           "&User_Token=" +
  //           localStorage.getItem("User_Token") +
  //           "&userid=" +
  //           localStorage.getItem("UserID");
  //         this._onlineExamService.DELETEData(apiUrl).subscribe((data) => {
  //           swal.fire({
  //             title: "Deleted!",
  //             text: "Folder has been deleted.",
  //             type: "success",
  //             buttonsStyling: false,
  //             confirmButtonClass: "btn btn-primary",
  //           });
  //           this.geBranchList();
  //         });
  //       }
  //     });
  // }
  _SingleDepartment: any;


extractNumber(value: string): number | null {
  if (!value || value.trim() === "") {
    return null;
  }

  if (value.toLowerCase().includes("permanent")) {
    return 0;
  }

  const match = value.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}


// editBranch(template: TemplateRef<any>, row: any) {
//   this._SingleDepartment = row;
// debugger
//   const apiUrl = this._global.baseAPIUrl + "DocumentController/GetDepartmentByDetails";
//   const userToken = localStorage.getItem("User_Token");

//   const payload = {
//     DetailDocumentType: row.DetailDocumentType,
//     DocumentType: row.DocumentType,
//    RetentionPeriod: this.extractNumber(row.RetentionPeriod)
//   };

//   // Pass token as query param
//   const finalUrl = `${apiUrl}?user_Token=${userToken}`;

//   this._onlineExamService.postData(payload, finalUrl).subscribe({
//     next: (response: any) => {
//        console.log("RESPONSES",response)
//       const deptId = response?.departmentID ?? null;
//         this.TempDDMId = response?.Id ?? null;

//       this.AddBranchForm.patchValue({
//         detailDocType: row.DetailDocumentType,
//         DocType: this.getDocTypeIdByName(row.DocumentType),
//         retention_period: this.extractNumber(row.RetentionPeriod),
//         branch_code: deptId,
//         id: row.id|| 0
//       });

//       this.modalRef = this.modalService.show(template);
//     },
//     error: (err) => {
//       this.toastr.error("Unable to fetch department info", "Error");
//       console.error("API Error:", err);
//     }
//   });
// }



// editBranch(template: TemplateRef<any>, row: any) {
//   this._SingleDepartment = row;
//   console.log("Editing row",row);
//    this.AddBranchForm.patchValue({
//     detailDocType: row.DetailDocumentType,
//     DocType: this.getDocTypeIdByName(row.DocumentType), 
//     retention_period: row.RetentionPeriod,
//     branch_code: row.branch_code || null, 
//     id: row.id || 0
//   });

//   this.modalRef = this.modalService.show(template);
// }

 
// editBranch(template: TemplateRef<any>, row: any) {
//   this._SingleDepartment = row;
//   this.submitted = false; 
//   this.TempDDMId = null;
 
//   const apiUrl = this._global.baseAPIUrl + "DocumentController/GetDepartmentByDetails";
//   const userToken = localStorage.getItem("User_Token");
 
//   const payload = {
//     DetailDocumentType: row.DetailDocumentType,
//     DocumentType: row.DocumentType,
//     RetentionPeriod: this.extractNumber(row.RetentionPeriod)
//   };
 
//   const finalUrl = `${apiUrl}?user_Token=${userToken}`;
 
//   this._onlineExamService.postData(payload, finalUrl).subscribe({
//     next: (response: any) => {
//       console.log("RESPONSES", response);
 
//       const deptId = response?.departmentID ?? null;
//       this.TempDDMId = response?.Id ?? null;
 
//       this.AddBranchForm = this.formBuilder.group({
//         detailDocType: [row.DetailDocumentType, [Validators.required, this.noWhitespaceValidator]],
//         DocType: [this.getDocTypeIdByName(row.DocumentType), Validators.required],
//         retention_period: [this.extractNumber(row.RetentionPeriod), Validators.required],
//         branch_code: [deptId, Validators.required],
//         User_Token: [localStorage.getItem("User_Token")],
//         userid: [localStorage.getItem("UserID")],
//         id: [row.id || 0]
//       });
 
//       this.modalRef = this.modalService.show(template);
//       this.geCrownBranchList();
//       this.getDeptCodeList();
//     },
//     error: (err) => {
//       this.toastr.error("Unable to fetch department info", "Error");
//       console.error("API Error:", err);
//     }
//   });
// }
 
 
// getDocTypeIdByName(name: string): number | null {
//   const match = this.AllCrownBranch.find(doc => doc.DocumentType === name);
//   return match ? match.Id : null;
// }
 

editBranch(template: TemplateRef<any>, row: any) {
  this._SingleDepartment = row;
  this.submitted = false;
  this.TempDDMId = null;
  this.isEditModeDocDetails=true;
  Promise.all([this.geCrownBranchListForEdit(), this.getDeptCodeList()])
    .then(() => {
      const apiUrl = this._global.baseAPIUrl + "DocumentController/GetDepartmentByDetails";
      const userToken = localStorage.getItem("User_Token");

      const payload = {
        DetailDocumentType: row.DetailDocumentType,
        DocumentType: row.DocumentType,
        RetentionPeriod: this.extractNumber(row.RetentionPeriod)
      };

      const finalUrl = `${apiUrl}?user_Token=${userToken}`;

      this._onlineExamService.postData(payload, finalUrl).subscribe({
        next: (response: any) => {
          console.log("RESPONSES", response);

          const deptId = response?.departmentID === 0 ? null : response?.departmentID;
          this.TempDDMId = response?.Id ?? null;

          // 🔹 Find matching IDs from names
          const docTypeId = this.getDocTypeIdByName(row.DocumentType);
          const deptCodeId = this.getDeptIdByCode(response?.DepartmentCode); // helper below
       console.log("docTypeId",docTypeId , "deptCodeId",deptCodeId);
          this.AddBranchForm = this.formBuilder.group({
            detailDocType: [row.DetailDocumentType, [Validators.required, this.noWhitespaceValidator]],
            DocType: [docTypeId, Validators.required],                   // dropdown uses ID
            retention_period: [this.extractNumber(row.RetentionPeriod), Validators.required],
            branch_code: [deptCodeId, Validators.required],              // dropdown uses ID
            User_Token: [userToken],
            userid: [localStorage.getItem("UserID")],
            id: [row.id || 0]
          });

        setTimeout(() => {
  this.modalRef = this.modalService.show(template);
});
        },
        error: (err) => {
          this.toastr.error("Unable to fetch department info", "Error");
          console.error("API Error:", err);
        }
      });
    })
    .catch((err) => {
      this.toastr.error("Failed to load dropdown data", "Error");
      console.error("Dropdown loading error:", err);
    });
}

editDocuments(template: TemplateRef<any>, row: any) {
  console.log("row wow", row);
  debugger;

  this.submitted = false;
  this.isEditModeDoc = true;
  this.editDocumentId = row.documentID;

  // Reinitialize the form
  this.AddBranchForm = this.formBuilder.group({
    branch_name: [row.DocumentType || '', [Validators.required, this.noWhitespaceValidator, this.notOnlyNumberValidator]]
  });

  // Open the modal
  this.modalRef = this.modalService.show(template);
}

getDocTypeIdByName(name: string): number | null {
  const match = this.AllCrownBranch.find(doc => doc.DocumentType === name);
  return match ? match.Id : null;
}

getDeptIdByCode(code: string): number | null {
  const match = this.AllDeptCode.find(dept => dept.DepartmentCode === code);
  return match ? match.departmentID : null;
}


deleteDocumentDetail(template: TemplateRef<any>, value: any) {
  debugger;

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
        const userId = Number(localStorage.getItem("UserID"));
        const userToken = localStorage.getItem("User_Token");

        if (!userId || !userToken) {
          swal.fire("Error", "Missing user credentials. Please login again.", "error");
          return;
        }

        const deletePayload = {
          Id: value.id,
          documentID:value.documentID,
          userid: userId,
          User_Token: userToken,
        };

        console.log("Sending delete payload:", deletePayload);

        const apiUrl = this._global.baseAPIUrl + "DocumentDetails/Delete";

        // ✅ Fixed param order: postData(data, url)
        this._onlineExamService.postData(deletePayload, apiUrl).subscribe(
          (res) => {
              console.log("Delete response:", res);
            swal.fire({
              title: "Deleted!",
              text: "Document detail has been deleted.",
              type: "success",
              buttonsStyling: false,
              confirmButtonClass: "btn btn-primary",
            });

            this.geBranchList();
          },
          (error) => {
            console.error("Delete error:", error);
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


  // addBranch(template: TemplateRef<any>) {
  //   this.submitted = false;
  //     this.TempDDMId = null;
  //   this.AddBranchForm.reset();
  //   this.AddBranchForm = this.formBuilder.group({
  //     branch_name: ["", Validators.required],
  //     branch_code: ["", Validators.required],
  //     address: ["", Validators.required],
  //     crown_branch_name: ["", Validators.required],
  //     retention_period: ["", Validators.required], //ruchi
  //   detailDocType:["", Validators.required],
  //   DocType :["", Validators.required],
  //     User_Token: localStorage.getItem("User_Token"),
  //     userid: localStorage.getItem("UserID"),
  //     id: [],
  //   });
  //   this.modalRef = this.modalService.show(template);
  //   this.geCrownBranchList();
  //   this.getDeptCodeList();
  // }

  // addDocumentType(template: TemplateRef<any>) {
  //   this.submitted = false;
  //   this.AddBranchForm.reset();
  //   this.AddBranchForm = this.formBuilder.group({
  //     branch_name: ["", Validators.required],
  //     branch_code: ["", Validators.required],
  //     address: ["", Validators.required],
  //     crown_branch_name: ["", Validators.required],
  //     retention_period: ["", Validators.required], //ruchi
  //          detailDocType:["", Validators.required],
  //          DocType:["", Validators.required],
  //     User_Token: localStorage.getItem("User_Token"),
  //     userid: localStorage.getItem("UserID"),
  //     id: [],
  //   });
  //   this.modalRef = this.modalService.show(template);
  // }


  addBranch(template: TemplateRef<any>) {
  this.submitted = false;
  this.TempDDMId = null;
  this.isEditModeDocDetails=false;

debugger;
  this.AddBranchForm = this.formBuilder.group({
   detailDocType: ["", [Validators.required, this.noWhitespaceValidator]],
    DocType: ["", Validators.required],
    retention_period: ["", Validators.required],
    branch_code: ["", Validators.required],
    User_Token: [localStorage.getItem("User_Token")],
    userid: [localStorage.getItem("UserID")],
    id: [],
  });

  this.modalRef = this.modalService.show(template);
  this.geCrownBranchList();
  this.getDeptCodeList();
}


addDocumentType(template: TemplateRef<any>) {
  this.submitted = false;
  this.isEditModeDoc = false;
 
  this.AddBranchForm = this.formBuilder.group({
    branch_name: ["", [Validators.required, this.noWhitespaceValidator,this.notOnlyNumberValidator]],
  });

  this.modalRef = this.modalService.show(template);
}



  paginate(e) {
    this.first = e.first;
    this.rows = e.rows;
  }
}
