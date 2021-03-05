import { LightningElement, track, wire } from "lwc";
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import CONTENTVERSION_OBJECT from "@salesforce/schema/ContentVersion";
import CONTENTVERSION_TYPE_FIELD from "@salesforce/schema/ContentVersion.Type__c";

const DEFAULT_INNER_ACTIVE_SECTION = ["Type", "Related Object"];
const DEFAULT_RELATED_OBJECT_FILTER_VALUE = "Case";
const RELATED_OBJECT_FILTER_OPTIONS = [
  { label: "Case", value: "Case" },
  { label: "Account", value: "Account" }
];
export default class FileReportFilter extends LightningElement {
  // Accordion
  @track outerActiveSectionName = [];
  @track innerActiveSectionName = DEFAULT_INNER_ACTIVE_SECTION;

  // File Type Filter
  contentVersionDefaultRecordTypeId;
  @track typeFilterOptions;
  @track typeFilterValues = []; // Selected Type filter values

  // Related Object Filter
  @track relatedObjectFilterOptions = RELATED_OBJECT_FILTER_OPTIONS;
  relatedObjectFilterValue = DEFAULT_RELATED_OBJECT_FILTER_VALUE;

  // Get ContentVersion object info to get default recordtype id to retrieve type picklist options.
  @wire(getObjectInfo, { objectApiName: CONTENTVERSION_OBJECT })
  wiredObjectInfo({ data, error }) {
    if (data) {
      this.contentVersionDefaultRecordTypeId = data.defaultRecordTypeId;
    } else if (error) {
      console.error(error);
    }
  }

  // Get ContentVersion field - Type__c picklist options.
  @wire(getPicklistValues, {
    recordTypeId: "$contentVersionDefaultRecordTypeId",
    fieldApiName: CONTENTVERSION_TYPE_FIELD
  })
  wiredPicklistValues({ data, error }) {
    if (data) {
      this.typeFilterOptions = data.values.map((e) => {
        return { label: e.label, value: e.value };
      });
      this.typeFilterValues = data.values.map((e) => {
        return e.value;
      });
      // Dispatch filter change after initial loading
      this.dispatchFilterChangeEvent();
    } else if (error) {
      console.error(error);
    }
  }

  // Check if the filters accordion is open or close.
  get isFiltersAccordionActive() {
    return this.outerActiveSectionName.includes("Filters");
  }

  // Handle Accordion Toggle
  handleToggleSection(e) {
    let accordion = e.currentTarget.dataset.name;
    if (accordion === "outerAccordion") {
      this.outerActiveSectionName = e.detail.openSections;
      this.dispatchFiltersAccordionEvent();
    } else if (accordion === "innerAccordion") {
      this.innerActiveSectionName = e.detail.openSections;
    }
  }

  // Get Related Object Accordion label
  get relatedObjectAccordionLabel() {
    return "Related Object - " + this.relatedObjectFilterValue;
  }

  // Handle Type filter values change
  handleFilterValueChange(e) {
    let filterName = e.currentTarget.dataset.name;
    let filterValue = e.detail.value;
    if (filterName === "typeFilter") {
      this.typeFilterValues = filterValue;
    } else if (filterName === "relatedObjectFilter") {
      this.relatedObjectFilterValue = filterValue;
    }
  }

  // Handle save button click
  handleSave() {
    // close filters accordion
    const index = this.outerActiveSectionName.indexOf("Filters");
    if (index > -1) {
      let clonedOuterActiveSectionName = [...this.outerActiveSectionName];
      clonedOuterActiveSectionName.splice(index, 1);
      this.outerActiveSectionName = clonedOuterActiveSectionName;
    }
    this.dispatchFiltersAccordionEvent();
    this.dispatchFilterChangeEvent();
  }

  // Dispatch event when filter values is changed
  dispatchFilterChangeEvent() {
    this.dispatchEvent(
      new CustomEvent("filterchange", {
        detail: {
          typeFilterValues: this.typeFilterValues,
          relatedObjectFilterValue: this.relatedObjectFilterValue
        }
      })
    );
  }

  dispatchFiltersAccordionEvent() {
    if (this.isFiltersAccordionActive) {
      this.dispatchEvent(new CustomEvent("filteropen"));
    } else {
      this.dispatchEvent(new CustomEvent("filterclose"));
    }
  }
}
