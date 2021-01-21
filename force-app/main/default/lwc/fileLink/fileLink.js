import { LightningElement, api } from "lwc";
// Apex Methods Imports
import getRelatedRecordsByAccount from "@salesforce/apex/FileManagementController.getRelatedRecordsByAccount";
// Table Columns
const ACCOUNT_COLUMNS = [{ label: "Account Name", fieldName: "Name" }];
const CASE_COLUMNS = [
  { label: "Case Number", fieldName: "CaseNumber" },
  { label: "Type", fieldName: "Type" },
  { label: "Description", fieldName: "Description" }
];
export default class FileLink extends LightningElement {
  @api contentDocumentId;
  @api accountId;
  isLoading = true;
  error;
  // Account Table
  accountColumns = ACCOUNT_COLUMNS;
  accounts;
  // Case Table
  caseColumns = CASE_COLUMNS;
  cases;
  // Accordion active sessions
  activeSections = [];

  async connectedCallback() {
    try {
      const result = await getRelatedRecordsByAccount({
        accountId: this.accountId,
        contentDocumentId: this.contentDocumentId
      });
      if (result.accounts.length) {
        this.accounts = result.accounts.map((value) => {
          const account = value.account;
          account.contentDocumentLinkId = value.contentDocumentLinkId;
          return account;
        });
      }
      if (result.cases.length) {
        this.cases = result.cases.map((value) => {
          const caseRecord = value.caseRecord;
          caseRecord.contentDocumentLinkId = value.contentDocumentLinkId;
          return caseRecord;
        });
      }
    } catch (error) {
      this.error = error;
      console.error(error);
    }
    // Set default accordion active sessions
    if (this.accounts.length) this.activeSections.push("Accounts");
    if (this.cases.length) this.activeSections.push("Cases");
    // Set isLoading to false to stop displaying spinner
    this.isLoading = false;
  }

  handleRowSelection(event) {
    console.log(event.target.getSelectedRows());
  }
}
