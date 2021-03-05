import { LightningElement, api } from "lwc";

export default class TablePagination extends LightningElement {
  @api currentPage;
  @api totalPage;
  @api isFirstPage;
  @api isLastPage;

  handleNext() {
    this.dispatchEvent(new CustomEvent("next"));
  }

  handlePrevious() {
    this.dispatchEvent(new CustomEvent("previous"));
  }
}
