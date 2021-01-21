import { LightningElement, api, wire } from "lwc";
// Lightning Message Channel Imports
import FilePreviewMessageChannel from "@salesforce/messageChannel/FilePreviewMessageChannel__c";
import {
  subscribe,
  unsubscribe,
  MessageContext
} from "lightning/messageService";

const IMAGE_FILE_EXTENSIONS = ["png", "jpg", "jpeg"];
export default class filePreviewWindow extends LightningElement {
  // File Info
  @api contentVersionId;
  @api contentDocumentId;
  @api fileType;

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
    this.contentVersionId = message.contentVersionId;
    this.contentDocumentId = message.contentDocumentId;
    this.fileType = message.fileType;
  }

  get isImage() {
    return IMAGE_FILE_EXTENSIONS.includes(this.fileType);
  }

  get isPdf() {
    return this.fileType === "pdf";
  }

  get isMP3() {
    return this.fileType === "mp3";
  }

  get displayPopOut() {
    return this.isImage || this.isPdf || this.isMP3;
  }

  get isUnsupportedType() {
    return !this.isImage && !this.isPdf && !this.isMP3;
  }

  get url() {
    if (this.isImage) {
      return (
        "/sfc/servlet.shepherd/version/renditionDownload?rendition=ORIGINAL_Jpg&versionId=" +
        this.contentVersionId
      );
    } else if (this.isPdf || this.isMP3) {
      return (
        "/sfc/servlet.shepherd/document/download/" + this.contentDocumentId
      );
    }
  }

  handlePopOutClick() {
    window.open(this.url, "_blank", "height=350,width=350");
  }
}
