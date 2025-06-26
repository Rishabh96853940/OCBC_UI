import { Component, Inject, OnInit, NgZone, PLATFORM_ID, ViewChild, TemplateRef } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import dataviz from "@amcharts/amcharts4/themes/dataviz";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
am4core.useTheme(am4themes_animated);
import { Globalconstants } from "../../../Helper/globalconstants";
import { OnlineExamServiceService } from "../../../Services/online-exam-service.service";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
am4core.useTheme(dataviz);
am4core.useTheme(am4themes_animated);
import { AxisRenderer } from '@amcharts/amcharts4/charts';
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import moment from "moment";
import { from } from "rxjs";

@Component({
  selector: "app-dashboard",
  templateUrl: "dashboard.component.html",
  styleUrls: ["dashboard.component.css"]
})

export class DashboardComponent implements OnInit {
  readonly DEFAULT_SLICE_STROKE_WIDTH: number = 0;
  readonly DEFAULT_SLICE_OPACITY: number = 1;
  readonly DEFAULT_ANIMATION_START_ANGLE: number = -90;
  readonly DEFAULT_ANIMATION_END_ANGLE: number = -90;
  private chart: am4charts.XYChart;
  downloadCount: any;
  displayStyle: string;
  type: any;
  private _TempFilePath: any;
  FilePath: any;
  fileExt: any;
  pieData: any;
  pieData1: any;
  pieData2: any;
  ContentSearchForm: FormGroup
  MonthForm: FormGroup;
  pieData3: any;
  chartOptions: any;
  basicData: any;
  BatchDispatch: any;
  LANDispatch: any;
  BatchInward: any;
  LANInward: any;
  BatchHealth: any;
  LANHealth: any;
  BatchExpection: number = 25;
  LANExpection: any;
  SubFolderCnt: any;
  JPGFIles: any;
  LoginLastWeek: any;
  LoginTillDate: any;
  BEYOUNDTAT: any;
  TATIN: any;
  OCRFilesInProcess: any;
  OCRFilesConverted: any;
  PageCount: any;
  FileNotReceived: any;
  Reject: any;
  Searched: any;
  Month: any;
  Viewed: any;
  currentDate: Date = new Date();
  _FilteredList: any;
  _IndexPendingList: any;
  FileAckPending: any;
  FileAckDone: any;
  CourierAckPending: any;
  CourierAckDone: any;
  monthyear: any;
  selectedMonth = new Date();
  periodOptions = [
    { label: 'All', value: '0' },
    { label: 'Current Month', value: '1' },
    { label: 'Past Month', value: '2' },
    { label: 'Past 3 Months', value: '3' }
  ];
  dateselection = true;
  selectedPeriod: string = '0';
  selectedPeriodRetrieval: string = '0';
  fromdate: string;
  todate: string;
  fromdateret: string;
  todateret: string;
  PODACk: any;
  NotYetDisptach: any;
  PODInstratt: any;
  DumpACk: any;
  DumpNotYetDisptach: any;
  DumpInstratt: any;
  Extra: any;
  Missing: number = 9;
  InComplete: any;
  Complete: any;
  first = 0;
  rows = 10;
  _HeaderList: any;
  MakerUploaded: any;
  first1: any = 0;
  rows1: any = 0;
  basicOptions: any;
  modelRef: BsModalRef;
  formBuilder: any;
  maxDate: Date;

  @ViewChild('InwardFormPopup') InwardFormPopup: any;

  constructor(
    private _onlineExamService: OnlineExamServiceService,
    private _global: Globalconstants,
    private modalService: BsModalService,
    private fb: FormBuilder
  ) {
    this.basicData = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec",],
      datasets: [
        {
          label: "Pickup Request",
          backgroundColor: "#FF5733", // Bright Orange-Red
          borderColor: "#FF4500", // Orange Red
          data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
          label: "Courier Ack",
          backgroundColor: "#33FF57", // Bright Green
          borderColor: "#228B22", // Forest Green
          data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
          label: "File Ack",
          backgroundColor: "#3357FF", // Bright Blue
          borderColor: "#0000CD", // Medium Blue
          data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
          label: "Scrutiny",
          backgroundColor: "#FF33FF", // Bright Magenta
          borderColor: "#8A2BE2", // Blue Violet
          data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
          label: "Branch Exception",
          backgroundColor: "#FFD700", // Gold
          borderColor: "#FFA500", // Orange
          data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
          label: "Storage",
          backgroundColor: "#8A2BE2", // Blue Violet
          borderColor: "#4B0082", // Indigo
          data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
          label: "Storage Ack",
          backgroundColor: "#FF4500", // Orange Red
          borderColor: "#FF6347", // Tomato
          data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
          label: "Outward",
          backgroundColor: "#00CED1", // Dark Turquoise
          borderColor: "#4682B4", // Steel Blue
          data: [65, 59, 80, 81, 56, 55, 40],
        },
      ],
    };

    this.basicOptions = {
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Months",
          },
        },
        y: {
          title: {
            display: true,
            text: "Value",
          },
          min: 0,
          max: 100,
        },
      },
    };

    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem: any) {
              return tooltipItem.label + ": " + tooltipItem.raw;
            },
          },
        },
      },
    };
  }

  data1: any;
  PickupIN_TAT: any;
  PickupOUT_TAT: any;
  data2: any;
  data3: any;
  data4: any;
  data5: any;
  data6: any;
  data7: any;
  data8: any;
  data9: any;
  data10: any;
  data11: any;
  data12: any;
  data13: any;
  data14: any;
  data15: any;
  data16: any;
  data17: any;
  OutFiles: any;
  InFiles: any;
  PermOutFiles: any;
  DestroyedFiles: any;
  RetrievalRequestFiles: any;
  SchedulePending: any;
  lan_inv_done_disbdate: any;
  lan_inv_pending_disbdate: any;

  ngOnInit() {
    const userID = localStorage.getItem('UserID'); // Get userID from localStorage
    if (!userID) {
      console.error('UserID not found in localStorage');
      return; // Handle the error or fallback
    }

    const timeperiod = Number(this.selectedPeriod); // Convert selectedPeriod to number
    const timeperiodRetrieval = Number(this.selectedPeriodRetrieval); // Convert selectedPeriod to number
    this.ContentSearchForm = this.fb.group({
      SearchBy: ["0", Validators.required],
      File_No: ['', Validators.required],
      fromdate: ["", Validators.required],
      todate: ['', Validators.required],
      fromdateretrieval: ["", Validators.required],
      todateretrieval: ['', Validators.required],
      id: localStorage.getItem('UserID'),
    });

    const currentDate = new Date();
    const formattedDate = `${('0' + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()}`;

    this.MonthForm = this.fb.group({
      fromMonth: [formattedDate]
    });

    this.maxDate = new Date(); // Set the current date as the maximum date

    this.ContentSearchForm.get('fromdate')?.valueChanges.subscribe((fromDate) => {
      const toDateControl = this.ContentSearchForm.get('todate');
      if (fromDate) {
        toDateControl?.setValidators([
          Validators.required,
          (control) => {
            const toDate = control.value;
            return toDate && new Date(toDate) >= new Date(fromDate)
              ? null
              : { invalidToDate: true };
          },
        ]);
        toDateControl?.updateValueAndValidity(); // Ensure changes are reflected
      }
    });

    this.ContentSearchForm.get('fromdateretrieval')?.valueChanges.subscribe((fromDate) => {
      const toDateControl = this.ContentSearchForm.get('todateretrieval');
      if (fromDate) {
        toDateControl?.setValidators([
          Validators.required,
          (control) => {
            const toDate = control.value;
            return toDate && new Date(toDate) >= new Date(fromDate)
              ? null
              : { invalidToDate: true };
          },
        ]);
        toDateControl?.updateValueAndValidity(); // Ensure changes are reflected
      }
    });

    this.monthyear = "";
    this.StatusList(Number(userID), timeperiod, "", "", formattedDate);
    this.StatusListRetrieval(Number(userID), timeperiodRetrieval, "", "");
  }

  searchData() {
    this.fromdate = this.ContentSearchForm.get('fromdate')?.value;
    this.todate = this.ContentSearchForm.get('todate')?.value;
    this.timeperiod1 = 4;
    this.Month = "All"
    this.selectedPeriod = "0";
    this.ContentSearchForm.patchValue({
      timeperiod: "All"
    });

    if (this.fromdate && new Date(this.fromdate) > this.currentDate) {
      alert('From Date cannot exceed the current date. Please select a valid From Date.');
      return;
    }

    if (this.fromdate && this.todate && new Date(this.todate) < new Date(this.fromdate)) {
      alert('To Date cannot be earlier than From Date. Please select a valid date range.');
      return;
    }

    const userID = localStorage.getItem('UserID')
    this.StatusList(Number(userID), this.timeperiod1, this.fromdate, this.todate, this.monthyear);
  }

  searchDataRetrieval() {
    this.fromdateret = this.ContentSearchForm.get('fromdateretrieval')?.value;
    this.todateret = this.ContentSearchForm.get('todateretrieval')?.value;
    this.timeperiodretrieval = 4;
    this.Month = "All"
    this.selectedPeriod = "0";
    this.ContentSearchForm.patchValue({
      timeperiod: "All"
    });

    if (this.fromdateret && new Date(this.fromdateret) > this.currentDate) {
      alert('From Date cannot exceed the current date. Please select a valid From Date.');
      return;
    }

    if (this.fromdateret && this.todateret && new Date(this.todateret) < new Date(this.fromdateret)) {
      alert('To Date cannot be earlier than From Date. Please select a valid date range.');
      return;
    }

    const userID = localStorage.getItem('UserID')
    this.StatusListRetrieval(Number(userID), this.timeperiodretrieval, this.fromdateret, this.todateret);
  }

  refreshPage() {
    setTimeout(() => {
      window.location.reload();
    }, 0);
  }

  timeperiod1: number = 0;
  FilterData(ID: string) {
    if (ID === '0') {
      this.dateselection = true;
    }
    else {
      this.dateselection = false;
    }
    this.ContentSearchForm.patchValue({
      fromdate: '',
      todate: ''
    });
    const selectedOption = this.periodOptions.find(option => option.value === ID);
    this.Month = selectedOption ? selectedOption.label : "Today";
    const timeperiod = Number(ID);
    this.timeperiod1 = timeperiod;
    this.StatusList(Number(localStorage.getItem('UserID')), this.timeperiod1, "", "", this.monthyear);
  }

  MonthYearFilter() {
    this.monthyear = this.MonthForm.controls['fromMonth'].value;

    if (this.timeperiod1 === 0 || this.timeperiod1 === 4) {
      this.fromdate = this.ContentSearchForm.get('fromdate')?.value;
      this.todate = this.ContentSearchForm.get('todate')?.value;
      this.timeperiod1 = 4;
      this.Month = "All"
      this.selectedPeriod = "0";
      this.ContentSearchForm.patchValue({
        timeperiod: "All"
      });

      const userID = localStorage.getItem('UserID')
      this.StatusList(Number(userID), this.timeperiod1, this.fromdate, this.todate, this.monthyear);
    }
    else {
      this.StatusList(Number(localStorage.getItem('UserID')), this.timeperiod1, "", "", this.monthyear);
    }
  }

  timeperiodretrieval: number = 0;
  FilterDataRetrieval(ID: string) {
    if (ID === '0') {
      this.dateselection = true;
    }
    else {
      this.dateselection = false;
    }
    this.ContentSearchForm.patchValue({
      fromdateretrieval: '',
      todateretrieval: ''
    });
    const selectedOption = this.periodOptions.find(option => option.value === ID);
    this.Month = selectedOption ? selectedOption.label : "Today";
    const timeperiod = Number(ID);
    this.timeperiodretrieval = timeperiod;
    this.StatusListRetrieval(Number(localStorage.getItem('UserID')), this.timeperiodretrieval, "", "");
  }

  StatusList(id: any, timeperiod: number, fromdate: any, todate: any, monthyear: any) {
    const formattedFromDate = fromdate ? moment(fromdate).format('YYYY-MM-DD') : '';
    const formattedToDate = todate ? moment(todate).format('YYYY-MM-DD') : '';
    const formattedMonthYear = monthyear ? moment(monthyear, 'MM/YYYY').isValid() ? moment(monthyear, 'MM/YYYY').format('MM/YYYY') : '' : '';

    const apiUrl = this._global.baseAPIUrl + "AvansePickupRequest/DashboardCount?USERId=" + localStorage.getItem("UserID") + "&user_Token=" + localStorage.getItem("User_Token") + "&timeperiod=" + timeperiod + "&fromDate=" + formattedFromDate + "&toDate=" + formattedToDate + "&monthyear=" + formattedMonthYear;
    this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: any) => {

      this.data1 = data.filter(
        (item) => item.activity === "Pickup").length > 0 ? data.filter(
          (item) => item.activity === "Pickup")[0].Counts : 0;

      this.PickupIN_TAT = data.filter(
        (item) => item.activity === "PickupIN_TAT").length > 0 ? data.filter(
          (item) => item.activity === "PickupIN_TAT")[0].Counts : 0;

      this.PickupOUT_TAT = data.filter(
        (item) => item.activity === "PickupOUT_TAT").length > 0 ? data.filter(
          (item) => item.activity === "PickupOUT_TAT")[0].Counts : 0;

      this.data2 = data.filter(
        (item) => item.activity === "Schedule").length > 0 ? data.filter(
          (item) => item.activity === "Schedule")[0].Counts : 0;

      this.SchedulePending = data.filter(
        (item) => item.activity === "SchedulePending").length > 0 ? data.filter(
          (item) => item.activity === "SchedulePending")[0].Counts : 0;

      this.data3 = data.filter(
        (item) => item.activity === "file_inventory_pending").length > 0 ? data.filter(
          (item) => item.activity === "file_inventory_pending")[0].Counts : 0;

      this.data4 = data.filter(
        (item) => item.activity === "file_inventory_done").length > 0 ? data.filter(
          (item) => item.activity === "file_inventory_done")[0].Counts : 0;

      this.data14 = data.filter(
        (item) => item.activity === "lan_inventory_done").length > 0 ? data.filter(
          (item) => item.activity === "lan_inventory_done")[0].Counts : 0;

      this.data17 = data.filter(
        (item) => item.activity === "lan_inventory_pending").length > 0 ? data.filter(
          (item) => item.activity === "lan_inventory_pending")[0].Counts : 0;

      this.OutFiles = data.filter(
        (item) => item.activity === "OutFiles").length > 0 ? data.filter(
          (item) => item.activity === "OutFiles")[0].Counts : 0;

      this.InFiles = data.filter(
        (item) => item.activity === "InFiles").length > 0 ? data.filter(
          (item) => item.activity === "InFiles")[0].Counts : 0;

      this.PermOutFiles = data.filter(
        (item) => item.activity === "PermOutFiles").length > 0 ? data.filter(
          (item) => item.activity === "PermOutFiles")[0].Counts : 0;

      this.DestroyedFiles = data.filter(
        (item) => item.activity === "DestroyedFiles").length > 0 ? data.filter(
          (item) => item.activity === "DestroyedFiles")[0].Counts : 0;

      this.RetrievalRequestFiles = data.filter(
        (item) => item.activity === "RetrievalRequestFiles").length > 0 ? data.filter(
          (item) => item.activity === "RetrievalRequestFiles")[0].Counts : 0;

      this.lan_inv_done_disbdate = data.filter(
        (item) => item.activity === "lan_inv_done_disbdate").length > 0 ? data.filter(
          (item) => item.activity === "lan_inv_done_disbdate")[0].Counts : 0;

      this.lan_inv_pending_disbdate = data.filter(
        (item) => item.activity === "lan_inv_pending_disbdate").length > 0 ? data.filter(
          (item) => item.activity === "lan_inv_pending_disbdate")[0].Counts : 0;

      this.loadChartsData()
    });
  }

  OpenData(status: number, template: any) {
    let timeperiod = this.timeperiod1;
    let formattedFromDate = '';
    let formattedToDate = '';
    const formattedMonthYear = this.monthyear ? moment(this.monthyear, 'MM/YYYY').isValid() ? moment(this.monthyear, 'MM/YYYY').format('MM/YYYY') : '' : '';

    if (timeperiod === 4) {
      formattedFromDate = this.fromdate ? moment(this.fromdate).format('YYYY-MM-DD') : '';
      formattedToDate = this.todate ? moment(this.todate).format('YYYY-MM-DD') : '';
    }
    else {
      formattedFromDate = '';
      formattedToDate = '';
    }

    let apiUrl = this._global.baseAPIUrl + "AvansePickupRequest/Dashboard?USERId=" + localStorage.getItem("UserID") + "&user_Token=" + localStorage.getItem("User_Token") + "&timeperiod=" + timeperiod + "&fromDate=" + formattedFromDate + "&toDate=" + formattedToDate + "&monthyear=" + formattedMonthYear;
    if (status >= 1 && status <= 10) {
      apiUrl += "&status=" + status;
    }

    this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: any) => {
      this.prepareTableData1(data, data, status);
      this.modelRef = this.modalService.show(template);
    });
  }

  StatusListRetrieval(id: any, timeperiod: number, fromdate: any, todate: any) {
    const formattedFromDate = fromdate ? moment(fromdate).format('YYYY-MM-DD') : '';
    const formattedToDate = todate ? moment(todate).format('YYYY-MM-DD') : '';

    const apiUrl = this._global.baseAPIUrl + "Retrival/RetrievalDashboard?USERId=" + localStorage.getItem("UserID") + "&user_Token=" + localStorage.getItem("User_Token") + '&status=' + 7 + "&timeperiod=" + timeperiod + "&fromDate=" + formattedFromDate + "&toDate=" + formattedToDate;
    this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: any) => {

      this.data10 = data.filter(
        (item) => item.activity === "RetrievalRequest").length > 0 ? data.filter(
          (item) => item.activity === "RetrievalRequest")[0].Counts : 0;

      this.data11 = data.filter(
        (item) => item.activity === "RetrievalDispatched").length > 0 ? data.filter(
          (item) => item.activity === "RetrievalDispatched")[0].Counts : 0;

      this.data12 = data.filter(
        (item) => item.activity === "Approved").length > 0 ? data.filter(
          (item) => item.activity === "Approved")[0].Counts : 0;

      this.data13 = data.filter(
        (item) => item.activity === "Rejected").length > 0 ? data.filter(
          (item) => item.activity === "Rejected")[0].Counts : 0;

      this.data15 = data.filter(
        (item) => item.activity === "RefillingRequest").length > 0 ? data.filter(
          (item) => item.activity === "RefillingRequest")[0].Counts : 0;

      this.data16 = data.filter(
        (item) => item.activity === "RefillingAck").length > 0 ? data.filter(
          (item) => item.activity === "RefillingAck")[0].Counts : 0;

      this.loadChartsData()
    });
  }

  callFuntion(status: number, template: any) {
    let timeperiod = this.timeperiodretrieval;
    let formattedFromDate = '';
    let formattedToDate = '';

    if (timeperiod === 4) {
      formattedFromDate = this.fromdateret ? moment(this.fromdateret).format('YYYY-MM-DD') : '';
      formattedToDate = this.todateret ? moment(this.todateret).format('YYYY-MM-DD') : '';
    }
    else {
      formattedFromDate = '';
      formattedToDate = '';
    }

    let apiUrl = this._global.baseAPIUrl + "Retrival/RetrievalDashboard?USERId=" + localStorage.getItem("UserID") + "&user_Token=" + localStorage.getItem("User_Token") + "&timeperiod=" + timeperiod + "&fromDate=" + formattedFromDate + "&toDate=" + formattedToDate;
    if (status >= 1 && status <= 6) {
      apiUrl += "&status=" + status;
    }

    this._onlineExamService.getAllPickupData(apiUrl).subscribe((data: any) => {

      if (status == 1) {
        this.prepareTableData1(data, data, 20);
        this.modelRef = this.modalService.show(template);
      }
      if (status == 2) {
        this.prepareTableData1(data, data, 11);
        this.modelRef = this.modalService.show(template);
      }
      if (status == 3) {
        this.prepareTableData1(data, data, 12);
        this.modelRef = this.modalService.show(template);
      }
      if (status == 4) {
        this.prepareTableData1(data, data, 13);
        this.modelRef = this.modalService.show(template);
      }
      if (status == 5) {
        this.prepareTableData1(data, data, 15);
        this.modelRef = this.modalService.show(template);
      }
      if (status == 6) {
        this.prepareTableData1(data, data, 16);
        this.modelRef = this.modalService.show(template);
      }
    });
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

  headerList1: any;
  prepareTableData1(tableData, headerList, status) {
    if (status == 1) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'request_id', header: 'REQUEST NO', index: 2 },
        { field: 'service_type', header: 'SERVICE TYPE', index: 2 },
        { field: 'document_type', header: 'DOCUMENT TYPE', index: 3 },
        { field: 'main_file_count', header: 'MAIN FILE (NO OF FILES)', index: 3 },
        { field: 'collateral_file_count', header: 'COLLETRAL (NO OF FILES)', index: 7 },
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
        { field: 'request_status', header: 'REQUEST STATUS', index: 2 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'request_id': el.request_id,
          'service_type': el.service_type,
          'document_type': el.document_type,
          'main_file_count': el.main_file_count,
          'collateral_file_count': el.collateral_file_count,
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
          'request_status': el.request_status,
          'created_by': el.created_by,
          'created_date': el.created_date,
          'vehicle_number': el.vehicle_number,
          'reschedule_reason': el.reschedule_reason,
          'reschedule_date': el.reschedule_date ? this.formatDate(el.reschedule_date) : "",
          'escort_name': el.escort_name,
          'escort_number': el.escort_number,
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 2) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'request_id', header: 'REQUEST NO', index: 2 },
        { field: 'service_type', header: 'SERVICE TYPE', index: 2 },
        { field: 'document_type', header: 'DOCUMENT TYPE', index: 3 },
        { field: 'main_file_count', header: 'MAIN FILE COUNT', index: 3 },
        { field: 'collateral_file_count', header: 'COLLETRAL FILE COUNT', index: 7 },
        { field: 'branch_name', header: 'BRANCH NAME', index: 7 },
        { field: 'request_by', header: 'REQUESTED BY', index: 2 },
        { field: 'request_date', header: 'REQUEST DATE', index: 2 },
        { field: 'remark', header: 'REMARK', index: 2 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'request_id': el.request_id,
          'service_type': el.service_type,
          'document_type': el.document_type,
          'main_file_count': el.main_file_count,
          'collateral_file_count': el.collateral_file_count,
          'branch_code': el.branch_code,
          'branch_name': el.branch_name,
          'request_by': el.request_by,
          'request_date': el.request_date,
          'remark': el.remark,
          'ack_by': el.ack_by,
          'ack_date': el.ack_date,
          'address': el.address
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 3) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'request_id', header: 'REQUEST NO', index: 2 },
        { field: 'service_type', header: 'SERVICE TYPE', index: 2 },
        { field: 'document_type', header: 'DOCUMENT TYPE', index: 3 },
        { field: 'main_file_count', header: 'MAIN FILE (NO OF FILES)', index: 3 },
        { field: 'collateral_file_count', header: 'COLLETRAL (NO OF FILES)', index: 7 },
        { field: 'branch_code', header: 'BRANCH CODE', index: 7 },
        { field: 'branch_name', header: 'BRANCH NAME', index: 7 },
        { field: 'request_by', header: 'REQUESTED BY', index: 2 },
        { field: 'request_date', header: 'REQUEST DATE', index: 2 },
        { field: 'ack_by', header: 'ACKNOWLEDGE BY', index: 2 },
        { field: 'ack_date', header: 'ACKNOWLEDGE DATE', index: 2 },
        { field: 'form_schedule_date', header: 'SCHEDULE DATE', index: 2 },
        { field: 'form_reschedule_date', header: 'RESCHEDULE DATE', index: 2 },
        { field: 'reschedule_reason', header: 'RESCHEDULE REASON', index: 2 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'request_id': el.request_id,
          'pickup_address': el.pickup_address,
          'service_type': el.service_type,
          'document_type': el.document_type,
          'main_file_count': el.main_file_count,
          'collateral_file_count': el.collateral_file_count,
          'branch_code': el.branch_code,
          'branch_name': el.branch_name,
          'request_by': el.request_by,
          'request_date': el.request_date,
          'ack_by': el.ack_by,
          'ack_date': el.ack_date,
          'address': el.address,
          'schedule_date': el.schedule_date,
          'form_schedule_date': el.schedule_date ? this.formatDate(el.schedule_date) : "",
          'status': el.status,
          'pickup_request_id': el.pickup_request_id,
          'vehicle_number': el.vehicle_number,
          'reschedule_reason': el.reschedule_reason,
          'reschedule_date': el.reschedule_date,
          'escort_name': el.escort_name,
          'escort_number': el.escort_number,
          'form_reschedule_date': el.reschedule_date ? this.formatDate(el.reschedule_date) : "",
        });

      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 4) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'request_id', header: 'REQUEST ID', index: 2 },
        { field: 'request_date', header: 'REQUEST DATE', index: 3 },
        { field: 'service_type', header: 'SERVICE TYPE', index: 4 },
        { field: 'document_type', header: 'DOCUMENT TYPE', index: 4 },
        { field: 'main_file_count', header: 'MAIN FILE COUNT', index: 4 },
        { field: 'collateral_file_count', header: 'COLLETRAL FILE COUNT', index: 4 },
        { field: 'branch_code', header: 'BRANCH_CODE', index: 4 },
        { field: 'request_status', header: 'REQUEST STATUS', index: 4 },

      ];
      console.log("tableData", tableData);
      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'request_id': el.request_id,
          'pickup_address': el.pickup_address,
          'service_type': el.service_type,
          'document_type': el.document_type,
          'main_file_count': el.main_file_count,
          'collateral_file_count': el.collateral_file_count,
          'branch_code': el.branch_code,
          'branch_name': el.branch_name,
          'request_by': el.request_by,
          'request_date': el.request_date,
          'escort_name': el.escort_name,
          'address': el.address,
          'status': el.status,
          'pickup_request_id': el.pickup_request_id,
          'vehicle_number': el.vehicle_number,
          'request_status': el.request_status,
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 5 || status == 9) {
      let formattedData = [];
      let tableHeader = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'request_id', header: 'REQUEST ID', index: 2 },
        { field: 'lan_no', header: 'LAN NO', index: 3 },
        { field: 'file_no', header: 'FILE NO', index: 4 },
        { field: 'carton_no', header: 'CARTON NO', index: 5 },
        { field: 'branch_name', header: 'BRANCH NAME', index: 6 },
        { field: 'app_branch_code', header: 'APP BRANCH CODE', index: 7 },
        { field: 'Upload_By', header: 'UPLOAD BY', index: 8 },
        { field: 'UploadAt', header: 'UPLOAD AT', index: 9 },
        { field: 'InwardBy', header: 'INWARD BY', index: 10 },
        { field: 'InwardAt', header: 'INWARD AT', index: 11 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),  // Serial Number
          'request_id': el.request_id,
          'lan_no': el.lan_no,
          'file_no': el.file_no,
          'carton_no': el.carton_no,
          'branch_name': el.branch_name,
          'app_branch_code': el.app_branch_code,
          'Upload_By': el.Upload_By,
          'UploadAt': el.UploadAt,
          'InwardBy': el.InwardBy,
          'InwardAt': el.InwardAt,
          'created_date': el.created_date
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 6 || status == 10) {
      let formattedData = [];
      let tableHeader = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'lan_no', header: 'LAN NO', index: 3 },
        { field: 'branch_name', header: 'BRANCH NAME', index: 6 },
        { field: 'app_branch_code', header: 'APP BRANCH CODE', index: 7 },
        { field: 'Upload_By', header: 'UPLOAD BY', index: 8 },
        { field: 'UploadAt', header: 'UPLOAD AT', index: 9 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'request_id': el.request_id,
          'lan_no': el.lan_no,
          'file_no': el.file_no,
          'carton_no': el.carton_no,
          'branch_name': el.branch_name,
          'app_branch_code': el.app_branch_code,
          'Upload_By': el.Upload_By,
          'UploadAt': el.UploadAt,
          'InwardBy': el.InwardBy,
          'InwardAt': el.InwardAt,
          'created_date': el.created_date
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 20) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'pod_number', header: 'POD NO', index: 3 },
        { field: 'request_number', header: 'REQ NO', index: 3 },
        { field: 'item_code', header: 'ITEM CODE', index: 2 },
        { field: 'item_number', header: 'ITEM NUMBER', index: 2 },
        { field: 'courier_name', header: 'COURIER NAME', index: 2 },
        { field: 'workorder_number', header: 'WORKORDER NUMBER', index: 3 },
        { field: 'file_status', header: 'FILE STATUS', index: 3 },
        { field: 'retrieval_reason', header: 'RETRIEVALREASON', index: 3 },
        { field: 'retrival_remark', header: 'RETRIEVAL REMARK', index: 3 },
        { field: 'created_by', header: 'REQUEST RAISED BY', index: 3 },
        { field: 'created_date', header: 'REQUEST RAISED DATE', index: 3 },
      ];
      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'pod_number': el?.pod_number,
          'request_number': el?.request_number,
          'courier_name': el?.courier_name,
          'item_number': el?.item_number,
          'item_code': el?.item_code,
          'file_status': el?.file_status,
          'request_by': el?.request_by,
          'request_date': el?.request_date,
          'status': el?.status,
          'retrival_remark': el?.retrival_remark,
          'workorder_number': el.workorder_number,
          'created_by': el.created_by,
          'created_date': el.created_date,
          'retrieval_reason': el.retrieval_reason
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 11) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'pod_number', header: 'POD NO', index: 3 },
        { field: 'request_number', header: 'REQ NO', index: 3 },
        { field: 'item_code', header: 'ITEM CODE', index: 2 },
        { field: 'item_number', header: 'ITEM NUMBER', index: 2 },
        { field: 'courier_name', header: 'COURIER NAME', index: 2 },
        { field: 'workorder_number', header: 'WORKORDER NUMBER', index: 3 },
        { field: 'file_status', header: 'FILE STATUS', index: 3 },
        { field: 'retrieval_reason', header: 'RETRIEVALREASON', index: 3 },
        { field: 'retrival_remark', header: 'RETRIEVAL REMARK', index: 3 },
        { field: 'created_by', header: 'REQUEST RAISED BY', index: 3 },
        { field: 'created_date', header: 'REQUEST RAISED DATE', index: 3 },
        { field: 'pod_entry_by', header: 'DISPATCH BY', index: 3 },
        { field: 'pod_entry_date', header: 'DISPATCH DATE', index: 3 },
      ];
      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'pod_number': el?.pod_number,
          'request_number': el?.request_number,
          'courier_name': el?.courier_name,
          'item_number': el?.item_number,
          'item_code': el?.item_code,
          'file_status': el?.file_status,
          'request_by': el?.request_by,
          'request_date': el?.request_date,
          'status': el?.status,
          'retrival_remark': el?.retrival_remark,
          'workorder_number': el.workorder_number,
          'created_by': el.created_by,
          'created_date': el.created_date,
          'pod_entry_by': el.pod_entry_by,
          'pod_entry_date': el.pod_entry_date,
          'retrieval_reason': el.retrieval_reason
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 12) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'pod_number', header: 'POD NO', index: 3 },
        { field: 'request_number', header: 'REQ NO', index: 3 },
        { field: 'item_code', header: 'ITEM CODE', index: 2 },
        { field: 'item_number', header: 'ITEM NUMBER', index: 2 },
        { field: 'courier_name', header: 'COURIER NAME', index: 2 },
        { field: 'workorder_number', header: 'WORKORDER NUMBER', index: 3 },
        { field: 'file_status', header: 'FILE STATUS', index: 3 },
        { field: 'retrieval_reason', header: 'RETRIEVALREASON', index: 3 },
        { field: 'retrival_remark', header: 'RETRIEVAL REMARK', index: 3 },
        { field: 'created_by', header: 'REQUEST RAISED BY', index: 3 },
        { field: 'created_date', header: 'REQUEST RAISED DATE', index: 3 },
        { field: 'approval_by', header: 'APPROVAL BY', index: 3 },
        { field: 'approval_date', header: 'APPROVAL DATE', index: 3 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'pod_number': el?.pod_number,
          'request_number': el?.request_number,
          'courier_name': el?.courier_name,
          'item_number': el?.item_number,
          'item_code': el?.item_code,
          'file_status': el?.file_status,
          'request_by': el?.request_by,
          'request_date': el?.request_date,
          'status': el?.status,
          'retrival_remark': el?.retrival_remark,
          'workorder_number': el.workorder_number,
          'approval_by': el.approval_by,
          'created_by': el.created_by,
          'created_date': el.created_date,
          'approval_date': el.approval_date,
          'retrieval_reason': el.retrieval_reason
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 13) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'pod_number', header: 'POD NO', index: 3 },
        { field: 'request_number', header: 'REQ NO', index: 3 },
        { field: 'item_code', header: 'ITEM CODE', index: 2 },
        { field: 'item_number', header: 'ITEM NUMBER', index: 2 },
        { field: 'workorder_number', header: 'WORKORDER NUMBER', index: 3 },
        { field: 'file_status', header: 'FILE STATUS', index: 3 },
        { field: 'retrieval_reason', header: 'RETRIEVALREASON', index: 3 },
        { field: 'retrival_remark', header: 'RETRIEVAL REMARK', index: 3 },
        { field: 'created_by', header: 'REQUEST RAISED BY', index: 3 },
        { field: 'created_date', header: 'REQUEST RAISED DATE', index: 3 },
        { field: 'reject_by', header: 'REJECT BY', index: 3 },
        { field: 'reject_date', header: 'REJECT DATE', index: 3 },
      ];

      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          'pod_number': el?.pod_number,
          'request_number': el?.request_number,
          'item_number': el?.item_number,
          'item_code': el?.item_code,
          'file_status': el?.file_status,
          'request_by': el?.request_by,
          'request_date': el?.request_date,
          'status': el?.status,
          'retrival_remark': el?.retrival_remark,
          'workorder_number': el.workorder_number,
          'reject_by': el.reject_by,
          'created_by': el.created_by,
          'created_date': el.created_date,
          'reject_date': el.reject_date,
          'retrieval_reason': el.retrieval_reason
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 15) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'request_number', header: 'REQUEST NUMBER', index: 2 },
        { field: 'item_code', header: 'ITEM CODE', index: 2 },
        { field: 'item_number', header: 'ITEM NUMBER', index: 3 },
        { field: 'created_by', header: 'REFILLING BY', index: 3 },
        { field: 'created_date', header: 'REFILLING DATE', index: 7 },
      ];
      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          "request_number": el.request_number,
          "item_code": el.item_code,
          "item_number": el.item_number,
          'created_by': el.created_by,
          'created_date': el.created_date
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }

    if (status == 16) {
      let formattedData = [];
      let tableHeader: any = [
        { field: 'srNo', header: "SR NO", index: 1 },
        { field: 'request_number', header: 'REQUEST NUMBER', index: 2 },
        { field: 'item_code', header: 'ITEM CODE', index: 2 },
        { field: 'item_number', header: 'ITEM NUMBER', index: 3 },
        { field: 'created_by', header: 'REFILLING BY', index: 3 },
        { field: 'created_date', header: 'REFILLING DATE', index: 7 },
        { field: 'ack_by', header: 'REFILLING ACK BY', index: 7 },
        { field: 'ack_date', header: 'REFILLING ACK DATE', index: 7 },
      ];
      tableData.forEach((el, index) => {
        formattedData.push({
          'srNo': parseInt(index + 1),
          "request_number": el.request_number,
          "item_code": el.item_code,
          "item_number": el.item_number,
          'created_by': el.created_by,
          'ack_by': el.ack_by,
          'ack_date': el.ack_date,
          'created_date': el.created_date
        });
      });
      this.headerList1 = tableHeader;
      this.immutableFormattedData1 = JSON.parse(JSON.stringify(formattedData));
      this.formattedData1 = formattedData;
      this.loading1 = false;
      return
    }
    this.loading1 = false;
  }

  downloadData(type) {
    this.type = type;

    if (type === 'No of Request') {
      this.OpenData(1, this.InwardFormPopup);
    }
    else if (type === 'No of Schedule') {
      this.OpenData(2, this.InwardFormPopup);
    }
    else if (type === 'File Inventory Pending') {
      this.OpenData(4, this.InwardFormPopup);
    }
    else if (type === 'File Inventory Done') {
      this.OpenData(3, this.InwardFormPopup);
    }
    else if (type === 'Lan Inventory Pending') {
      this.OpenData(6, this.InwardFormPopup);
    }
    else if (type === 'Lan Inventory Done') {
      this.OpenData(5, this.InwardFormPopup);
    }
    else if (type === 'Lan Inv Pending By Disb') {
      this.OpenData(10, this.InwardFormPopup);
    }
    else if (type === 'Lan Inv Done By Disb') {
      this.OpenData(9, this.InwardFormPopup);
    }
    else if (type === 'Retrieval Request') {
      this.callFuntion(1, this.InwardFormPopup);
    }
    else if (type === 'Retrieval Dispatched') {
      this.callFuntion(2, this.InwardFormPopup);
    }
    else if (type === 'Approved Request') {
      this.callFuntion(3, this.InwardFormPopup);
    }
    else if (type === 'Rejected Request') {
      this.callFuntion(4, this.InwardFormPopup);
    }
    else if (type === 'Refilling Request') {
      this.callFuntion(5, this.InwardFormPopup);
    }
    else if (type === 'Refilling Ack') {
      this.callFuntion(6, this.InwardFormPopup);
    }
    this.displayStyle = "block";
  }

  loadChartsData() {
    var courierInwardChart = am4core.create("courierInwardChart", am4charts.PieChart);
    courierInwardChart.logo.disabled = true;
    var pieSeries = courierInwardChart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "ocrStatus";
    courierInwardChart.innerRadius = am4core.percent(0);
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = '{count}'
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;
    courierInwardChart.legend = new am4charts.Legend();
    courierInwardChart.legend.itemContainers.template.togglable = false;
    courierInwardChart.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });
    const CIPPer = ((this.data3 / (this.data3 + this.data4)) * 100).toFixed(2);
    const beyondCIPPer = ((this.data4 / (this.data3 + this.data4)) * 100).toFixed(2);
    courierInwardChart.data = [
      {
        "ocrStatus": "Inventory Request Pending",
        "count": this.data3,
        "color": am4core.color("#f6a01a"),
        "fontSize": 12,
        "per": CIPPer
      }, {
        "ocrStatus": "Inventory Request Done",
        "count": this.data4,
        "color": am4core.color("#005984"),
        "fontSize": 12,
        "per": beyondCIPPer
      }];
    pieSeries.labels.template.text = "{per}%";

    var MissingChart = am4core.create("MissingChart", am4charts.PieChart);
    MissingChart.logo.disabled = true;
    var pieSeries = MissingChart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "ocrStatus";
    MissingChart.innerRadius = am4core.percent(0);
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = '{count}'
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;
    MissingChart.legend = new am4charts.Legend();
    MissingChart.legend.itemContainers.template.togglable = false;
    MissingChart.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });
    const Dis = ((this.lan_inv_pending_disbdate / (this.lan_inv_pending_disbdate + this.lan_inv_done_disbdate)) * 100).toFixed(2);
    const Diss = ((this.lan_inv_done_disbdate / (this.lan_inv_pending_disbdate + this.lan_inv_done_disbdate)) * 100).toFixed(2);
    MissingChart.data = [
      {
        "ocrStatus": "Inventory Pending",
        "count": this.lan_inv_pending_disbdate,
        "color": am4core.color("#f6a01a"),
        "fontSize": 12,
        "per": Dis
      }, {
        "ocrStatus": "Inventory Done",
        "count": this.lan_inv_done_disbdate,
        "color": am4core.color("#005984"),
        "fontSize": 12,
        "per": Diss
      }];
    pieSeries.labels.template.text = "{per}%";

    var courierInwardChart1 = am4core.create("courierInwardChart1", am4charts.PieChart);
    courierInwardChart1.logo.disabled = true;
    var pieSeries = courierInwardChart1.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "ocrStatus";
    courierInwardChart1.innerRadius = am4core.percent(0);
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = "{count}";
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;
    courierInwardChart1.legend = new am4charts.Legend();
    courierInwardChart1.legend.itemContainers.template.togglable = false;
    courierInwardChart1.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });
    const totalFiles = this.OutFiles + this.InFiles + this.PermOutFiles + this.DestroyedFiles + this.RetrievalRequestFiles;
    const OUTFILES = ((this.OutFiles / totalFiles) * 100).toFixed(2);
    const INFILES = ((this.InFiles / totalFiles) * 100).toFixed(2);
    const PERMOUTFILES = ((this.PermOutFiles / totalFiles) * 100).toFixed(2);
    const DESTROYEDFILES = ((this.DestroyedFiles / totalFiles) * 100).toFixed(2);
    const RETRIEVALREQUESTFILES = ((this.RetrievalRequestFiles / totalFiles) * 100).toFixed(2);

    courierInwardChart1.data = [
      {
        "ocrStatus": "In Files",
        "count": this.InFiles,
        "color": am4core.color("#005984"),
        "per": INFILES
      },
      {
        "ocrStatus": "Out Files",
        "count": this.OutFiles,
        "color": am4core.color("#f6a01a"),
        "per": OUTFILES
      },
      {
        "ocrStatus": "PermOut Files",
        "count": this.PermOutFiles,
        "color": am4core.color("#dc3545"),
        "per": PERMOUTFILES
      },
      {
        "ocrStatus": "Destroyed Files",
        "count": this.DestroyedFiles,
        "color": am4core.color("#ffc107"),
        "per": DESTROYEDFILES
      },
      {
        "ocrStatus": "Retrieval Request Files",
        "count": this.RetrievalRequestFiles,
        "color": am4core.color("#28a745"),
        "per": RETRIEVALREQUESTFILES
      }
    ];

    pieSeries.labels.template.text = "{per}%";

    var ocrStatusChart = am4core.create("ocrStatusChart", am4charts.PieChart);
    ocrStatusChart.logo.disabled = true;
    var pieSeries = ocrStatusChart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "ocrStatus";
    ocrStatusChart.innerRadius = am4core.percent(0);
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = '{count}'
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;
    ocrStatusChart.legend = new am4charts.Legend();
    ocrStatusChart.legend.itemContainers.template.togglable = false;
    ocrStatusChart.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });
    const tatPer = ((this.data10 / (this.data10 + this.data11)) * 100).toFixed(2);
    const beyondtatPer = ((this.data11 / (this.data10 + this.data11)) * 100).toFixed(2);
    ocrStatusChart.data = [
      {
        "ocrStatus": "Retrieval Request",
        "count": this.data10,
        "color": am4core.color("#f6a01a"),
        "fontSize": 12,
        "per": tatPer
      }, {
        "ocrStatus": "Retrieval Dispatched",
        "count": this.data11,
        "color": am4core.color("#005984"),
        "fontSize": 12,
        "per": beyondtatPer
      }];
    pieSeries.labels.template.text = "{per}%";

    var ocrStatusChart1 = am4core.create("ocrStatusChart1", am4charts.PieChart);
    ocrStatusChart1.logo.disabled = true;
    var pieSeries = ocrStatusChart1.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "ocrStatus";
    ocrStatusChart1.innerRadius = am4core.percent(0);
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = '{count}'
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;
    ocrStatusChart1.legend = new am4charts.Legend();
    ocrStatusChart1.legend.itemContainers.template.togglable = false;
    ocrStatusChart1.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });
    const tatPer1 = ((this.data12 / (this.data12 + this.data13)) * 100).toFixed(2);
    const beyondtatPer1 = ((this.data13 / (this.data12 + this.data13)) * 100).toFixed(2);
    ocrStatusChart1.data = [
      {
        "ocrStatus": "Approved Request",
        "count": this.data12,
        "color": am4core.color("#f6a01a"),
        "fontSize": 12,
        "per": tatPer1
      }, {
        "ocrStatus": "Rejected Request",
        "count": this.data13,
        "color": am4core.color("#005984"),
        "fontSize": 12,
        "per": beyondtatPer1
      }];
    pieSeries.labels.template.text = "{per}%";

    var RefillingRequest = am4core.create("RefillingRequest", am4charts.PieChart);
    RefillingRequest.logo.disabled = true;
    var pieSeries = RefillingRequest.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "ocrStatus";
    RefillingRequest.innerRadius = am4core.percent(0);
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = '{count}'
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;
    RefillingRequest.legend = new am4charts.Legend();
    RefillingRequest.legend.itemContainers.template.togglable = false;
    RefillingRequest.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });
    console.log(this.data15, this.data16)
    const RefillingReq = ((this.data15 / (this.data15 + this.data16)) * 100).toFixed(2);
    const RefillingAck = ((this.data16 / (this.data15 + this.data16)) * 100).toFixed(2);
    RefillingRequest.data = [
      {
        "ocrStatus": "Refilling Request",
        "count": this.data15,
        "color": am4core.color("#f6a01a"),
        "fontSize": 12,
        "per": RefillingReq
      }, {
        "ocrStatus": "Refilling Ack",
        "count": this.data16,
        "color": am4core.color("#005984"),
        "fontSize": 12,
        "per": RefillingAck
      }];
    pieSeries.labels.template.text = "{per}%";

    var DumpStatusChart = am4core.create("DumpStatusChart", am4charts.PieChart);
    DumpStatusChart.logo.disabled = true;
    var pieSeries = DumpStatusChart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "count";
    pieSeries.dataFields.category = "ocrStatus";
    DumpStatusChart.innerRadius = am4core.percent(0);
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = '{count}'
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;
    DumpStatusChart.legend = new am4charts.Legend();
    DumpStatusChart.legend.itemContainers.template.togglable = false;
    DumpStatusChart.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });

    const DumpInstrattPer = ((this.PickupIN_TAT / (this.PickupIN_TAT + this.PickupOUT_TAT)) * 100).toFixed(2);
    const DumpNotYetDisptachPer = ((this.PickupOUT_TAT / (this.PickupIN_TAT + this.PickupOUT_TAT)) * 100).toFixed(2);
    const DumpACkPer = ((this.DumpACk / (this.DumpInstratt + this.DumpNotYetDisptach + this.DumpACk)) * 100).toFixed(2);
    DumpStatusChart.data = [
      {
        "ocrStatus": "Pickup Requests IN-TAT",
        "count": this.PickupIN_TAT,
        "color": am4core.color("#f6a01a"),
        "fontSize": 12,
        "PerP": DumpInstrattPer
      }
      , {
        "ocrStatus": "Pickup Requests OUT-TAT",
        "count": this.PickupOUT_TAT,
        "color": am4core.color("#005984"),
        "fontSize": 12,
        "PerP": DumpNotYetDisptachPer
      }
    ];
    pieSeries.labels.template.text = "{PerP}%";

    var activityChart = am4core.create("activityChart", am4charts.PieChart);
    activityChart.logo.disabled = true;
    var pieSeries = activityChart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "value";
    pieSeries.dataFields.category = "country";
    activityChart.innerRadius = am4core.percent(70);;
    pieSeries.ticks.template.disabled = true;
    pieSeries.labels.template.hidden = true;
    pieSeries.tooltip.disabled = true;
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.legendSettings.valueText = '{value}'
    pieSeries.labels.template.maxWidth = 130;
    pieSeries.labels.template.wrap = true;
    pieSeries.labels.template.disabled = true;
    activityChart.legend = new am4charts.Legend();
    activityChart.legend.position = "right";
    activityChart.legend.valign = "middle";
    activityChart.legend.itemContainers.template.events.on("hit", (ev: any) => {
      this.downloadData(ev.target.dataItem.dataContext.properties.category);
    });
    activityChart.data = [{
      "country": "Complete",
      "value": this.Complete,
      "color": am4core.color("#FFA7BE")
    }, {
      "country": "InComplete",
      "value": this.InComplete,
      "color": am4core.color("#69DDFF")
    }, {
      "country": "Missing",
      "value": this.Missing,
      "color": am4core.color("#A9FFF7")
    }, {
      "country": "Extra",
      "value": this.Extra,
      "color": am4core.color("#B8E1FF")
    }, {
      "country": "POD Intransit",
      "value": this.PODInstratt,
      "color": am4core.color("#ff00ff")
    }, {
      "country": "NotYetDisptach",
      "value": this.NotYetDisptach,
      "color": am4core.color("#ff6666")
    }
      , {
      "country": "PODACk",
      "value": this.PODACk,
      "color": am4core.color("#ffbf00")
    }
    ];
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

  paginate1(e) {
    this.first1 = e.first;
    this.rows1 = e.rows;
  }

  onUpdatestatus() {
    this.modelRef.hide();
  }

  immutableFormattedData: any;
  immutableFormattedData1: any;
  formattedData1: any;
  loading: boolean = true;
  loading1: boolean = true;

}
