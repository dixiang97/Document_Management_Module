import { LightningElement, api } from "lwc";
// Toast Import
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class FileLinkModal extends LightningElement {
  @api contentDocumentId;
  currentPage = 1;
  totalPage = 2;
  selectedAccountId;

  get inSearchPage() {
    return this.currentPage === 1;
  }

  get inLinkPage() {
    return this.currentPage === 2;
  }

  get inLastPage() {
    return this.currentPage === this.totalPage;
  }

  get inFirstPage() {
    return this.currentPage === 1;
  }

  handleNext() {
    // If go to File Link Page, selectedAccountId cannot be null
    if (this.currentPage + 1 === 2 && !this.selectedAccountId) {
      this.showToast("Error", "Please select an account", "error");
    } else {
      this.currentPage++;
    }
  }

  handleBack() {
    this.currentPage--;
    // If go back to Account Search Page, reset selectedAccountId to null
    if (this.currentPage === 1) this.selectedAccountId = null;
  }

  handleClose() {
    this.dispatchEvent(new CustomEvent("close"));
  }

  handleAccountSelect(event) {
    this.selectedAccountId = event.detail.accountId;
  }

  showToast(title, message, variant) {
    const toastEvent = new ShowToastEvent({ title, message, variant });
    this.dispatchEvent(toastEvent);
  }
}
