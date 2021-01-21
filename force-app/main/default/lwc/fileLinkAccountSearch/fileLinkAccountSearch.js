import { LightningElement, api } from "lwc";
// Apex Methods Imports
import getAccountsByName from "@salesforce/apex/FileManagementController.getAccountsByName";
// Table columns
const COLUMNS = [{ label: "Account Name", fieldName: "Name" }];
const NO_SEARCH_RESULT_MSG = "No result is found";

export default class FileLinkAccountSearch extends LightningElement {
  accountSearchInput;
  // Table
  columns = COLUMNS;
  accounts;
  error;
  isLoading;
  noSearchResultMsg = NO_SEARCH_RESULT_MSG;
  selectedAccountId;
  displayNoSearchResult = false;

  get isAccountsExist() {
    return Array.isArray(this.accounts) && this.accounts.length;
  }

  // When user press Enter key
  handleKeyUp(evt) {
    const isEnterKey = evt.keyCode === 13;
    if (isEnterKey) this.handleSearchAccount();
  }
  // When user type new search input, reset the displayNoSearchResult to false
  handleInputChange() {
    this.displayNoSearchResult = false;
  }

  // Perform validation on the search input and fetch similar accounts
  handleSearchAccount() {
    const searchInputComponent = this.template.querySelector(
      "lightning-input[data-name=account-name-search]"
    );
    searchInputComponent.reportValidity();
    // Only fetch accounts if the input is valid
    if (searchInputComponent.checkValidity()) {
      const searchInput = searchInputComponent.value;
      this.isLoading = true;
      getAccountsByName({
        accountName: searchInput
      })
        .then((result) => {
          this.accounts = result;
        })
        .catch((error) => {
          this.accounts = null;
          this.error = error;
          console.error(error);
        })
        .finally(() => {
          this.isLoading = false;
          this.displayNoSearchResult = !this.isAccountsExist;
        });
    }
  }

  handleRowSelection(event) {
    this.selectedAccountId = event.target.selectedRows[0];
    this.dispatchEvent(
      new CustomEvent("accountselect", {
        detail: {
          accountId: this.selectedAccountId
        }
      })
    );
  }
}
