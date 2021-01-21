import { LightningElement, api, wire } from "lwc";
// Lignintng Navigation Imports
import { CurrentPageReference } from "lightning/navigation";
// Default Open Section of accordion
const ACTIVESESSIONS = ["Files"];
// Mock Tag Data
const TAGS = [
  { Id: 1, Name: "Diagnosis" },
  { Id: 2, Name: "Pharmaceutical" },
  { Id: 3, Name: "Test Cycle" },
  { Id: 4, Name: "Scheme" },
  { Id: 5, Name: "Enrollment Form" },
  { Id: 6, Name: "Email" },
  { Id: 7, Name: "SMS" }
];
export default class CustomFileRelatedList extends LightningElement {
  @api recordId;
  // Page reference that describes the current page
  currentPageReference;
  // Selected File Info
  selectedContentVersionId;
  selectedFileTitle = "-";
  // Accordion active sections
  activeSections = ACTIVESESSIONS;
  tags = TAGS;

  @wire(CurrentPageReference)
  setCurrentPageReference(currentPageReference) {
    /**
     * Check if the component is embedded in record page
     * If yes, do nothing as the recordId is set automatically
     */
    if (this.recordId) {
      return;
    }
    /**
     * Injects the page reference that describes the current page
     * To get the recordId parameter from URL
     */
    this.currentPageReference = currentPageReference;
    //Get parameter c__recordId
    this.recordId = this.currentPageReference.state.c__recordId;
  }

  handleTagClick(event) {
    const tagComponent = event.target;
    tagComponent.classList.toggle("slds-theme_success");
  }

  handleFileSelect(event) {
    this.selectedContentVersionId = event.detail.contentVersionId;
    this.selectedFileTitle = event.detail.fileTitle;
  }

  handleFileRefresh() {
    this.selectedContentVersionId = undefined;
    this.selectedFileTitle = "-";
  }
}
