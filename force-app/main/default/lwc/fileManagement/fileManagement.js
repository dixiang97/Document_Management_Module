import { LightningElement, api, wire } from "lwc";
// Lignintng Navigation Imports
import { CurrentPageReference } from "lightning/navigation";
// Default Open Section of accordion
const ACTIVE_SESSIONS = ["Files"];

export default class CustomFileRelatedList extends LightningElement {
  @api recordId;
  // Page reference that describes the current page
  currentPageReference;
  // Selected File Info
  selectedContentVersionId;
  selectedFileTitle = "-";
  // Accordion active sections
  activeSections = ACTIVE_SESSIONS;

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

  handleFileSelect(event) {
    this.selectedContentVersionId = event.detail.contentVersionId;
    this.selectedFileTitle = event.detail.fileTitle;
  }

  handleFileRefresh() {
    this.selectedContentVersionId = undefined;
    this.selectedFileTitle = "-";
  }
}
