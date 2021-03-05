import { LightningElement, wire, track } from "lwc";
import getFileReport from "@salesforce/apex/FileReportController.getFileReport";

const COLUMNS = [
  {
    label: "File",
    fieldName: "fileUrl",
    type: "url",
    typeAttributes: { label: { fieldName: "fileTitle" }, target: "_blank" }
  },
  {
    label: "Type",
    fieldName: "type",
    sortable: true
  },
  { label: "Description", fieldName: "description" }
];

export default class FileReport extends LightningElement {
  // Table
  @track items;
  @track data;
  columns = COLUMNS;
  defaultSortDirection = "asc";
  sortDirection = "asc";
  sortedBy;
  showSpinner;
  isFilterOpen;

  // Pagination
  currentPage = 1;
  startingRecord;
  endingRecord;
  totalRecountCount;
  totalPage;
  pageSize = 50;

  // Filter Values
  typeFilterValues;

  fetchFileReport() {
    this.showSpinner = true;
    getFileReport({ fileTypeFilter: this.typeFilterValues })
      .then((result) => {
        // if result is null or empty
        if (!Array.isArray(result) || result.length === 0) {
          this.items = [];
          this.data = [];
          this.totalRecountCount = 0;
          this.totalPage = 0;
        } else {
          this.items = result;
          this.totalRecountCount = result.length;
          this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);
          this.data = this.items.slice(0, this.pageSize);
          this.endingRecord = this.pageSize;
          this.currentPage = 1;
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.showSpinner = false;
      });
  }

  // Check is current page is first page
  get isFirstPage() {
    return this.currentPage === 1;
  }

  // Check is current page is last page
  get isLastPage() {
    return this.currentPage === this.totalPage;
  }

  // check show table or not
  get showTable() {
    // only show table when there are records and filter accordion is not opened
    return this.totalRecountCount > 0 && !this.isFilterOpen;
  }

  // check has data or not
  get hasData() {
    return this.totalRecountCount > 0;
  }

  // When filter accordion is open
  handleFilterOpen() {
    this.isFilterOpen = true;
  }

  // When filter accordion is close
  handleFilterClose() {
    this.isFilterOpen = false;
  }

  // Handle type filter change
  handleFilterChange(e) {
    this.typeFilterValues = e.detail.typeFilterValues;
    console.log(e.detail.relatedObjectFilterValue);
    this.fetchFileReport();
  }

  // Handle table data sorting
  onHandleSort(event) {
    const { fieldName: sortedBy, sortDirection } = event.detail;
    const cloneData = [...this.items];
    cloneData.sort(this.sortBy(sortedBy, sortDirection === "asc" ? 1 : -1));
    this.items = cloneData;
    this.sortDirection = sortDirection;
    this.sortedBy = sortedBy;

    // Reset to first page after sorting
    this.currentPage = 1;
    this.displayRecordByPage();
  }

  sortBy(field, reverse, primer) {
    const key = primer
      ? function (x) {
          return primer(x[field]);
        }
      : function (x) {
          return x[field];
        };

    return function (a, b) {
      a = key(a);
      b = key(b);
      return reverse * ((a > b) - (b > a));
    };
  }

  // Handle previous button
  handlePrevious() {
    if (this.currentPage > 1) {
      this.currentPage--; //decrease page by 1
      this.displayRecordByPage();
    }
  }

  // Handle next button
  handleNext() {
    if (
      this.currentPage < this.totalPage &&
      this.currentPage !== this.totalPage
    ) {
      this.currentPage++; //increase page by 1
      this.displayRecordByPage();
    }
  }

  // Displays records page by page
  displayRecordByPage() {
    this.showSpinner = true;
    this.startingRecord = (this.currentPage - 1) * this.pageSize;
    this.endingRecord = this.pageSize * this.currentPage;

    this.endingRecord =
      this.endingRecord > this.totalRecountCount
        ? this.totalRecountCount
        : this.endingRecord;

    this.data = this.items.slice(this.startingRecord, this.endingRecord);
    this.showSpinner = false;
  }
}
