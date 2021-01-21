import { LightningElement, api, wire } from "lwc";
// Apex Method Imports
import getRelatedContentVersions from "@salesforce/apex/FileManagementController.getRelatedContentVersions";
// Lightning Message Channel Imports
import FilePreviewMessageChannel from "@salesforce/messageChannel/FilePreviewMessageChannel__c";
import { publish, MessageContext } from "lightning/messageService";
// Lightning Navigation Imports
import { NavigationMixin } from "lightning/navigation";
// Table columns
const COLUMNS = [
  { label: "File Title", fieldName: "Title" },
  { label: "File Type", fieldName: "FileExtension" }
];
export default class FilePreviewList extends NavigationMixin(LightningElement) {
  @api recordId;
  @api displayManageButton;
  // Table data
  files = [];
  error;
  columns = COLUMNS;
  // Selected File Info
  selectedContentVersionId;
  selectedContentDocumentId;
  selectedFileType;
  // Lightning message service context
  @wire(MessageContext)
  messageContext;
  // Spinner
  displaySpinner;

  connectedCallback() {
    this.fetchFiles();
  }

  fetchFiles() {
    // Get related files of the record
    this.displaySpinner = true;
    getRelatedContentVersions({
      linkedEntityId: this.recordId
    })
      .then((result) => {
        this.files = result;
      })
      .catch((error) => {
        this.files = undefined;
        this.error = error;
        console.error(error);
      })
      .finally(() => {
        this.displaySpinner = false;
        // Reset the table selection
        this.template.querySelector("lightning-datatable").selectedRows = [];
        // Publish selected file info on message channel
        publish(this.messageContext, FilePreviewMessageChannel, {});
      });
    this.dispatchEvent(new CustomEvent("refresh"));
  }

  // Handle datatable rowselection event
  handleRowSelection(event) {
    this.selectedContentVersionId = event.target.selectedRows[0];
    let selectedContentVersion = this.files.find((value) => {
      return value.Id === this.selectedContentVersionId;
    });
    this.selectedContentDocumentId = selectedContentVersion.ContentDocumentId;
    this.selectedFileType = selectedContentVersion.FileExtension;
    const payload = {
      contentVersionId: this.selectedContentVersionId,
      contentDocumentId: this.selectedContentDocumentId,
      fileType: this.selectedFileType
    };
    // Publish selected file info on message channel
    publish(this.messageContext, FilePreviewMessageChannel, payload);
    // Publish fileselect event
    const fileSelectEvent = new CustomEvent("fileselect", {
      detail: {
        contentVersionId: this.selectedContentVersionId,
        fileTitle: selectedContentVersion.Title
      }
    });
    this.dispatchEvent(fileSelectEvent);
  }

  goToFileManagementPage() {
    // Navigate to the File_Management app page
    this[NavigationMixin.Navigate]({
      type: "standard__navItemPage",
      attributes: {
        apiName: "File_Management"
      },
      state: {
        c__recordId: this.recordId
      }
    });
  }
}
