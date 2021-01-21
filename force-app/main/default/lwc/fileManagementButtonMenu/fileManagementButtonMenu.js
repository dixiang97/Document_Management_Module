import { LightningElement, wire } from "lwc";
// Lightning Message Channel Imports
import FilePreviewMessageChannel from "@salesforce/messageChannel/FilePreviewMessageChannel__c";
import {
  subscribe,
  unsubscribe,
  MessageContext
} from "lightning/messageService";
// Toast Import
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class FileManagementButtonMenu extends LightningElement {
  displayFileLinkModal;
  // Current selected ContentDocumentId
  selectedContentDocumentId;
  // Message Channel Subscription
  subscription = null;
  @wire(MessageContext)
  messageContext;

  connectedCallback() {
    this.subscribeToMessageChannel();
  }

  disconnectedCallback() {
    this.unsubscribeToMessageChannel();
  }

  subscribeToMessageChannel() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        FilePreviewMessageChannel,
        (message) => this.handleMessage(message)
      );
    }
  }

  unsubscribeToMessageChannel() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  handleMessage(message) {
    this.selectedContentDocumentId = message.contentDocumentId;
  }

  handleEnrollment() {}

  handleLinkButton() {
    if (this.selectedContentDocumentId) {
      this.displayFileLinkModal = true;
    } else {
      this.showToast("Error", "Please select a file to link", "error");
    }
  }

  handleFileLinkModalClose() {
    this.displayFileLinkModal = false;
  }

  showToast(title, message, variant) {
    const toastEvent = new ShowToastEvent({ title, message, variant });
    this.dispatchEvent(toastEvent);
  }
}
