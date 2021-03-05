public with sharing class FileReportController {
    
    // TODO: add date filter
    // TODO: handle email2case scenario
    // TODO: make it cacheable
    @AuraEnabled
    public static List<FileReportOutput> getFileReport(List<String> fileTypeFilter){
        // TODO: add date filter
        Integer year = 2020;
        Integer month = 2;
        // Get linked records Id Set
        Set<Id> linkedRecordIdSet = getLinkedRecordIdSet(year, month);
        // TODO: handle email2case scenario                  
        // If no record is found, return null
        if(linkedRecordIdSet.isEmpty()){
            return null;
        }
        // Get ContentDocumentLink records
        List<ContentDocumentLink> contentDocumentLinkList = [SELECT ContentDocumentId, 
                                                            LinkedEntityId
                                                            FROM ContentDocumentLink
                                                            WHERE LinkedEntityId IN :linkedRecordIdSet
                                                            WITH SECURITY_ENFORCED];
        // Generate ContentDocument Id set to query ContentVersion records
        Set<Id> contentDocumentIdSet = new Set<Id>();
        for(ContentDocumentLink cdl : contentDocumentLinkList){
            contentDocumentIdSet.add(cdl.ContentDocumentId);
        }

        Map<Id, ContentVersion> contentVersionMap = getContentVersionWithFilter(contentDocumentIdSet, fileTypeFilter);
        // If no file is found, return null
        if(contentVersionMap.isEmpty()){
            return null;
        }

        // Generate report output
        List<FileReportOutput> outputList = new List<FileReportOutput>();
        for(ContentVersion cv: contentVersionMap.values()){
            FileReportOutput output = new FileReportOutput();
            String contentDocumentId = cv.ContentDocumentId;
            output.contentDocumentId= contentDocumentId;
            output.contentVersionId = cv.Id;
            output.fileTitle = cv.Title;
            output.fileUrl = Url.getOrgDomainUrl().toExternalForm() + '/lightning/r/ContentDocument/' + contentDocumentId + '/view';
            output.description = cv.Description;
            output.type = cv.Type__c;
            outputList.add(output);
        }
        return outputList;
    }

    private static Set<Id> getLinkedRecordIdSet(Integer year, Integer month){
        // Get Case records
        Map<Id, Case> caseMap = new Map<Id, Case>([SELECT Id 
                                                    FROM Case 
                                                    WITH SECURITY_ENFORCED
                                                    ORDER BY CreatedDate ASC]);
                                                    /* WHERE CALENDAR_YEAR(CreatedDate) = :year 
                                                    AND CALENDAR_MONTH(CreatedDate) = :month */
        return caseMap.keySet();
    }

    private static Map<Id, ContentVersion> getContentVersionWithFilter(Set<Id> contentDocumentIdSet, List<String> fileTypeFilter){
        String query = 'SELECT Id, ContentDocumentId, Title, Type__c, Description FROM ContentVersion ';
        query += 'WHERE ContentDocumentId IN :contentDocumentIdSet AND IsLatest = true ';
        query += 'AND Type__c IN :fileTypeFilter ';
        query += 'WITH SECURITY_ENFORCED ';
        query += 'ORDER BY CreatedDate ASC';
        Map<Id, ContentVersion> contentVersionMap = new Map<Id, ContentVersion>((List<ContentVersion>)Database.query(query));
        return contentVersionMap;
    }

    public class FileReportOutput {
        @AuraEnabled public String contentDocumentId;
        @AuraEnabled public String contentVersionId;
        @AuraEnabled public String fileTitle;
        @AuraEnabled public String fileUrl;
        @AuraEnabled public String description;
        @AuraEnabled public String type;
    }

/*     Method that use CDL as table data
// ContentDocument Id to ContentVersion Id Map
        Map<Id, Id> conDocumentIdToConVersionIdMap = new Map<Id,Id>();
        for(ContentVersion cv : contentVersionMap.values()){
            conDocumentIdToConVersionIdMap.put(cv.ContentDocumentId, cv.Id);
        }            
        // Generate report output
        List<FileReportOutput> outputList = new List<FileReportOutput>();
        for(ContentDocumentLink cdl: contentDocumentLinkList){
            FileReportOutput output = new FileReportOutput();
            String contentDocumentId = cdl.ContentDocumentId;
            String contentVersionId = conDocumentIdToConVersionIdMap.get(cdl.ContentDocumentId);
            ContentVersion cv = contentVersionMap.get(contentVersionId);
            output.linkedEntityId =  cdl.LinkedEntityId;
            output.contentDocumentId= cdl.ContentDocumentId;
            output.contentVersionId = contentVersionId;
            output.fileTitle = cv.Title;
            output.fileUrl = Url.getOrgDomainUrl().toExternalForm() + '/lightning/r/ContentDocument/' + contentDocumentId + '/view';
            output.description = cv.Description;
            output.type = cv.Type__c;
            outputList.add(output);
        }
        return outputList;
 */

}
