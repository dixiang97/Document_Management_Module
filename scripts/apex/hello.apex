// Use .apex files to store anonymous Apex.
// You can execute anonymous Apex in VS Code by selecting the
//     apex text and running the command:
//     SFDX: Execute Anonymous Apex with Currently Selected Text
// You can also execute the entire file by running the command:
//     SFDX: Execute Anonymous Apex with Editor Contents

List<ContentVersion> cvList = new List<ContentVersion>();
Boolean fileSwitcher = true;
for(Integer i = 1; i<=200; i++){
    String title = 'File_' + i + '.txt';
    ContentVersion cv = new ContentVersion(
        Title = title,
        Description = 'File_' + i,
        VersionData = Blob.valueOf('a'),
        PathOnClient = title
    );
    if(fileSwitcher){
        cv.File_Type__c = 'Online Form';
    }else{
        cv.File_Type__c = 'SMS';
    }
    fileSwitcher = !fileSwitcher;
    cvList.add(cv);
}
insert cvList;
Set<Id> contentVersionIds = new Set<Id>();
for(contentVersion cv : cvList){
    contentVersionIds.add(cv.Id);
}
List<ContentDocumentLink> cdlList = new List<ContentDocumentLink>();
List<ContentVersion> cvList2 = [SELECT ContentDocumentId FROM ContentVersion WHERE Id IN: contentVersionIds];
for(ContentVersion cv : cvList2){
    ContentDocumentLink cdl = new ContentDocumentLink(
        LinkedEntityId = '5009D0000032mubQAA', //Hardcoded Case Id
        ContentDocumentId = cv.ContentDocumentId,
        ShareType = 'V'
    );
    cdlList.add(cdl);
}
insert cdlList;