import { LightningElement, api, wire, track } from "lwc";
// UI Api Imports
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import { getRecord, getFieldValue, updateRecord } from "lightning/uiRecordApi";
// Salesforce Object Reference Imports
/* import DOCUMENT_OBJECT from "@salesforce/schema/Document__c";
import DOCUMENT_ID_FIELD from "@salesforce/schema/Document__c.Id";
import DOCUMENT_TAGS_FIELD from "@salesforce/schema/Document__c.Tags__c"; */
// Toast Import
import { ShowToastEvent } from "lightning/platformShowToastEvent";
// Mock Tag Data
const TAG_PICKLISTS = [
  { id: 1, label: "Diagnosis" },
  { id: 2, label: "Pharmaceutical" },
  { id: 3, label: "Test Cycle" },
  { id: 4, label: "Scheme" },
  { id: 5, label: "Enrollment Form" },
  { id: 6, label: "Email" },
  { id: 7, label: "SMS" }
];
const TAG_CLASS = "tag slds-badge slds-m-around_xx-small";
export default class FileTags extends LightningElement {
  // TODO: update to dynamic doc id
  @api documentId = "a001y0000026oE5AAI";
  /**
   * private document id used to control the execution order of wire function
   * execute wiredDocumentRecord after wiredpicklistValues is executed.
   * */
  _documentId;
  documentDefaultRecordTypeId;
  // Tag picklist options retrieved from server
  @track tagPicklists = TAG_PICKLISTS;
  // Selected picklist values
  selectedTags = [];
  draftSelectedTags = [];
  error;
  // Spinner loading indicator
  isLoading;
  /*
  // Get Document__c object info
  @wire(getObjectInfo, { objectApiName: DOCUMENT_OBJECT })
  documentObjectInfo({ data, error }) {
    if (data) {
      this.documentDefaultRecordTypeId = data.defaultRecordTypeId;
    } else if (error) {
      console.error(error);
    }
  }

  // Get Document__c object's field - Tags__c multipicklist option values.
  @wire(getPicklistValues, {
    recordTypeId: "$documentDefaultRecordTypeId",
    fieldApiName: DOCUMENT_TAGS_FIELD
  })
  wiredpicklistValues({ data, error }) {
    if (data) {
      this.tagPicklists = data.values.map((e) => {
        return { id: e.value, label: e.label, value: e.value };
      });
      this._documentId = this.documentId;
    } else if (error) {
      this.error = error;
      console.error(error);
    }
  }

  // Get Document__c record
  @wire(getRecord, { recordId: "$_documentId", fields: DOCUMENT_TAGS_FIELD })
  wiredDocumentRecord({ data, error }) {
    if (data) {
      const rawSelectedPicklistValues = getFieldValue(
        data,
        DOCUMENT_TAGS_FIELD
      );
      this.selectedTags = rawSelectedPicklistValues.split(";");
      this.constructTagPicklists();
    } else if (error) {
      this.error = error;
      console.error(error);
    }
  }

  // When user click on the tag
  handleTagClick(event) {
    const selectedTagValue = event.target.dataset.value;
    const selectedTagIndex = this.selectedTags.indexOf(selectedTagValue);
    this.draftSelectedTags = this.selectedTags.slice();
    // If the new selected tag exists in selectedTags, remove it
    // else insert the new value to selectedTags
    if (selectedTagIndex > -1) {
      this.draftSelectedTags.splice(selectedTagIndex, 1);
    } else {
      this.draftSelectedTags.push(selectedTagValue);
    }
    this.updatePicklists();
  }

  // Construct Tag Picklists Object, update the tag picklist selected status accordingly
  constructTagPicklists() {
    this.tagPicklists.forEach((e) => {
      e["isSelected"] = this.selectedTags.includes(e.value);
      e["cssClass"] = e.isSelected
        ? `${TAG_CLASS} slds-theme_success`
        : TAG_CLASS;
    });
  }

  // update Document__c records tags field
  updatePicklists() {
    // Display spinner
    this.isLoading = true;
    // Construct fields for recordInput to update record
    const fields = {};
    fields[DOCUMENT_ID_FIELD.fieldApiName] = this._documentId;
    fields[DOCUMENT_TAGS_FIELD.fieldApiName] = this.draftSelectedTags.join(";");
    const recordInput = { fields };
    updateRecord(recordInput)
      .then(() => {
        this.selectedTags = this.draftSelectedTags;
        this.constructTagPicklists();
      })
      .catch((error) => {
        this.showToast("Error", "Error updating tags", "error");
        this.error = error;
        console.error(error);
      })
      .finally(() => {
        // Stop displaying spinner
        this.isLoading = false;
      });
  }

  showToast(title, message, variant) {
    const toastEvent = new ShowToastEvent({ title, message, variant });
    this.dispatchEvent(toastEvent);
  }
  */
}
