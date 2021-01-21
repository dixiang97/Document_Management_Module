public with sharing class FileManagementController {

    /**
     * Get the related files of a record
     * @return List<ContentVersion> - list of related ContentVersion 
     */
    @AuraEnabled
    public static List<ContentVersion> getRelatedContentVersions(Id linkedEntityId){
        // LinkedEntityId Set that used to query ContentDocumentLink
        Set<Id> linkedEntityIdSet = new Set<Id>();
        linkedEntityIdSet.add(linkedEntityId);
        // Check if the sObject type equals to Case Object
        if(linkedEntityId.getSObjectType() == Case.sObjectType){
            /** Special handling for case files that are generated from emails
             * email files are not directly linked to Case via ContentDocumentLink, 
             * the files are linked to EmailMessage via ContentDocumentLink 
             */
            // Get all related emailMessage of the case record
            Map<Id,EmailMessage> emailMessageMap = new Map<Id,EmailMessage>(
                                                    [SELECT Id FROM EmailMessage 
                                                    WHERE ParentId =: linkedEntityId
                                                    WITH SECURITY_ENFORCED]);
            if(!emailMessageMap.isEmpty()){
                // Add related EmailMessageId to linkedEntityIdSet
                linkedEntityIdSet.addAll(emailMessageMap.keySet());
            }
        }
        List<ContentDocumentLink> cdlList = [SELECT ContentDocumentId
                                            FROM ContentDocumentLink 
                                            WHERE LinkedEntityId IN: linkedEntityIdSet
                                            WITH SECURITY_ENFORCED];
        if(cdlList.isEmpty()){ 
            return null; 
        } 
        else {
            Set<Id> contentDocumentIds = new Set<Id>();
            for(ContentDocumentLink cdl :cdlList){
                contentDocumentIds.add(cdl.ContentDocumentId);
            }
            // Return the latest ContentVersion for the related ContentDocument
            return [SELECT 
                    Id,
                    Title,
                    FileExtension,
                    ContentDocumentId
                    FROM ContentVersion 
                    WHERE ContentDocumentId IN: contentDocumentIds 
                    AND IsLatest = TRUE
                    WITH SECURITY_ENFORCED]; 
        }
    }

    /**
     * Get similar accounts by name
     * @return List<Account> 
     */
    @AuraEnabled(cacheable = true)
    public static List<Account> getAccountsByName(String accountName){
        String key = '%' + accountName + '%';
        return [SELECT Id, Name
                FROM Account 
                WHERE Name LIKE :key 
                WITH SECURITY_ENFORCED
                LIMIT 50];
    }

    /**
     * Get related records by account 
     * associate with ContentDocumentLink related to contentDocumentId passed
     * @return RelatedRecords - custom apex defined class
     */
    @AuraEnabled
    public static RelatedRecords getRelatedRecordsByAccount(Id accountId, Id contentDocumentId){
        Set<Id> relatedRecordIdList = new Set<Id>();
        Map<Id, Account> relatedAccountMap = new Map<Id, Account>(
                                            [SELECT Id, Name 
                                            FROM Account 
                                            WHERE Id =: accountId 
                                            WITH SECURITY_ENFORCED]);
        Map<Id, Case> relatedCaseMap = new Map<Id, Case>(
                                        [SELECT Id, CaseNumber, 
                                        Description, Type
                                        FROM Case 
                                        WHERE AccountId =: accountId
                                        WITH SECURITY_ENFORCED]);
        relatedRecordIdList.addAll(relatedAccountMap.keySet());
        relatedRecordIdList.addAll(relatedCaseMap.keySet());
        // Get ContentDocumentLink 
        List<ContentDocumentLink> cdlList = [SELECT Id, LinkedEntityId 
                                            FROM ContentDocumentLink 
                                            WHERE ContentDocumentId =: contentDocumentId 
                                            AND LinkedEntityId IN :relatedRecordIdList
                                            WITH SECURITY_ENFORCED];
        // Declare return result
        RelatedRecords relatedRecords = new RelatedRecords();
        relatedRecords.accounts = new List<AccountInfo>();
        relatedRecords.cases = new List<CaseInfo>();

        for(Account account : relatedAccountMap.values()){
            AccountInfo accInfo = new AccountInfo();
            // assign account 
            accInfo.account = account;
            // loop to check if the account is link to the ContentDocument 
            // if yes, assign contentDocumentLinkId
            for(ContentDocumentLink cdl : cdlList){
                if(cdl.LinkedEntityId == account.Id){
                    // assign contentDocumentLinkId 
                    accInfo.contentDocumentLinkId = cdl.Id;
                }
            }
            relatedRecords.accounts.add(accInfo);
        }

        // TODO : if the file is emailfile, need special handling 
        for(Case caseRecord : relatedCaseMap.values()){
            CaseInfo caseInfo = new CaseInfo();
            // assign case 
            caseInfo.caseRecord = caseRecord;
            // loop to check if the case is link to the ContentDocument 
            // if yes, assign contentDocumentLinkId
            for(ContentDocumentLink cdl : cdlList){
                if(cdl.LinkedEntityId == caseRecord.Id){
                    // assign contentDocumentLinkId 
                    caseInfo.contentDocumentLinkId = cdl.Id;
                }
            }
            relatedRecords.cases.add(caseInfo);
        }
        return relatedRecords;
    }

    public class RelatedRecords{
        @AuraEnabled public List<AccountInfo>accounts {get; set;}
        @AuraEnabled public List<CaseInfo>cases {get; set;}
    }
    public class AccountInfo{
        @AuraEnabled public Account account {get;set;}
        @AuraEnabled public Id contentDocumentLinkId {get; set;}
    }
    public class CaseInfo{
        // Use caseRecord instead of case due to "case" is reserved keyword
        @AuraEnabled public Case caseRecord {get; set;}
        @AuraEnabled public Id contentDocumentLinkId {get; set;}
    }

}